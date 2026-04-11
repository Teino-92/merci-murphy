import {
  SERVICE_HOURS,
  SERVICE_BUFFER,
  SLOT_GRANULARITY,
  SERVICE_GRANULARITY,
} from '@/lib/booking-config'
import type { Availability, TimeOff } from '@/lib/supabase-admin'

export interface AvailableSlot {
  timeUtc: string // "HH:MM" in UTC — what gets stored in the DB
  timeParis: string // "HH:MM" in Paris local time — what gets shown to the user
  staffId: string
  staffName: string
}

interface BookedSlot {
  date: string
  time: string | null // "HH:MM:SS" UTC from DB
  duration: number | null // minutes (appointment only, no buffer)
}

interface StaffInput {
  staffId: string
  staffName: string
  availabilities: Availability[]
  timeOff: TimeOff[]
  bookedSlots: BookedSlot[]
}

/**
 * Convert a "HH:MM" string (Paris local) to total minutes from midnight
 */
function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

/**
 * Convert total minutes from midnight to "HH:MM" string
 */
function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/**
 * Get the Paris UTC offset in minutes for a given date.
 * Uses Intl to detect DST correctly.
 */
function getParisOffsetMinutes(dateStr: string): number {
  // Create a reference time at noon on the given date (UTC)
  const ref = new Date(`${dateStr}T12:00:00Z`)
  // Get the Paris hour for that UTC noon
  const parisHour = parseInt(
    ref.toLocaleTimeString('en-US', {
      hour: '2-digit',
      hour12: false,
      timeZone: 'Europe/Paris',
    }),
    10
  )
  // Paris offset = parisHour - 12 (hours ahead of UTC)
  return (parisHour - 12) * 60
}

/**
 * Convert a "HH:MM" UTC string to Paris local "HH:MM"
 */
function utcToParisTime(utcTime: string, offsetMinutes: number): string {
  return minutesToTime(timeToMinutes(utcTime) + offsetMinutes)
}

/**
 * Convert a "HH:MM" Paris local string to UTC "HH:MM"
 */
function parisToUtcTime(parisTime: string, offsetMinutes: number): string {
  return minutesToTime(timeToMinutes(parisTime) - offsetMinutes)
}

/**
 * Get the ISO day of week for a date string (1=Mon...7=Sun, matching JS getDay() adjusted)
 * We use 1=Mon, 2=Tue, ..., 6=Sat, 0=Sun to match our DB convention
 */
function getDayOfWeek(dateStr: string): number {
  const d = new Date(`${dateStr}T12:00:00Z`)
  const jsDay = d.getUTCDay() // 0=Sun, 1=Mon, ..., 6=Sat
  return jsDay // keep as-is: 0=Sun, 1=Mon, ..., 6=Sat
}

/**
 * Compute available slots for one staff member on one date.
 * Returns slots in Paris local time along with their UTC equivalents.
 */
function getSlotsForStaffOnDate(
  staffId: string,
  staffName: string,
  dateStr: string,
  serviceSlug: string,
  durationMinutes: number,
  bufferMinutes: number,
  availabilities: Availability[],
  timeOff: TimeOff[],
  bookedSlots: BookedSlot[]
): AvailableSlot[] {
  const dayOfWeek = getDayOfWeek(dateStr)
  const offsetMinutes = getParisOffsetMinutes(dateStr)

  // Check if staff has time off this day
  const hasTimeOff = timeOff.some((t) => t.date === dateStr)
  if (hasTimeOff) return []

  // Find staff availability for this day
  const avail = availabilities.find((a) => a.day_of_week === dayOfWeek)
  if (!avail) return []

  // Staff window in Paris local time
  let windowStartMins = timeToMinutes(avail.start_time.slice(0, 5))
  let windowEndMins = timeToMinutes(avail.end_time.slice(0, 5))

  // Apply SERVICE_HOURS override if this service has one
  const serviceHourRules = SERVICE_HOURS[serviceSlug]
  if (serviceHourRules) {
    const rule = serviceHourRules.find((r) => r.days.includes(dayOfWeek))
    if (!rule) return [] // service not available on this day at all
    // Clamp to the intersection of staff window and service hours
    const ruleStart = timeToMinutes(rule.start)
    const ruleEnd = timeToMinutes(rule.end)
    windowStartMins = Math.max(windowStartMins, ruleStart)
    windowEndMins = Math.min(windowEndMins, ruleEnd)
    if (windowStartMins >= windowEndMins) return []
  }

  // Build blocked intervals from booked slots
  // Each booked slot blocks: [bookedStartParis, bookedStartParis + duration + buffer)
  const blockedIntervals: Array<{ start: number; end: number }> = bookedSlots
    .filter((b) => b.date === dateStr && b.time)
    .map((b) => {
      const utcTime = b.time!.slice(0, 5) // "HH:MM"
      const parisTime = utcToParisTime(utcTime, offsetMinutes)
      const startMins = timeToMinutes(parisTime)
      const dur = b.duration ?? durationMinutes
      return { start: startMins, end: startMins + dur + bufferMinutes }
    })

  const granularity = SERVICE_GRANULARITY[serviceSlug] ?? SLOT_GRANULARITY
  const slots: AvailableSlot[] = []
  let cursor = windowStartMins

  while (cursor + durationMinutes <= windowEndMins) {
    const slotEnd = cursor + durationMinutes
    // Check if this slot overlaps any blocked interval
    const blocked = blockedIntervals.some(
      (interval) => cursor < interval.end && slotEnd > interval.start
    )
    if (!blocked) {
      const timeParis = minutesToTime(cursor)
      const timeUtc = parisToUtcTime(timeParis, offsetMinutes)
      slots.push({ timeUtc, timeParis, staffId, staffName })
    }
    cursor += granularity
  }

  return slots
}

/**
 * Aggregate available slots across all staff members for a given date + service.
 * De-duplicates by timeParis, keeping the first available staff member per slot.
 */
export function getAvailableSlots(
  dateStr: string,
  serviceSlug: string,
  durationMinutes: number,
  staffInputs: StaffInput[]
): AvailableSlot[] {
  const bufferMinutes = SERVICE_BUFFER[serviceSlug] ?? 0

  const seen = new Set<string>()
  const result: AvailableSlot[] = []

  for (const s of staffInputs) {
    const slots = getSlotsForStaffOnDate(
      s.staffId,
      s.staffName,
      dateStr,
      serviceSlug,
      durationMinutes,
      bufferMinutes,
      s.availabilities,
      s.timeOff,
      s.bookedSlots
    )
    for (const slot of slots) {
      if (!seen.has(slot.timeParis)) {
        seen.add(slot.timeParis)
        result.push(slot)
      }
    }
  }

  // Sort by timeParis
  result.sort((a, b) => a.timeParis.localeCompare(b.timeParis))
  return result
}
