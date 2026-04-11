import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { SERVICE_DURATIONS, SERVICE_BUFFER } from '@/lib/booking-config'
import { bookingConfirmedHtml } from '@/lib/emails/booking-confirmed'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { serviceSlug, date, timeUtc, staffId, duration: durationOverride } = await req.json()

  if (!serviceSlug || !date || !timeUtc || !staffId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Resolve staff name from id
  const { data: staffRow } = await supabaseAdmin
    .from('staff')
    .select('name')
    .eq('id', staffId)
    .single()
  if (!staffRow) return NextResponse.json({ error: 'Staff not found' }, { status: 404 })

  // Resolve duration
  const slugBase = serviceSlug.split('-')[0] as keyof typeof SERVICE_DURATIONS
  let duration: number = SERVICE_DURATIONS[slugBase] ?? 0
  if (duration === 0) duration = durationOverride ?? 0
  if (duration <= 0) return NextResponse.json({ error: 'Duration required' }, { status: 400 })

  // Get user profile
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('nom, nom_chien, grooming_duration')
    .eq('id', user.id)
    .single()

  // Use grooming_duration from profile for toilettage if not overridden
  if (slugBase === 'toilettage' && profile?.grooming_duration && !durationOverride) {
    duration = profile.grooming_duration
  }

  // Check: client must not already have the same service on the same day
  const { data: sameServiceSameDay } = await supabaseAdmin
    .from('visits')
    .select('id')
    .eq('profile_id', user.id)
    .eq('service', serviceSlug)
    .eq('date', date)
    .not('status', 'eq', 'cancelled')
    .limit(1)
  if (sameServiceSameDay && sameServiceSameDay.length > 0) {
    return NextResponse.json(
      { error: 'Vous avez déjà un rendez-vous pour ce service ce jour-là.' },
      { status: 409 }
    )
  }

  // Check: client must not have any overlapping visit on the same day
  // Load all non-cancelled visits for this client on this date
  const { data: existingVisits } = await supabaseAdmin
    .from('visits')
    .select('time, duration')
    .eq('profile_id', user.id)
    .eq('date', date)
    .not('status', 'eq', 'cancelled')

  if (existingVisits && existingVisits.length > 0) {
    const newStartMins = timeToMinutes(timeUtc)
    const newEndMins = newStartMins + duration + (SERVICE_BUFFER[slugBase] ?? 0)
    const hasOverlap = existingVisits.some((v) => {
      if (!v.time) return false
      const vStart = timeToMinutes(v.time.slice(0, 5))
      const vEnd = vStart + (v.duration ?? duration)
      return newStartMins < vEnd && newEndMins > vStart
    })
    if (hasOverlap) {
      return NextResponse.json(
        { error: 'Ce créneau est en conflit avec un autre rendez-vous.' },
        { status: 409 }
      )
    }
  }

  // Determine status: toilettage needs deposit, others confirmed directly
  const status = slugBase === 'toilettage' ? 'pending_deposit' : 'confirmed'

  // Insert visit
  const { data: visit, error: visitError } = await supabaseAdmin
    .from('visits')
    .insert({
      profile_id: user.id,
      service: serviceSlug,
      date,
      time: `${timeUtc}:00`, // store as HH:MM:00
      duration: duration + (SERVICE_BUFFER[slugBase] ?? 0),
      staff: staffRow.name,
      status,
      price: null,
      final_price: null,
      cal_booking_uid: null,
    })
    .select()
    .single()

  if (visitError) {
    // eslint-disable-next-line no-console
    console.error('Visit insert error:', visitError)
    return NextResponse.json({ error: visitError.message }, { status: 500 })
  }

  const startDate = new Date(`${date}T${timeUtc}:00Z`)
  const appointmentDate = startDate.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Paris',
  })

  const EMAIL_SERVICE_LABELS: Record<string, string> = {
    toilettage: 'Toilettage',
    bains: 'Bains',
    balneo: 'Balnéo',
    osteo: 'Ostéopathie',
    massage: 'Massage',
    education: 'Éducation',
    creche: 'Crèche',
  }
  const serviceName = EMAIL_SERVICE_LABELS[slugBase] ?? serviceSlug

  if (status === 'confirmed') {
    // Confirmation email to client
    try {
      await resend.emails.send({
        from: `merci murphy® <${process.env.RESEND_AUTH_FROM}>`,
        to: user.email!,
        subject: `Votre rendez-vous est confirmé chez merci murphy® 🐾`,
        html: bookingConfirmedHtml({
          clientName: profile?.nom ?? '',
          serviceName,
          appointmentDate,
        }),
      })
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Confirmation email error:', err)
    }
  }

  if (status === 'pending_deposit') {
    // Internal notification to team: toilettage booked, awaiting price + deposit link
    const internalEmail = process.env.RESEND_INTERNAL_EMAIL
    if (internalEmail) {
      const dogLine = profile?.nom_chien ? ` (${profile.nom_chien})` : ''
      try {
        await resend.emails.send({
          from: `merci murphy® <${process.env.RESEND_AUTH_FROM}>`,
          to: internalEmail,
          subject: `Nouveau toilettage — ${profile?.nom ?? user.email}${dogLine} · ${appointmentDate}`,
          html: `<p>Un toilettage a été réservé en ligne :</p>
<ul>
  <li><strong>Client :</strong> ${profile?.nom ?? user.email}${dogLine}</li>
  <li><strong>Email :</strong> ${user.email}</li>
  <li><strong>Prestataire :</strong> ${staffRow.name}</li>
  <li><strong>Date :</strong> ${appointmentDate}</li>
  <li><strong>Durée :</strong> ${duration} min</li>
</ul>
<p>Rendez-vous dans le dashboard pour saisir le prix final et envoyer le lien d'acompte.</p>`,
        })
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Internal notification email error:', err)
      }
    }
  }

  return NextResponse.json({ ok: true, visitId: visit.id, status })
}
