import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { supabaseAdmin, getVisitsForStaff, getStaffSchedule } from '@/lib/supabase-admin'
import { getAvailableSlots } from '@/lib/booking-slots'
import {
  SERVICE_DURATIONS,
  SERVICE_HOURS,
  ONLINE_BOOKABLE,
  BOOKING_HORIZON_DAYS,
  BOOKING_MIN_NOTICE_MINUTES,
} from '@/lib/booking-config'
import type { Availability, TimeOff, Staff, StaffSchedule } from '@/lib/supabase-admin'

function getDaysInMonth(year: number, month: number): string[] {
  const days: string[] = []
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate()
  const mm = String(month).padStart(2, '0')
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(`${year}-${mm}-${String(d).padStart(2, '0')}`)
  }
  return days
}

function getCrecheAvailableDays(
  dates: string[],
  today: string,
  horizon: string,
  nowMs: number,
  minNotice: number
): string[] {
  return dates.filter((dateStr) => {
    if (dateStr < today || dateStr > horizon) return false
    const dow = new Date(`${dateStr}T12:00:00Z`).getUTCDay()
    const hours = SERVICE_HOURS['creche'] ?? []
    const match = hours.find((h) => h.days.includes(dow))
    if (!match) return false

    const month = parseInt(dateStr.slice(5, 7), 10)
    const utcOffset = month >= 4 && month <= 10 ? 2 : 1
    const FIXED_PARIS_TIMES = ['14:00', '14:30']
    for (const parisTime of FIXED_PARIS_TIMES) {
      const [h, m] = parisTime.split(':').map(Number)
      const startMins = h * 60 + m
      const utcMins = startMins - utcOffset * 60
      const utcH = Math.floor(((utcMins + 1440) % 1440) / 60)
      const utcMin = (utcMins + 1440) % 60
      const utcTime = `${String(utcH).padStart(2, '0')}:${String(utcMin).padStart(2, '0')}`
      const slotMs = new Date(`${dateStr}T${utcTime}:00Z`).getTime()
      if (minNotice === 0 || slotMs - nowMs >= minNotice * 60 * 1000) return true
    }
    return false
  })
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = req.nextUrl
    const serviceSlug = searchParams.get('service') ?? ''
    const monthStr = searchParams.get('month') ?? '' // YYYY-MM
    const staffIdFilter = searchParams.get('staffId') ?? null
    const durationParam = parseInt(searchParams.get('duration') ?? '0', 10)

    if (!serviceSlug || !monthStr || !/^\d{4}-\d{2}$/.test(monthStr)) {
      return NextResponse.json({ error: 'service and month (YYYY-MM) required' }, { status: 400 })
    }

    const slugBase = serviceSlug.split('-')[0]
    if (!(ONLINE_BOOKABLE as readonly string[]).includes(slugBase)) {
      return NextResponse.json({ error: 'Service not bookable online' }, { status: 400 })
    }

    const year = parseInt(monthStr.slice(0, 4), 10)
    const month = parseInt(monthStr.slice(5, 7), 10)
    const allDates = getDaysInMonth(year, month)

    const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Paris' })
    const horizonDate = new Date()
    horizonDate.setDate(horizonDate.getDate() + BOOKING_HORIZON_DAYS)
    const horizon = horizonDate.toLocaleDateString('sv-SE', { timeZone: 'Europe/Paris' })

    const minNotice = BOOKING_MIN_NOTICE_MINUTES[slugBase] ?? 0
    const nowMs = Date.now()

    // Filter to dates within today..horizon
    const candidateDates = allDates.filter((d) => d >= today && d <= horizon)

    if (candidateDates.length === 0) {
      return NextResponse.json({ availableDates: [] })
    }

    // ── Crèche: simple day-of-week check ────────────────────────────────────────
    if (slugBase === 'creche') {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('admission_passed')
        .eq('id', user.id)
        .single()
      if (!profile?.admission_passed) {
        return NextResponse.json({ availableDates: [] })
      }
      const availableDates = getCrecheAvailableDays(
        candidateDates,
        today,
        horizon,
        nowMs,
        minNotice
      )
      return NextResponse.json({ availableDates })
    }

    // ── Staff-based services ─────────────────────────────────────────────────────
    let duration = SERVICE_DURATIONS[slugBase as keyof typeof SERVICE_DURATIONS] ?? 0
    if (duration === 0) duration = durationParam
    if (duration <= 0) {
      return NextResponse.json({ error: 'Duration required for this service' }, { status: 400 })
    }

    let staffQuery = supabaseAdmin.from('staff').select('*').eq('active', true)
    if (staffIdFilter) staffQuery = staffQuery.eq('id', staffIdFilter)
    const { data: staffRows } = await staffQuery
    const staff: Staff[] = staffRows ?? []

    if (staff.length === 0) {
      return NextResponse.json({ availableDates: [] })
    }

    const monthStart = `${monthStr}-01`
    const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate()
    const monthEnd = `${monthStr}-${String(lastDay).padStart(2, '0')}`

    // Load all staff data for the full month at once
    const staffDataMap = await Promise.all(
      staff.map(async (s) => {
        const [availRows, timeOffRows, scheduleRows, visits] = await Promise.all([
          supabaseAdmin
            .from('availabilities')
            .select('*')
            .eq('staff_id', s.id)
            .then((r) => (r.data ?? []) as Availability[]),
          supabaseAdmin
            .from('time_off')
            .select('*')
            .eq('staff_id', s.id)
            .gte('date', monthStart)
            .lte('date', monthEnd)
            .then((r) => (r.data ?? []) as TimeOff[]),
          slugBase === 'toilettage'
            ? getStaffSchedule(s.id, monthStart, monthEnd).catch(() => [] as StaffSchedule[])
            : Promise.resolve([] as StaffSchedule[]),
          getVisitsForStaff(s.name, monthStart, monthEnd),
        ])
        return { s, availRows, timeOffRows, scheduleRows, visits }
      })
    )

    const availableDates: string[] = []

    for (const dateStr of candidateDates) {
      const staffInputs = staffDataMap.map(
        ({ s, availRows, timeOffRows, scheduleRows, visits }) => {
          const dayTimeOff = timeOffRows.filter((t) => t.date === dateStr)
          const scheduleEntries = slugBase === 'toilettage' ? scheduleRows : undefined
          return {
            staffId: s.id,
            staffName: s.name,
            availabilities: availRows,
            timeOff: dayTimeOff,
            bookedSlots: visits.map((v) => ({
              date: v.date,
              time: v.time ?? '00:00:00',
              duration: v.duration ?? duration,
            })),
            scheduleEntries,
          }
        }
      )

      const slots = getAvailableSlots(dateStr, slugBase, duration, staffInputs)

      const finalSlots =
        minNotice > 0
          ? slots.filter((slot) => {
              const slotMs = new Date(`${dateStr}T${slot.timeUtc}:00Z`).getTime()
              return slotMs - nowMs >= minNotice * 60 * 1000
            })
          : slots

      if (finalSlots.length > 0) {
        availableDates.push(dateStr)
      }
    }

    return NextResponse.json({ availableDates })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur serveur'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
