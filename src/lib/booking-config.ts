/**
 * Booking configuration for merci murphy®
 *
 * Keys are Sanity service slugs (or slug prefixes for toilettage variants).
 * All durations in minutes.
 */

// Duration of the appointment itself (not including buffer)
export const SERVICE_DURATIONS: Record<string, number> = {
  toilettage: 0, // dynamic — comes from profile.grooming_duration
  bains: 45,
  balneo: 45,
  osteo: 60,
  massage: 30,
  education: 60,
  creche: 0, // all-day — not slot-based
}

// Buffer added AFTER each appointment before the next slot opens
export const SERVICE_BUFFER: Record<string, number> = {
  toilettage: 0, // buffer already baked into grooming_duration
  bains: 15,
  balneo: 15,
  osteo: 0,
  massage: 0,
  education: 0,
  creche: 0,
}

// Opening hours override per service (Paris local time, 24h)
// If a service is NOT listed here, the staff member's own availability windows apply.
// When listed, slots are clamped to these hours regardless of staff availability.
export const SERVICE_HOURS: Record<string, { start: string; end: string; days: number[] }[]> = {
  // Toilettage — Spa POILUS hours
  // Lundi 13h00–17h00, Mardi–Samedi 9h30–18h30
  toilettage: [
    { days: [1], start: '13:00', end: '17:00' },
    { days: [2, 3, 4, 5, 6], start: '09:30', end: '18:30' },
  ],
  // Bains/Balnéo — Bains hours (longer)
  // Lundi 13h00–19h30, Mardi–Samedi 10h30–19h30
  bains: [
    { days: [1], start: '13:00', end: '19:30' },
    { days: [2, 3, 4, 5, 6], start: '10:30', end: '19:30' },
  ],
  balneo: [
    { days: [1], start: '13:00', end: '19:30' },
    { days: [2, 3, 4, 5, 6], start: '10:30', end: '19:30' },
  ],
  // Crèche — last 4 hours of crèche opening, bookable Mardi–Vendredi only
  // Mardi 13h30–18h30, Mercredi–Vendredi 9h30–18h30
  creche: [
    { days: [2], start: '13:30', end: '18:30' },
    { days: [3, 4, 5], start: '09:30', end: '18:30' },
  ],
}

// Services that clients can book online.
// osteo, education: "être rappelé" only — not self-bookable.
// creche is managed separately (all-day, not slot-based).
export const ONLINE_BOOKABLE = ['toilettage', 'bains', 'balneo', 'massage'] as const

// Slot granularity in minutes (how far apart slot start times are)
export const SLOT_GRANULARITY = 15

// Per-service granularity override — if not listed, SLOT_GRANULARITY applies
export const SERVICE_GRANULARITY: Record<string, number> = {
  toilettage: 30, // every 30min to avoid excessive slot count
}

// How many days ahead clients can book
export const BOOKING_HORIZON_DAYS = 60

// Minimum notice before appointment start (in minutes) per service.
// Slots within this window from now are hidden.
// toilettage: 2h, bains/balneo/crèche: 1h, massage: 1h
export const BOOKING_MIN_NOTICE_MINUTES: Record<string, number> = {
  toilettage: 120,
  bains: 60,
  balneo: 60,
  creche: 60,
  massage: 60,
}

// Deposit deadline rules (in hours) for pending_deposit visits.
// If the appointment is ≥ DEPOSIT_DEADLINE_LONG_THRESHOLD hours away at booking time,
// the client has DEPOSIT_DEADLINE_LONG hours to pay. Otherwise DEPOSIT_DEADLINE_SHORT.
export const DEPOSIT_DEADLINE_LONG_THRESHOLD = 24 // hours before appointment
export const DEPOSIT_DEADLINE_LONG = 24 // hours to pay
export const DEPOSIT_DEADLINE_SHORT = 12 // hours to pay
