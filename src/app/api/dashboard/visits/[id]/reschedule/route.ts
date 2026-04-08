// src/app/api/dashboard/visits/[id]/reschedule/route.ts
// Reschedules a visit on cal.com and updates the date/time in Supabase.

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { newStart } = await req.json() // ISO string e.g. "2026-04-15T10:00:00Z"
  if (!newStart) return NextResponse.json({ error: 'Missing newStart' }, { status: 400 })

  // Fetch visit to get cal_booking_uid
  const { data: visit, error: fetchError } = await supabaseAdmin
    .from('visits')
    .select('cal_booking_uid')
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

  return NextResponse.json({ ok: true, date: dateStr, time: timeStr })
}
