import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { hasDashboardAccess } from '@/lib/auth-role'
import { bookingRescheduledHtml, bookingServiceChangedHtml } from '@/lib/emails/booking-rescheduled'
import { Resend } from 'resend'
import { randomBytes } from 'crypto'

const resend = new Resend(process.env.RESEND_API_KEY)

const SERVICE_LABELS: Record<string, string> = {
  toilettage: 'Toilettage',
  bains: 'Bains',
  balneo: 'Balnéo',
  massage: 'Massage',
  osteo: 'Ostéopathie',
  education: 'Éducation',
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!hasDashboardAccess(user.email))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { date: dateStr, time: timeStr, duration, notify } = await req.json()
  if (!dateStr || !timeStr)
    return NextResponse.json({ error: 'Missing date/time' }, { status: 400 })

  // Fetch current visit to compare date/time
  const { data: visit, error: fetchError } = await supabaseAdmin
    .from('visits')
    .select('profile_id, service, date, time, deposit_amount')
    .eq('id', params.id)
    .single()

  if (fetchError || !visit) return NextResponse.json({ error: 'Visit not found' }, { status: 404 })

  // Detect if only duration changed (date + time unchanged)
  const oldDate = visit.date
  const oldTime = visit.time?.slice(0, 5) ?? ''
  const onlyDurationChanged = dateStr === oldDate && timeStr === oldTime

  // Generate respond token (only needed for reschedule, not duration-only change)
  const respondToken = onlyDurationChanged ? null : randomBytes(32).toString('hex')

  // Update visit
  const updatePayload: Record<string, unknown> = {
    date: dateStr,
    time: `${timeStr}:00`,
    respond_token: respondToken,
  }
  if (duration != null && Number(duration) > 0) updatePayload.duration = Number(duration)

  const { error: updateError } = await supabaseAdmin
    .from('visits')
    .update(updatePayload)
    .eq('id', params.id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  const slugBase = visit.service.split('-')[0]
  const serviceName = SERVICE_LABELS[slugBase] ?? visit.service

  const { data: firstDog } = await supabaseAdmin
    .from('dogs')
    .select('name')
    .eq('owner_id', visit.profile_id)
    .order('created_at', { ascending: true })
    .limit(1)
    .single()

  const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(visit.profile_id)
  const clientEmail = authUser?.user?.email

  if (clientEmail && notify) {
    const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mercimurphy.com'

    const formattedDate = new Date(`${dateStr}T${timeStr}:00`).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Paris',
    })

    if (onlyDurationChanged) {
      // Mail info simple — pas de OUI/NON
      await resend.emails
        .send({
          from: `merci murphy® <${process.env.RESEND_AUTH_FROM}>`,
          to: clientEmail,
          subject: `Modification de votre prestation chez merci murphy®`,
          html: bookingServiceChangedHtml({
            dogName: firstDog?.name ?? null,
            serviceName,
            appointmentDate: formattedDate,
            newDuration: duration != null && Number(duration) > 0 ? Number(duration) : null,
          }),
        })
        .catch(() => {})
    } else {
      // Mail nouveau créneau avec boutons OUI/NON
      await resend.emails
        .send({
          from: `merci murphy® <${process.env.RESEND_AUTH_FROM}>`,
          to: clientEmail,
          subject: `Nouveau créneau proposé chez merci murphy®`,
          html: bookingRescheduledHtml({
            dogName: firstDog?.name ?? null,
            serviceName,
            newDate: formattedDate,
            acceptUrl: `${BASE_URL}/api/booking/visit-respond?token=${respondToken}`,
          }),
        })
        .catch(() => {})
    }
  }

  return NextResponse.json({ ok: true, date: dateStr, time: `${timeStr}:00` })
}
