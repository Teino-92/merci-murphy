import { supabaseAdmin, getVisitsForStaff, getStaffSchedule } from '@/lib/supabase-admin'
import { getAvailableSlots } from '@/lib/booking-slots'
import {
  SERVICE_HOURS,
  ONLINE_BOOKABLE,
  BOOKING_HORIZON_DAYS,
  BOOKING_MIN_NOTICE_MINUTES,
} from '@/lib/booking-config'
import type { Availability, TimeOff, Staff, StaffSchedule } from '@/lib/supabase-admin'
import type { AvailableSlot } from '@/lib/booking-slots'

export type BookableSlot = {
  timeUtc: string
  timeParis: string
  staffId?: string
  staffName?: string
}

type SlotsResult =
  | { ok: true; slots: BookableSlot[] }
  | { ok: false; status: number; error: string }

// ─── Crèche slot logic ────────────────────────────────────────────────────────
// Three fixed drop-off times: 13:30, 14:00, 14:30. Always 4h duration.
// Last pickup 18:30. Available Tue–Fri only (matching SERVICE_HOURS creche config).
function getCrecheSlots(
  dateStr: string,
  bookedTimes: string[], // HH:MM UTC already booked
  nowMs: number,
  minNotice: number
): BookableSlot[] {
  const dow = new Date(`${dateStr}T12:00:00Z`).getUTCDay() // 0=Sun
  const hours = SERVICE_HOURS['creche'] ?? []
  const match = hours.find((h) => h.days.includes(dow))
  if (!match) return [] // crèche closed this day

  const month = parseInt(dateStr.slice(5, 7), 10)
  const utcOffset = month >= 4 && month <= 10 ? 2 : 1 // Paris: CEST Apr–Oct, CET Nov–Mar

  const FIXED_PARIS_TIMES = ['13:30', '14:00', '14:30']
  const slots: BookableSlot[] = []

  for (const parisTime of FIXED_PARIS_TIMES) {
    const [h, m] = parisTime.split(':').map(Number)
    const startMins = h * 60 + m
    const utcMins = startMins - utcOffset * 60
    const utcH = Math.floor(((utcMins + 1440) % 1440) / 60)
    const utcMin = (utcMins + 1440) % 60
    const utcTime = `${String(utcH).padStart(2, '0')}:${String(utcMin).padStart(2, '0')}`

    if (bookedTimes.some((t) => t.slice(0, 5) === utcTime)) continue

    const slotMs = new Date(`${dateStr}T${utcTime}:00Z`).getTime()
    if (minNotice > 0 && slotMs - nowMs < minNotice * 60 * 1000) continue

    slots.push({ timeUtc: utcTime, timeParis: parisTime })
  }

  return slots
}

/**
 * Single source of truth for what a given client may book.
 * Used both to display slots and to validate a booking before insert.
 */
export async function computeBookableSlots(params: {
  userId: string
  slugBase: string
  dateStr: string
  duration: number
  staffId?: string | null
}): Promise<SlotsResult> {
  const { userId, slugBase, dateStr, duration, staffId } = params

  if (!(ONLINE_BOOKABLE as readonly string[]).includes(slugBase)) {
    return { ok: false, status: 400, error: 'Service not bookable online' }
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return { ok: false, status: 400, error: 'Invalid date' }
  }
  if (!Number.isFinite(duration) || duration <= 0) {
    return { ok: false, status: 400, error: 'Duration required for this service' }
  }

  // Date within horizon
  const diffDays = Math.floor((new Date(dateStr).getTime() - Date.now()) / 86400000)
  if (diffDays < 0 || diffDays > BOOKING_HORIZON_DAYS) return { ok: true, slots: [] }

  const minNotice = BOOKING_MIN_NOTICE_MINUTES[slugBase] ?? 0
  const nowMs = Date.now()

  // ── Crèche: no staff, fixed drop-off slots, admission required ──────────────
  if (slugBase === 'creche') {
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('admission_passed')
      .eq('id', userId)
      .single()
    if (!profile?.admission_passed) {
      return { ok: false, status: 403, error: 'Admission required' }
    }

    const { data: existing } = await supabaseAdmin
      .from('visits')
      .select('time')
      .eq('profile_id', userId)
      .eq('date', dateStr)
      .like('service', 'creche%')
      .not('status', 'eq', 'cancelled')

    const bookedTimes = (existing ?? []).map((v) => v.time ?? '')
    return { ok: true, slots: getCrecheSlots(dateStr, bookedTimes, nowMs, minNotice) }
  }

  // ── All other services: staff-based slot engine ──────────────────────────────
  let query = supabaseAdmin.from('staff').select('*').eq('active', true)
  if (staffId) query = query.eq('id', staffId)
  const { data: staffRows } = await query
  const staff: Staff[] = staffRows ?? []

  const staffInputs = await Promise.all(
    staff.map(async (s) => {
      const monthStart = dateStr.slice(0, 8) + '01'
      const [y, m] = dateStr.split('-').map(Number)
      const lastDay = new Date(Date.UTC(y, m, 0)).getUTCDate()
      const monthEnd = `${dateStr.slice(0, 8)}${String(lastDay).padStart(2, '0')}`
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
          .eq('date', dateStr)
          .then((r) => (r.data ?? []) as TimeOff[]),
        // For toilettage: fetch the entire month's schedule to check if monthly planning is active
        slugBase === 'toilettage'
          ? getStaffSchedule(s.id, monthStart, monthEnd).catch(() => [] as StaffSchedule[])
          : Promise.resolve([] as StaffSchedule[]),
        getVisitsForStaff(s.name, dateStr, dateStr),
      ])

      // Toilettage: schedule is always the source of truth (even if empty = no slots)
      // Other services: scheduleRows is always [] → undefined → uses availabilities
      const scheduleEntries = slugBase === 'toilettage' ? scheduleRows : undefined

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
        scheduleEntries,
      }
    })
  )

  const allSlots: AvailableSlot[] = getAvailableSlots(dateStr, slugBase, duration, staffInputs)

  const slots =
    minNotice > 0
      ? allSlots.filter((slot) => {
          const slotMs = new Date(`${dateStr}T${slot.timeUtc}:00Z`).getTime()
          return slotMs - nowMs >= minNotice * 60 * 1000
        })
      : allSlots

  return { ok: true, slots }
}
