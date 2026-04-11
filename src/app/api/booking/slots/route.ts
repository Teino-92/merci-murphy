import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { supabaseAdmin, getVisitsForStaff } from '@/lib/supabase-admin'
import { getAvailableSlots } from '@/lib/booking-slots'
import {
  SERVICE_DURATIONS,
  SERVICE_HOURS,
  ONLINE_BOOKABLE,
  BOOKING_HORIZON_DAYS,
  BOOKING_MIN_NOTICE_MINUTES,
} from '@/lib/booking-config'
import type { Availability, TimeOff, Staff } from '@/lib/supabase-admin'

// ─── Crèche slot logic ────────────────────────────────────────────────────────
// Returns up to 4 hourly start times in the last 4 hours of the day's closing time.
// Filters out already-booked slots and slots within min-notice window.
function getCrecheSlots(
  dateStr: string,
  durationMins: number,
  bookedTimes: string[], // HH:MM already booked
  nowMs: number,
  minNotice: number
): { timeUtc: string; timeParis: string }[] {
  const dow = new Date(`${dateStr}T12:00:00Z`).getUTCDay() // 0=Sun
  const hours = SERVICE_HOURS['creche'] ?? []
  const match = hours.find((h) => h.days.includes(dow))
  if (!match) return [] // crèche closed this day

  // Parse closing time (Paris local) — convert to UTC offset (Paris is UTC+1 or UTC+2)
  // We store Paris time in SERVICE_HOURS; crèche slots are returned as Paris time for display
  // and UTC for storage. Use a simple offset: CEST (+2) Apr–Oct, CET (+1) Nov–Mar.
  const [closeH, closeM] = match.end.split(':').map(Number)
  const closeMins = closeH * 60 + closeM // Paris local minutes from midnight

  const slots: { timeUtc: string; timeParis: string }[] = []

  // 4 possible start times: closing - 4h, closing - 3h, closing - 2h, closing - 1h
  for (let offset = 4; offset >= 1; offset--) {
    const startMins = closeMins - offset * 60
    if (startMins < 0) continue
    if (startMins + durationMins > closeMins) continue // would exceed closing time

    const startH = Math.floor(startMins / 60)
    const startMinPart = startMins % 60
    const parisTime = `${String(startH).padStart(2, '0')}:${String(startMinPart).padStart(2, '0')}`

    // Convert Paris → UTC: determine DST offset for this date
    // Test if this Paris date is in CEST (UTC+2) or CET (UTC+1)
    const testDate = new Date(`${dateStr}T${parisTime}:00`)
    const parisOffsetMs = testDate.getTimezoneOffset() // local machine offset — not reliable on server
    // Use a reliable approach: format as UTC via a known Paris offset
    // Paris is UTC+1 in winter, UTC+2 in summer (last Sun Mar → last Sun Oct)
    const month = parseInt(dateStr.slice(5, 7), 10)
    const utcOffset = month >= 4 && month <= 10 ? 2 : 1 // approximate: Apr–Oct = CEST
    void parisOffsetMs // suppress unused

    const utcMins = startMins - utcOffset * 60
    const utcH = Math.floor(((utcMins + 1440) % 1440) / 60)
    const utcMin = (utcMins + 1440) % 60
    const utcTime = `${String(utcH).padStart(2, '0')}:${String(utcMin).padStart(2, '0')}`

    // Skip if already booked at this time
    if (bookedTimes.some((t) => t.slice(0, 5) === utcTime)) continue

    // Skip if within min-notice window
    const slotMs = new Date(`${dateStr}T${utcTime}:00Z`).getTime()
    if (minNotice > 0 && slotMs - nowMs < minNotice * 60 * 1000) continue

    slots.push({ timeUtc: utcTime, timeParis: parisTime })
  }

  return slots
}

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

  const slugBase = serviceSlug.split('-')[0]

  // Validate it's an online-bookable service
  const isBookable = (ONLINE_BOOKABLE as readonly string[]).includes(slugBase)
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

  // Get duration — for toilettage and crèche, caller must pass ?duration=N
  let duration = SERVICE_DURATIONS[slugBase as keyof typeof SERVICE_DURATIONS] ?? 0
  if (duration === 0) {
    duration = parseInt(searchParams.get('duration') ?? '0', 10)
  }
  if (duration <= 0) {
    return NextResponse.json({ error: 'Duration required for this service' }, { status: 400 })
  }

  const minNotice = BOOKING_MIN_NOTICE_MINUTES[slugBase] ?? 0
  const nowMs = Date.now()

  // ── Crèche: no staff, fixed hourly slots in last 4h of day ──────────────────
  if (slugBase === 'creche') {
    // Check admission_passed
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('admission_passed')
      .eq('id', user.id)
      .single()
    if (!profile?.admission_passed) {
      return NextResponse.json({ error: 'Admission required' }, { status: 403 })
    }

    // Get already-booked crèche visits for this client on this date
    const { data: existing } = await supabaseAdmin
      .from('visits')
      .select('time')
      .eq('profile_id', user.id)
      .eq('date', dateStr)
      .like('service', 'creche%')
      .not('status', 'eq', 'cancelled')

    const bookedTimes = (existing ?? []).map((v) => v.time ?? '')
    const slots = getCrecheSlots(dateStr, duration, bookedTimes, nowMs, minNotice)
    return NextResponse.json({ slots })
  }

  // ── All other services: staff-based slot engine ──────────────────────────────

  // Load active staff — optionally filtered to a single staff member
  const staffIdFilter = searchParams.get('staffId')
  let query = supabaseAdmin.from('staff').select('*').eq('active', true)
  if (staffIdFilter) query = query.eq('id', staffIdFilter)
  const { data: staffRows } = await query
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

  const allSlots = getAvailableSlots(dateStr, slugBase, duration, staffInputs)

  // Filter out slots within minimum notice window
  const slots =
    minNotice > 0
      ? allSlots.filter((slot) => {
          const slotMs = new Date(`${dateStr}T${slot.timeUtc}:00Z`).getTime()
          return slotMs - nowMs >= minNotice * 60 * 1000
        })
      : allSlots

  return NextResponse.json({ slots })
}
