// src/app/api/cron/booking-reminder/route.ts
// Runs daily at 09:00 Paris time via Vercel cron.
// Finds all visits scheduled for tomorrow and sends a reminder email.

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { bookingReminderHtml } from '@/lib/emails/booking-reminder'
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

export async function GET(req: NextRequest) {
  // Protect the endpoint: Vercel cron passes this header
  const cronSecret = process.env.CRON_SECRET
  const authHeader = req.headers.get('authorization')
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Tomorrow's date in Paris time, formatted as YYYY-MM-DD
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = tomorrow.toLocaleDateString('fr-CA', { timeZone: 'Europe/Paris' }) // YYYY-MM-DD

  // Fetch visits scheduled for tomorrow that are not cancelled
  const { data: visits, error } = await supabaseAdmin
    .from('visits')
    .select('id, profile_id, service, date, time')
    .eq('date', tomorrowStr)
    .neq('status', 'cancelled')

  if (error) {
    console.error('Cron reminder query error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!visits || visits.length === 0) {
    return NextResponse.json({ ok: true, sent: 0 })
  }

  // Fetch all auth users once
  const { data: users } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 })
  const allUsers = users?.users ?? []

  let sent = 0

  for (const visit of visits) {
    // Get profile for dog name
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('nom_chien')
      .eq('id', visit.profile_id)
      .single()

    // Get email from auth user
    const authUser = allUsers.find((u) => u.id === visit.profile_id)
    if (!authUser?.email) continue

    // Format appointment date/time
    const dateTime = visit.time
      ? new Date(`${visit.date}T${visit.time.slice(0, 5)}Z`)
      : new Date(`${visit.date}T00:00:00Z`)

    const appointmentDate = dateTime.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: visit.time ? '2-digit' : undefined,
      minute: visit.time ? '2-digit' : undefined,
      timeZone: 'Europe/Paris',
    })

    const serviceName = SERVICE_LABELS[visit.service] ?? visit.service

    try {
      await resend.emails.send({
        from: `merci murphy® <${process.env.RESEND_AUTH_FROM}>`,
        to: authUser.email,
        subject: `Rappel — votre rendez-vous demain chez merci murphy® 🐾`,
        html: bookingReminderHtml({
          dogName: profile?.nom_chien ?? null,
          serviceName,
          appointmentDate,
        }),
      })
      sent++
    } catch (err) {
      console.error(`Reminder email failed for visit ${visit.id}:`, err)
    }
  }

  return NextResponse.json({ ok: true, sent, total: visits.length })
}
