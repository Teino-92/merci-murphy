// src/app/api/dashboard/visits/[id]/reschedule/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
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

  const { newStart } = await req.json()
  if (!newStart) return NextResponse.json({ error: 'Missing newStart' }, { status: 400 })

  // Fetch visit
  const { data: visit, error: fetchError } = await supabaseAdmin
    .from('visits')
    .select('cal_booking_uid, profile_id, service')
    .eq('id', params.id)
    .single()

  if (fetchError || !visit) return NextResponse.json({ error: 'Visit not found' }, { status: 404 })
  if (!visit.cal_booking_uid) {
    return NextResponse.json(
      { error: 'No cal.com booking UID — cannot reschedule' },
      { status: 400 }
    )
  }

  // Call cal.com reschedule API
  const calRes = await fetch(
    `https://api.cal.com/v1/bookings/${visit.cal_booking_uid}/reschedule`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.CAL_API_KEY}`,
      },
      body: JSON.stringify({ start: newStart }),
    }
  )

  if (!calRes.ok) {
    const body = await calRes.text()
    return NextResponse.json({ error: `cal.com error: ${body}` }, { status: 500 })
  }

  // Update Supabase visit date/time
  const newDate = new Date(newStart)
  const dateStr = newDate.toISOString().slice(0, 10)
  const timeStr = newDate.toISOString().slice(11, 16)

  await supabaseAdmin.from('visits').update({ date: dateStr, time: timeStr }).eq('id', params.id)

  // Send reschedule email to client
  const formattedDate = newDate.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Paris',
  })
  const serviceName = SERVICE_LABELS[visit.service] ?? visit.service

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('nom_chien')
    .eq('id', visit.profile_id)
    .single()

  const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(visit.profile_id)
  const clientEmail = authUser?.user?.email

  if (clientEmail) {
    await resend.emails
      .send({
        from: `merci murphy® <${process.env.RESEND_FROM_EMAIL}>`,
        to: clientEmail,
        subject: `Votre rendez-vous a été déplacé chez merci murphy® 🐾`,
        html: bookingRescheduledHtml({
          dogName: profile?.nom_chien ?? null,
          serviceName,
          newDate: formattedDate,
        }),
      })
      .catch(() => {})
  }

  return NextResponse.json({ ok: true, date: dateStr, time: timeStr })
}
