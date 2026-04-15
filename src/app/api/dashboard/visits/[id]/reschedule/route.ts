// src/app/api/dashboard/visits/[id]/reschedule/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { hasDashboardAccess } from '@/lib/auth-role'
import { bookingRescheduledHtml } from '@/lib/emails/booking-rescheduled'
import { Resend } from 'resend'

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

  const { date: dateStr, time: timeStr } = await req.json()
  if (!dateStr || !timeStr)
    return NextResponse.json({ error: 'Missing date/time' }, { status: 400 })

  // Fetch visit
  const { data: visit, error: fetchError } = await supabaseAdmin
    .from('visits')
    .select('profile_id, service')
    .eq('id', params.id)
    .single()

  if (fetchError || !visit) return NextResponse.json({ error: 'Visit not found' }, { status: 404 })

  // Update Supabase visit date/time
  const { error: updateError } = await supabaseAdmin
    .from('visits')
    .update({ date: dateStr, time: `${timeStr}:00` })
    .eq('id', params.id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  // Format for email — treat as Paris local time
  const formattedDate = new Date(`${dateStr}T${timeStr}:00`).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Paris',
  })
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

  if (clientEmail) {
    await resend.emails
      .send({
        from: `merci murphy® <${process.env.RESEND_AUTH_FROM}>`,
        to: clientEmail,
        subject: `Votre rendez-vous a été déplacé chez merci murphy®`,
        html: bookingRescheduledHtml({
          dogName: firstDog?.name ?? null,
          serviceName,
          newDate: formattedDate,
        }),
      })
      .catch(() => {})
  }

  return NextResponse.json({ ok: true, date: dateStr, time: `${timeStr}:00` })
}
