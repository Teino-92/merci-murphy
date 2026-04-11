import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { supabaseAdmin, getVisitsForStaff } from '@/lib/supabase-admin'
import { getAvailableSlots } from '@/lib/booking-slots'
import { SERVICE_DURATIONS, ONLINE_BOOKABLE, BOOKING_HORIZON_DAYS } from '@/lib/booking-config'
import type { Availability, TimeOff, Staff } from '@/lib/supabase-admin'

export async function GET(req: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = req.nextUrl
  const serviceSlug = searchParams.get('service') ?? ''
  const dateStr = searchParams.get('date') ?? ''

  if (!serviceSlug || !dateStr) {
    return NextResponse.json({ error: 'service and date required' }, { status: 400 })
  }

  // Validate it's an online-bookable service
  const isBookable = (ONLINE_BOOKABLE as readonly string[]).includes(serviceSlug.split('-')[0])
  if (!isBookable) {
    return NextResponse.json({ error: 'Service not bookable online' }, { status: 400 })
  }

  // Validate date is within horizon
  const today = new Date()
  const requestDate = new Date(dateStr)
  const diffDays = Math.floor((requestDate.getTime() - today.getTime()) / 86400000)
  if (diffDays < 0 || diffDays > BOOKING_HORIZON_DAYS) {
    return NextResponse.json({ slots: [] })
  }

  // Get duration — for toilettage, caller must pass ?duration=N
  const slugBase = serviceSlug.split('-')[0] as keyof typeof SERVICE_DURATIONS
  let duration = SERVICE_DURATIONS[slugBase] ?? 0
  if (duration === 0) {
    duration = parseInt(searchParams.get('duration') ?? '0', 10)
  }
  if (duration <= 0) {
    return NextResponse.json({ error: 'Duration required for this service' }, { status: 400 })
  }

  // Load all active staff
  const { data: staffRows } = await supabaseAdmin.from('staff').select('*').eq('active', true)
  const staff: Staff[] = staffRows ?? []

  // Load availabilities + time-off + booked visits for each staff member
  const staffInputs = await Promise.all(
    staff.map(async (s) => {
      const [availRows, timeOffRows, visits] = await Promise.all([
        supabaseAdmin
          .from('availabilities')
          .select('*')
          .eq('staff_id', s.id)
          .then((r) => (r.data ?? []) as Availability[]),
        supabaseAdmin
          .from('time_off')
          .select('*')
          .eq('staff_id', s.id)
          .eq('date', dateStr)
          .then((r) => (r.data ?? []) as TimeOff[]),
        getVisitsForStaff(s.name, dateStr, dateStr),
      ])
      return {
        staffId: s.id,
        staffName: s.name,
        availabilities: availRows,
        timeOff: timeOffRows,
        bookedSlots: visits.map((v) => ({
          date: v.date,
          time: v.time ?? '00:00:00',
          duration: v.duration ?? duration,
        })),
      }
    })
  )

  const slots = getAvailableSlots(dateStr, slugBase, duration, staffInputs)
  return NextResponse.json({ slots })
}
