import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { SERVICE_DURATIONS, SERVICE_BUFFER } from '@/lib/booking-config'
import { bookingConfirmedHtml } from '@/lib/emails/booking-confirmed'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

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

  // Send confirmation email (skip for toilettage — deposit flow sends its own)
  if (status === 'confirmed') {
    const startDate = new Date(`${date}T${timeUtc}:00Z`)
    const appointmentDate = startDate.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Paris',
    })

    const SERVICE_LABELS: Record<string, string> = {
      bains: 'Bains',
      balneo: 'Balnéo',
      osteo: 'Ostéopathie',
      massage: 'Massage',
      education: 'Éducation',
    }

    try {
      await resend.emails.send({
        from: `merci murphy® <${process.env.RESEND_AUTH_FROM}>`,
        to: user.email!,
        subject: `Votre rendez-vous est confirmé chez merci murphy® 🐾`,
        html: bookingConfirmedHtml({
          clientName: profile?.nom ?? '',
          serviceName: SERVICE_LABELS[slugBase] ?? serviceSlug,
          appointmentDate,
        }),
      })
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Confirmation email error:', err)
    }
  }

  return NextResponse.json({ ok: true, visitId: visit.id, status })
}
