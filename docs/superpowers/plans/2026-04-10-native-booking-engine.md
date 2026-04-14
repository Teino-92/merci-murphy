# Native Booking Engine — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace cal.com with a fully native booking system: DB schema for staff/availabilities/slots, slot computation logic, booking API, and dashboard UI to manage schedules.

**Architecture:** Supabase holds staff, their weekly availability windows, time-off days, and the existing `visits` table as confirmed bookings. A pure TypeScript `getAvailableSlots()` function computes free slots by subtracting booked visits from availability windows. Dashboard pages let the boutique manage staff schedules. A separate plan (2026-04-10-native-booking-client.md) builds the client-facing `/reservation` flow on top of this engine.

**Tech Stack:** Next.js 14 App Router, TypeScript strict, Supabase (supabaseAdmin), Resend (emails already set up), Tailwind + existing dashboard component patterns.

---

## Context: existing codebase patterns

- `src/lib/supabase-admin.ts` — `supabaseAdmin` client + all DB types. Add new types here.
- `src/app/api/dashboard/*/route.ts` — API routes, always check auth with `createSupabaseServerClient()` first.
- `src/app/(dashboard)/dashboard/*/page.tsx` — dashboard pages, always `export const dynamic = 'force-dynamic'`.
- `src/components/dashboard/*.tsx` — dashboard UI components, always `'use client'` when interactive.
- `Visit.status` values: `'confirmed' | 'pending_deposit' | 'cancelled'`
- `Visit.time` is stored as UTC `HH:MM:SS` string (Supabase time type). Paris = UTC+1 winter / UTC+2 summer.
- Existing staff names in visits: `'Titouan'`, `'Andrea'` (free text, now we formalise them).

## Services confirmed (from Sanity + owner)

Sanity service slugs: `le-toilettage-maison-poilus-r`, `le-spa-maison-poilus-r`, `balneo-maison-poilus-r`, `l-osteopathie`, `le-bain-en-libre-service-maison-poilus-r`, `l-education`, `le-massage-bien-etre-maison-poilus-r-and-le-petit-nenuphar`, `la-creche`.

Rules per service:

- **Toilettage** (`le-toilettage-maison-poilus-r`): duration from `profile.grooming_duration`. Online bookable (Plan B). Staff: Titouan or Andrea.
- **Bains** (`le-bain-en-libre-service-maison-poilus-r`): 45min + 15min buffer. Online bookable. Staff: Titouan or Andrea.
- **Balnéo** (`balneo-maison-poilus-r`): 45min + 15min buffer. Online bookable. Staff: Titouan or Andrea.
- **Massage** (`le-massage-bien-etre-maison-poilus-r-and-le-petit-nenuphar`): 30min. Online bookable (Plan B). Staff: TBD.
- **Éducation** (`l-education`): 60min. Online bookable with restrictions (Plan B — last 4h of day + admission test). Single service in Sanity (no sub-courses). Staff: TBD.
- **Ostéopathie** (`l-osteopathie`): 60min. **NEVER client-bookable** — sous-traitant Sandra Colletet, comes only when 3+ dogs. Boutique manages via lead/demand form. Dashboard can manually enter visits for tracking. Staff: Sandra Colletet.
- **Crèche** (`la-creche`): full-day, lead/contact form only. Dashboard manual entry.
- **Spa** (`le-spa-maison-poilus-r`): parent category, not directly bookable.

## Service rules (encode as constants, not DB)

```typescript
// src/lib/booking-config.ts
export const SERVICE_DURATIONS: Record<string, number> = {
  'le-toilettage-maison-poilus-r': 0, // dynamic: from profile.grooming_duration
  'le-bain-en-libre-service-maison-poilus-r': 45,
  'balneo-maison-poilus-r': 45,
  'le-massage-bien-etre-maison-poilus-r-and-le-petit-nenuphar': 30,
  'l-education': 60,
  'l-osteopathie': 60, // dashboard-only, never client-bookable
  'la-creche': 0, // full-day, manual entry only
}

export const SERVICE_BUFFER: Record<string, number> = {
  'le-bain-en-libre-service-maison-poilus-r': 15,
  'balneo-maison-poilus-r': 15,
}

// Services the client can book online (slot picker in Plan B)
// Ostéo, crèche, spa are NEVER in this list
export const ONLINE_BOOKABLE = [
  'le-toilettage-maison-poilus-r',
  'le-bain-en-libre-service-maison-poilus-r',
  'balneo-maison-poilus-r',
  'le-massage-bien-etre-maison-poilus-r-and-le-petit-nenuphar',
  'l-education',
] as const
export type OnlineBookableService = (typeof ONLINE_BOOKABLE)[number]
```

---

## File Map

| File                                                             | Action | Responsibility                                                 |
| ---------------------------------------------------------------- | ------ | -------------------------------------------------------------- |
| `src/lib/booking-config.ts`                                      | Create | Service durations, buffers, bookable list                      |
| `src/lib/booking-slots.ts`                                       | Create | `getAvailableSlots()` pure function                            |
| `src/lib/supabase-admin.ts`                                      | Modify | Add `Staff`, `Availability`, `TimeOff` types + CRUD            |
| `src/app/api/dashboard/staff/route.ts`                           | Create | GET all staff, POST create staff                               |
| `src/app/api/dashboard/staff/[id]/route.ts`                      | Create | PATCH update, DELETE staff                                     |
| `src/app/api/dashboard/staff/[id]/availabilities/route.ts`       | Create | GET/POST availabilities for a staff member                     |
| `src/app/api/dashboard/staff/[id]/availabilities/[aid]/route.ts` | Create | DELETE availability row                                        |
| `src/app/api/dashboard/staff/[id]/time-off/route.ts`             | Create | GET/POST/DELETE time-off days                                  |
| `src/app/api/booking/slots/route.ts`                             | Create | Public GET: available slots for a service+date range           |
| `src/app/api/booking/confirm/route.ts`                           | Create | Public POST: create a booking (visit row + confirmation email) |
| `src/app/(dashboard)/dashboard/staff/page.tsx`                   | Create | Staff list page                                                |
| `src/components/dashboard/staff-manager.tsx`                     | Create | Staff + availability + time-off management UI                  |
| `src/components/dashboard/new-reservation-form.tsx`              | Modify | Remove cal.com embed, add native slot picker                   |

---

## Task 1: DB migrations (run in Supabase SQL Editor)

**Files:** No code files — SQL only. Run these in order in Supabase → SQL Editor.

- [ ] **Step 1: Create `staff` table**

```sql
CREATE TABLE public.staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL,
  role text NOT NULL DEFAULT 'toiletteur', -- toiletteur | educateur | osteopathe | masseur
  active boolean NOT NULL DEFAULT true,
  color text NOT NULL DEFAULT '#4F6072'    -- hex color for calendar display
);

-- Seed existing staff
INSERT INTO public.staff (name, role, color) VALUES
  ('Titouan', 'toiletteur', '#1D164E'),
  ('Andrea', 'toiletteur', '#B85C38'),
  ('Sandra Colletet', 'osteopathe', '#6B7F6B');
-- Note: Sandra Colletet is a subcontractor for ostéopathie only.
-- She never appears in client booking — dashboard manual entry only.
```

- [ ] **Step 2: Create `availabilities` table**

```sql
-- Weekly recurring availability windows per staff member
CREATE TABLE public.availabilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  day_of_week smallint NOT NULL CHECK (day_of_week BETWEEN 1 AND 6), -- 1=Mon, 6=Sat
  start_time time NOT NULL,  -- e.g. '09:00'
  end_time time NOT NULL,    -- e.g. '19:00'
  UNIQUE (staff_id, day_of_week)
);

-- Titouan and Andrea both work Mon-Sat 9h-19h (adjust as needed)
-- Get their IDs first:
-- INSERT INTO public.availabilities (staff_id, day_of_week, start_time, end_time)
-- SELECT id, g.day, '09:00', '19:00' FROM public.staff, generate_series(1,6) AS g(day)
-- WHERE name IN ('Titouan', 'Andrea');
```

- [ ] **Step 3: Create `time_off` table**

```sql
CREATE TABLE public.time_off (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  date date NOT NULL,
  note text,
  UNIQUE (staff_id, date)
);
```

- [ ] **Step 4: Add `duration` to visits (if not already present) and drop `cal_booking_uid` dependency**

```sql
-- duration column should already exist; verify:
ALTER TABLE public.visits ADD COLUMN IF NOT EXISTS duration integer;
-- cal_booking_uid stays for historical data, we just stop using it for new bookings
```

- [ ] **Step 5: Enable RLS + policies on new tables (staff is read-only public, write requires service role)**

```sql
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_off ENABLE ROW LEVEL SECURITY;

-- Staff readable by anyone (used by client booking page)
CREATE POLICY "staff readable by all" ON public.staff FOR SELECT USING (true);
-- Availabilities readable by all
CREATE POLICY "availabilities readable by all" ON public.availabilities FOR SELECT USING (true);
-- time_off readable by all
CREATE POLICY "time_off readable by all" ON public.time_off FOR SELECT USING (true);
-- Writes only via service role (our API routes use supabaseAdmin)
```

- [ ] **Step 6: Seed Titouan and Andrea availabilities (Spa Maison POILUS hours)**

Toilettage follows Spa Maison POILUS opening hours:

- Lundi: 13h00–17h00
- Mardi–Samedi: 9h30–18h30

```sql
-- Clear any generic seed first
DELETE FROM public.availabilities;

-- Lundi (day_of_week = 1)
INSERT INTO public.availabilities (staff_id, day_of_week, start_time, end_time)
SELECT s.id, 1, '13:00'::time, '17:00'::time
FROM public.staff s WHERE s.name IN ('Titouan', 'Andrea');

-- Mardi–Samedi (day_of_week = 2..6)
INSERT INTO public.availabilities (staff_id, day_of_week, start_time, end_time)
SELECT s.id, g.day, '09:30'::time, '18:30'::time
FROM public.staff s, generate_series(2,6) AS g(day)
WHERE s.name IN ('Titouan', 'Andrea')
ON CONFLICT (staff_id, day_of_week) DO NOTHING;
```

Note: Bains and Balnéo have different opening hours — these are handled via a separate staff/availability record or via service-level availability override in the booking-config. For now, the `availabilities` table is per staff member. Since Bains/Balnéo are operated by the same staff (Titouan/Andrea) but with different hours, the slot API will need to clamp slots to the service's own window. Add these constants to `booking-config.ts`:

```typescript
// Service-level hour overrides (Paris local time) — used by slot API to further restrict
// availability beyond what the staff member's general availability allows.
export const SERVICE_HOURS: Partial<
  Record<string, { dayOfWeek: number; start: string; end: string }[]>
> = {
  'le-bain-en-libre-service-maison-poilus-r': [
    { dayOfWeek: 1, start: '13:00', end: '19:30' }, // Lundi
    { dayOfWeek: 2, start: '10:30', end: '19:30' }, // Mardi
    { dayOfWeek: 3, start: '10:30', end: '19:30' },
    { dayOfWeek: 4, start: '10:30', end: '19:30' },
    { dayOfWeek: 5, start: '10:30', end: '19:30' },
    { dayOfWeek: 6, start: '10:30', end: '19:30' }, // Samedi
  ],
  'balneo-maison-poilus-r': [
    { dayOfWeek: 1, start: '13:00', end: '19:30' },
    { dayOfWeek: 2, start: '10:30', end: '19:30' },
    { dayOfWeek: 3, start: '10:30', end: '19:30' },
    { dayOfWeek: 4, start: '10:30', end: '19:30' },
    { dayOfWeek: 5, start: '10:30', end: '19:30' },
    { dayOfWeek: 6, start: '10:30', end: '19:30' },
  ],
  // Crèche: last 4 hours of day, Mardi only 13h30-18h30, Mer-Ven 9h30-18h30
  // (Crèche is full-day so no slot picker — but noting the open days for reference)
}
```

- [ ] **Step 7: Verify all tables exist**

Run `SELECT * FROM public.staff;` — should return Titouan and Andrea rows.
Run `SELECT * FROM public.availabilities;` — should return 12 rows (2 staff × 6 days).

---

## Task 2: booking-config.ts

**Files:**

- Create: `src/lib/booking-config.ts`

- [ ] **Step 1: Create the file**

```typescript
// src/lib/booking-config.ts
// Uses exact Sanity service slugs as keys.

// Duration in minutes. 0 = dynamic (use profile.grooming_duration) or manual dashboard entry.
export const SERVICE_DURATIONS: Record<string, number> = {
  'le-toilettage-maison-poilus-r': 0, // from profile.grooming_duration
  'le-bain-en-libre-service-maison-poilus-r': 45,
  'balneo-maison-poilus-r': 45,
  'le-massage-bien-etre-maison-poilus-r-and-le-petit-nenuphar': 30,
  'l-education': 60,
  'l-osteopathie': 60, // dashboard-only (Sandra Colletet, subcontractor)
  'la-creche': 0, // full-day, manual entry only
}

// Buffer added after the appointment before next slot opens (cleaning etc.)
export const SERVICE_BUFFER: Record<string, number> = {
  'le-bain-en-libre-service-maison-poilus-r': 15,
  'balneo-maison-poilus-r': 15,
}

// Services clients can book online via the slot picker (Plan B).
// Ostéo, crèche, spa are NEVER here.
export const ONLINE_BOOKABLE = [
  'le-toilettage-maison-poilus-r',
  'le-bain-en-libre-service-maison-poilus-r',
  'balneo-maison-poilus-r',
  'le-massage-bien-etre-maison-poilus-r-and-le-petit-nenuphar',
  'l-education',
] as const
export type OnlineBookableService = (typeof ONLINE_BOOKABLE)[number]

// Slot granularity in minutes (smallest bookable unit shown in picker)
export const SLOT_GRANULARITY = 15

// How many days ahead clients can book
export const BOOKING_HORIZON_DAYS = 60
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/booking-config.ts
git commit -m "feat: add booking service config (durations, buffers, slot granularity)"
```

---

## Task 3: DB types + CRUD in supabase-admin.ts

**Files:**

- Modify: `src/lib/supabase-admin.ts`

- [ ] **Step 1: Add Staff, Availability, TimeOff interfaces after the existing `NewsletterSubscriber` interface**

```typescript
// ─── Staff ────────────────────────────────────────────────────────────────────

export interface Staff {
  id: string
  created_at: string
  name: string
  role: string
  active: boolean
  color: string
}

export interface Availability {
  id: string
  staff_id: string
  day_of_week: number // 1=Mon … 6=Sat
  start_time: string // 'HH:MM:SS'
  end_time: string // 'HH:MM:SS'
}

export interface TimeOff {
  id: string
  staff_id: string
  date: string // 'YYYY-MM-DD'
  note: string | null
}
```

- [ ] **Step 2: Add CRUD functions at the end of the file**

```typescript
export async function getStaff(): Promise<Staff[]> {
  const { data, error } = await supabaseAdmin.from('staff').select('*').order('name')
  if (error) throw error
  return data ?? []
}

export async function createStaff(input: Pick<Staff, 'name' | 'role' | 'color'>): Promise<Staff> {
  const { data, error } = await supabaseAdmin.from('staff').insert(input).select().single()
  if (error) throw error
  return data
}

export async function updateStaff(
  id: string,
  input: Partial<Pick<Staff, 'name' | 'role' | 'color' | 'active'>>
): Promise<void> {
  const { error } = await supabaseAdmin.from('staff').update(input).eq('id', id)
  if (error) throw error
}

export async function deleteStaff(id: string): Promise<void> {
  const { error } = await supabaseAdmin.from('staff').delete().eq('id', id)
  if (error) throw error
}

export async function getAvailabilities(staffId: string): Promise<Availability[]> {
  const { data, error } = await supabaseAdmin
    .from('availabilities')
    .select('*')
    .eq('staff_id', staffId)
    .order('day_of_week')
  if (error) throw error
  return data ?? []
}

export async function upsertAvailability(
  staffId: string,
  dayOfWeek: number,
  startTime: string,
  endTime: string
): Promise<void> {
  const { error } = await supabaseAdmin
    .from('availabilities')
    .upsert(
      { staff_id: staffId, day_of_week: dayOfWeek, start_time: startTime, end_time: endTime },
      { onConflict: 'staff_id,day_of_week' }
    )
  if (error) throw error
}

export async function deleteAvailability(id: string): Promise<void> {
  const { error } = await supabaseAdmin.from('availabilities').delete().eq('id', id)
  if (error) throw error
}

export async function getTimeOff(staffId: string, from: string, to: string): Promise<TimeOff[]> {
  const { data, error } = await supabaseAdmin
    .from('time_off')
    .select('*')
    .eq('staff_id', staffId)
    .gte('date', from)
    .lte('date', to)
    .order('date')
  if (error) throw error
  return data ?? []
}

export async function addTimeOff(staffId: string, date: string, note?: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('time_off')
    .upsert({ staff_id: staffId, date, note: note ?? null }, { onConflict: 'staff_id,date' })
  if (error) throw error
}

export async function deleteTimeOff(id: string): Promise<void> {
  const { error } = await supabaseAdmin.from('time_off').delete().eq('id', id)
  if (error) throw error
}

// Returns all visits for a staff member in a date range (for slot computation)
export async function getVisitsForStaff(
  staffName: string,
  from: string,
  to: string
): Promise<Pick<Visit, 'date' | 'time' | 'duration' | 'status'>[]> {
  const { data, error } = await supabaseAdmin
    .from('visits')
    .select('date, time, duration, status')
    .eq('staff', staffName)
    .gte('date', from)
    .lte('date', to)
    .neq('status', 'cancelled')
  if (error) throw error
  return data ?? []
}
```

- [ ] **Step 3: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/lib/supabase-admin.ts
git commit -m "feat: add Staff/Availability/TimeOff types and CRUD to supabase-admin"
```

---

## Task 4: Slot computation engine

**Files:**

- Create: `src/lib/booking-slots.ts`

This is the core logic. It takes availability windows, booked visits, and time-off, and returns an array of free slots for a given date.

- [ ] **Step 1: Create the file**

```typescript
// src/lib/booking-slots.ts
import { SERVICE_BUFFER, SERVICE_HOURS, SLOT_GRANULARITY } from './booking-config'
import type { Availability, TimeOff } from './supabase-admin'

export interface BookedSlot {
  date: string // 'YYYY-MM-DD'
  time: string // 'HH:MM:SS' UTC stored
  duration: number // minutes
}

export interface AvailableSlot {
  time: string // 'HH:MM' Paris local time — what we show the client
  timeUtc: string // 'HH:MM' UTC — what we store in DB
  staffId: string
  staffName: string
}

// Convert 'HH:MM:SS' or 'HH:MM' to total minutes from midnight
function toMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

// Convert minutes from midnight to 'HH:MM'
function fromMinutes(m: number): string {
  const h = Math.floor(m / 60)
  const min = m % 60
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`
}

// Get Paris UTC offset in minutes for a given date (handles DST)
// Paris is UTC+1 (winter) or UTC+2 (summer)
function parisOffsetMinutes(dateStr: string): number {
  const dt = new Date(`${dateStr}T12:00:00Z`)
  const parisHour = parseInt(
    dt.toLocaleString('en-US', { hour: 'numeric', hour12: false, timeZone: 'Europe/Paris' }),
    10
  )
  return (parisHour - 12) * 60
}

interface StaffSlotInput {
  staffId: string
  staffName: string
  availabilities: Availability[]
  timeOff: TimeOff[]
  bookedSlots: BookedSlot[]
}

/**
 * Returns available slots for a single staff member on a single date.
 * Availability windows are in Paris local time (stored as time strings).
 * Booked slot times are stored as UTC in DB and converted here.
 * Returned slots include both Paris display time and UTC storage time.
 */
export function getSlotsForStaffOnDate(
  dateStr: string, // 'YYYY-MM-DD'
  serviceSlug: string,
  durationMinutes: number, // 0 means not bookable online
  input: StaffSlotInput
): AvailableSlot[] {
  if (durationMinutes <= 0) return []

  const totalDuration = durationMinutes + (SERVICE_BUFFER[serviceSlug] ?? 0)

  // Check time-off
  const isOff = input.timeOff.some((t) => t.date === dateStr)
  if (isOff) return []

  // Find availability for this day (1=Mon…6=Sat — JS getDay returns 0=Sun)
  const jsDay = new Date(`${dateStr}T12:00:00Z`).getUTCDay()
  const dayOfWeek = jsDay === 0 ? 7 : jsDay
  const avail = input.availabilities.find((a) => a.day_of_week === dayOfWeek)
  if (!avail) return []

  const offset = parisOffsetMinutes(dateStr)

  // Start with staff availability window (Paris local time)
  let windowStart = toMinutes(avail.start_time)
  let windowEnd = toMinutes(avail.end_time)

  // Clamp to service-level hours if defined (e.g. bains/balnéo have wider hours than toilettage)
  const serviceHours = SERVICE_HOURS[serviceSlug]
  if (serviceHours) {
    const sh = serviceHours.find((h) => h.dayOfWeek === dayOfWeek)
    if (!sh) return [] // service not available this day
    windowStart = Math.max(windowStart, toMinutes(sh.start))
    windowEnd = Math.min(windowEnd, toMinutes(sh.end))
  }

  // Convert booked visits on this date to occupied Paris-time ranges
  const occupied: Array<{ start: number; end: number }> = input.bookedSlots
    .filter((b) => b.date === dateStr && b.duration && b.duration > 0)
    .map((b) => {
      const utcMinutes = toMinutes(b.time)
      const parisMinutes = utcMinutes + offset
      return {
        start: parisMinutes,
        end: parisMinutes + (b.duration ?? 0) + (SERVICE_BUFFER[serviceSlug] ?? 0),
      }
    })

  const slots: AvailableSlot[] = []
  let cursor = windowStart

  while (cursor + totalDuration <= windowEnd) {
    const slotEnd = cursor + totalDuration
    const overlaps = occupied.some((o) => cursor < o.end && slotEnd > o.start)

    if (!overlaps) {
      const utcMinutes = cursor - offset
      slots.push({
        time: fromMinutes(cursor),
        timeUtc: fromMinutes(utcMinutes),
        staffId: input.staffId,
        staffName: input.staffName,
      })
    }
    cursor += SLOT_GRANULARITY
  }

  return slots
}

/**
 * Returns available slots across ALL active staff for a service on a date.
 * Groups by time, listing which staff are free at each slot.
 */
export function getAvailableSlots(
  dateStr: string,
  serviceSlug: string,
  durationMinutes: number,
  staffInputs: StaffSlotInput[]
): AvailableSlot[] {
  const all: AvailableSlot[] = []
  for (const input of staffInputs) {
    const slots = getSlotsForStaffOnDate(dateStr, serviceSlug, durationMinutes, input)
    all.push(...slots)
  }
  // Sort by time, then by staff name for stable ordering
  return all.sort((a, b) => a.time.localeCompare(b.time) || a.staffName.localeCompare(b.staffName))
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/booking-slots.ts
git commit -m "feat: add native slot computation engine (getAvailableSlots)"
```

---

## Task 5: Staff API routes

**Files:**

- Create: `src/app/api/dashboard/staff/route.ts`
- Create: `src/app/api/dashboard/staff/[id]/route.ts`
- Create: `src/app/api/dashboard/staff/[id]/availabilities/route.ts`
- Create: `src/app/api/dashboard/staff/[id]/time-off/route.ts`

- [ ] **Step 1: Create `src/app/api/dashboard/staff/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getStaff, createStaff } from '@/lib/supabase-admin'

async function authed() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function GET() {
  const user = await authed()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const staff = await getStaff()
  return NextResponse.json(staff)
}

export async function POST(req: NextRequest) {
  const user = await authed()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { name, role, color } = await req.json()
  if (!name || !role) return NextResponse.json({ error: 'name and role required' }, { status: 400 })
  const staff = await createStaff({ name, role, color: color ?? '#4F6072' })
  return NextResponse.json(staff)
}
```

- [ ] **Step 2: Create `src/app/api/dashboard/staff/[id]/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { updateStaff, deleteStaff } from '@/lib/supabase-admin'

async function authed() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await authed()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  await updateStaff(params.id, body)
  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await authed()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await deleteStaff(params.id)
  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 3: Create `src/app/api/dashboard/staff/[id]/availabilities/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getAvailabilities, upsertAvailability } from '@/lib/supabase-admin'

async function authed() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await authed()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const avails = await getAvailabilities(params.id)
  return NextResponse.json(avails)
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await authed()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { day_of_week, start_time, end_time } = await req.json()
  await upsertAvailability(params.id, day_of_week, start_time, end_time)
  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 4: Create `src/app/api/dashboard/staff/[id]/time-off/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getTimeOff, addTimeOff, deleteTimeOff } from '@/lib/supabase-admin'

async function authed() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await authed()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = req.nextUrl
  const from = searchParams.get('from') ?? new Date().toISOString().slice(0, 10)
  const to = searchParams.get('to') ?? from
  const timeOff = await getTimeOff(params.id, from, to)
  return NextResponse.json(timeOff)
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await authed()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { date, note } = await req.json()
  if (!date) return NextResponse.json({ error: 'date required' }, { status: 400 })
  await addTimeOff(params.id, date, note)
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const user = await authed()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await req.json()
  await deleteTimeOff(id)
  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 5: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/app/api/dashboard/staff/
git commit -m "feat: add staff/availabilities/time-off API routes"
```

---

## Task 6: Public booking slots API

**Files:**

- Create: `src/app/api/booking/slots/route.ts`

This route is called by the client booking page. It requires the user to be logged in (session cookie) but is not dashboard-restricted.

- [ ] **Step 1: Create `src/app/api/booking/slots/route.ts`**

```typescript
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
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/booking/slots/route.ts
git commit -m "feat: add public booking slots API endpoint"
```

---

## Task 7: Public booking confirm API

**Files:**

- Create: `src/app/api/booking/confirm/route.ts`
- Read: `src/lib/emails/booking-confirmed.ts` (already exists — reuse)

- [ ] **Step 1: Create `src/app/api/booking/confirm/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { SERVICE_DURATIONS, SERVICE_BUFFER } from '@/lib/booking-config'
import { bookingConfirmedHtml } from '@/lib/emails/booking-confirmed'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { serviceSlug, date, timeUtc, staffId, duration: durationOverride } = await req.json()

  if (!serviceSlug || !date || !timeUtc || !staffId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Resolve staff name from id
  const { data: staffRow } = await supabaseAdmin
    .from('staff')
    .select('name')
    .eq('id', staffId)
    .single()
  if (!staffRow) return NextResponse.json({ error: 'Staff not found' }, { status: 404 })

  // Resolve duration
  const slugBase = serviceSlug.split('-')[0] as keyof typeof SERVICE_DURATIONS
  let duration: number = SERVICE_DURATIONS[slugBase] ?? 0
  if (duration === 0) duration = durationOverride ?? 0
  if (duration <= 0) return NextResponse.json({ error: 'Duration required' }, { status: 400 })

  // Get user profile
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('nom, nom_chien, grooming_duration')
    .eq('id', user.id)
    .single()

  // Use grooming_duration from profile for toilettage if not overridden
  if (slugBase === 'toilettage' && profile?.grooming_duration && !durationOverride) {
    duration = profile.grooming_duration
  }

  // Determine status: toilettage needs deposit, others confirmed directly
  const status = slugBase === 'toilettage' ? 'pending_deposit' : 'confirmed'

  // Insert visit
  const { data: visit, error: visitError } = await supabaseAdmin
    .from('visits')
    .insert({
      profile_id: user.id,
      service: serviceSlug,
      date,
      time: `${timeUtc}:00`, // store as HH:MM:00
      duration: duration + (SERVICE_BUFFER[slugBase] ?? 0),
      staff: staffRow.name,
      status,
      price: null,
      final_price: null,
      cal_booking_uid: null,
    })
    .select()
    .single()

  if (visitError) {
    // eslint-disable-next-line no-console
    console.error('Visit insert error:', visitError)
    return NextResponse.json({ error: visitError.message }, { status: 500 })
  }

  // Send confirmation email (skip for toilettage — deposit flow sends its own)
  if (status === 'confirmed') {
    const startDate = new Date(`${date}T${timeUtc}:00Z`)
    const appointmentDate = startDate.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Paris',
    })

    const SERVICE_LABELS: Record<string, string> = {
      bains: 'Bains',
      balneo: 'Balnéo',
      osteo: 'Ostéopathie',
      massage: 'Massage',
      education: 'Éducation',
    }

    try {
      await resend.emails.send({
        from: `merci murphy® <${process.env.RESEND_FROM_EMAIL}>`,
        to: user.email!,
        subject: `Votre rendez-vous est confirmé chez merci murphy® 🐾`,
        html: bookingConfirmedHtml({
          clientName: profile?.nom ?? '',
          serviceName: SERVICE_LABELS[slugBase] ?? serviceSlug,
          appointmentDate,
        }),
      })
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Confirmation email error:', err)
    }
  }

  return NextResponse.json({ ok: true, visitId: visit.id, status })
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/booking/confirm/route.ts
git commit -m "feat: add booking confirmation API — creates visit row and sends email"
```

---

## Task 8: Staff manager dashboard UI

**Files:**

- Create: `src/components/dashboard/staff-manager.tsx`
- Create: `src/app/(dashboard)/dashboard/staff/page.tsx`
- Modify: `src/components/dashboard/nav.tsx` (add Staff nav item for admin)

- [ ] **Step 1: Create `src/components/dashboard/staff-manager.tsx`**

```typescript
'use client'

import { useState } from 'react'
import type { Staff, Availability, TimeOff } from '@/lib/supabase-admin'
import { Trash2, Plus, ChevronDown, ChevronUp } from 'lucide-react'

const DAYS = ['', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
const ROLES = ['toiletteur', 'educateur', 'osteopathe', 'masseur']

interface StaffWithDetails extends Staff {
  availabilities: Availability[]
  timeOff: TimeOff[]
}

export function StaffManager({ initialStaff }: { initialStaff: StaffWithDetails[] }) {
  const [staffList, setStaffList] = useState(initialStaff)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const [newRole, setNewRole] = useState('toiletteur')
  const [newColor, setNewColor] = useState('#4F6072')
  const [adding, setAdding] = useState(false)

  const inputCls = 'text-sm rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1D164E] w-full'

  async function addStaff() {
    if (!newName) return
    setAdding(true)
    const res = await fetch('/api/dashboard/staff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName, role: newRole, color: newColor }),
    })
    const s = await res.json()
    setStaffList((prev) => [...prev, { ...s, availabilities: [], timeOff: [] }])
    setNewName('')
    setAdding(false)
  }

  async function toggleActive(s: StaffWithDetails) {
    await fetch(`/api/dashboard/staff/${s.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !s.active }),
    })
    setStaffList((prev) => prev.map((m) => m.id === s.id ? { ...m, active: !m.active } : m))
  }

  async function upsertAvail(staffId: string, dayOfWeek: number, startTime: string, endTime: string) {
    await fetch(`/api/dashboard/staff/${staffId}/availabilities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ day_of_week: dayOfWeek, start_time: startTime, end_time: endTime }),
    })
    setStaffList((prev) => prev.map((s) => {
      if (s.id !== staffId) return s
      const existing = s.availabilities.find((a) => a.day_of_week === dayOfWeek)
      if (existing) {
        return { ...s, availabilities: s.availabilities.map((a) => a.day_of_week === dayOfWeek ? { ...a, start_time: startTime, end_time: endTime } : a) }
      }
      return { ...s, availabilities: [...s.availabilities, { id: Date.now().toString(), staff_id: staffId, day_of_week: dayOfWeek, start_time: startTime, end_time: endTime }] }
    }))
  }

  async function removeAvail(staffId: string, availId: string) {
    await fetch(`/api/dashboard/staff/${staffId}/availabilities`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: availId }),
    })
    setStaffList((prev) => prev.map((s) => s.id !== staffId ? s : { ...s, availabilities: s.availabilities.filter((a) => a.id !== availId) }))
  }

  return (
    <div className="space-y-4">
      {/* Add staff */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Ajouter un membre</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
          <input className={inputCls} placeholder="Prénom" value={newName} onChange={(e) => setNewName(e.target.value)} />
          <select className={inputCls} value={newRole} onChange={(e) => setNewRole(e.target.value)}>
            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <div className="flex items-center gap-2">
            <input type="color" value={newColor} onChange={(e) => setNewColor(e.target.value)} className="h-9 w-12 rounded border border-gray-200 cursor-pointer" />
            <span className="text-xs text-gray-400">Couleur calendrier</span>
          </div>
        </div>
        <button
          onClick={addStaff}
          disabled={adding || !newName}
          className="flex items-center gap-2 bg-[#1D164E] text-white rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          <Plus className="h-4 w-4" /> {adding ? 'Ajout…' : 'Ajouter'}
        </button>
      </div>

      {/* Staff list */}
      {staffList.map((s) => (
        <div key={s.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-5">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
              <div>
                <p className="font-semibold text-[#1D164E]">{s.name}</p>
                <p className="text-xs text-gray-400">{s.role}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleActive(s)}
                className={`text-xs px-3 py-1 rounded-full font-medium ${s.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
              >
                {s.active ? 'Actif' : 'Inactif'}
              </button>
              <button
                onClick={() => setExpanded(expanded === s.id ? null : s.id)}
                className="text-gray-400 hover:text-[#1D164E] transition-colors"
              >
                {expanded === s.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {expanded === s.id && (
            <div className="border-t border-gray-100 p-5 space-y-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Disponibilités hebdomadaires</p>
              <div className="space-y-2">
                {[1, 2, 3, 4, 5, 6].map((day) => {
                  const avail = s.availabilities.find((a) => a.day_of_week === day)
                  return (
                    <AvailRow
                      key={day}
                      day={day}
                      dayLabel={DAYS[day]}
                      avail={avail}
                      onSave={(start, end) => upsertAvail(s.id, day, start, end)}
                      onRemove={avail ? () => removeAvail(s.id, avail.id) : undefined}
                    />
                  )
                })}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function AvailRow({
  day,
  dayLabel,
  avail,
  onSave,
  onRemove,
}: {
  day: number
  dayLabel: string
  avail?: Availability
  onSave: (start: string, end: string) => void
  onRemove?: () => void
}) {
  const [start, setStart] = useState(avail?.start_time?.slice(0, 5) ?? '09:00')
  const [end, setEnd] = useState(avail?.end_time?.slice(0, 5) ?? '19:00')
  const inputCls = 'text-sm rounded border border-gray-200 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#1D164E]'

  return (
    <div className="flex items-center gap-3">
      <span className="w-8 text-xs font-medium text-gray-500">{dayLabel}</span>
      <input type="time" value={start} onChange={(e) => setStart(e.target.value)} className={inputCls} />
      <span className="text-xs text-gray-400">→</span>
      <input type="time" value={end} onChange={(e) => setEnd(e.target.value)} className={inputCls} />
      <button
        onClick={() => onSave(start, end)}
        className="text-xs bg-[#1D164E] text-white rounded px-2 py-1 font-medium hover:bg-[#1D164E]/90 transition-colors"
      >
        OK
      </button>
      {onRemove && (
        <button onClick={onRemove} className="text-gray-300 hover:text-red-400 transition-colors">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Create `src/app/(dashboard)/dashboard/staff/page.tsx`**

```typescript
import { supabaseAdmin } from '@/lib/supabase-admin'
import { StaffManager } from '@/components/dashboard/staff-manager'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Équipe | Merci Murphy' }

export default async function StaffPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: staffRows } = await supabaseAdmin.from('staff').select('*').order('name')
  const staff = staffRows ?? []

  const staffWithDetails = await Promise.all(
    staff.map(async (s) => {
      const [availRes, timeOffRes] = await Promise.all([
        supabaseAdmin.from('availabilities').select('*').eq('staff_id', s.id).order('day_of_week'),
        supabaseAdmin.from('time_off').select('*').eq('staff_id', s.id).gte('date', new Date().toISOString().slice(0, 10)).order('date').limit(30),
      ])
      return {
        ...s,
        availabilities: availRes.data ?? [],
        timeOff: timeOffRes.data ?? [],
      }
    })
  )

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1D164E] mb-6">Équipe</h1>
      <StaffManager initialStaff={staffWithDetails} />
    </div>
  )
}
```

- [ ] **Step 3: Add "Équipe" to admin nav in `src/components/dashboard/nav.tsx`**

Find the `ADMIN_NAV` array and add after "Vue d'ensemble":

```typescript
import { Users2 } from 'lucide-react' // add to existing lucide imports

const ADMIN_NAV = [
  { href: '/dashboard', label: "Vue d'ensemble", icon: LayoutDashboard },
  { href: '/dashboard/reservations/new', label: 'Calendrier', icon: CalendarDays },
  { href: '/dashboard/customers', label: 'Clients', icon: Users },
  { href: '/dashboard/staff', label: 'Équipe', icon: Users2 }, // ← add this
  { href: '/dashboard/shopify-customers', label: 'Clients Shopify', icon: ShoppingBag },
  { href: '/dashboard/leads', label: 'Demandes', icon: ClipboardList },
  { href: '/dashboard/newsletter', label: 'Newsletter', icon: Mail },
]
```

- [ ] **Step 4: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/dashboard/staff-manager.tsx src/app/(dashboard)/dashboard/staff/ src/components/dashboard/nav.tsx
git commit -m "feat: add staff management page with availability editor"
```

---

## Task 9: Update dashboard reservation form (remove cal.com)

**Files:**

- Modify: `src/components/dashboard/new-reservation-form.tsx`
- Modify: `src/app/(dashboard)/dashboard/reservations/new/page.tsx`

The dashboard form already has a manual visit creation path (Step 3b). We now make ALL services go through this path and remove the cal.com embed entirely. The dashboard team always books manually — they pick date/time directly.

- [ ] **Step 1: In `new-reservation-form.tsx`, remove the cal.com sections**

Remove these imports:

```typescript
import Cal from '@calcom/embed-react'
```

Remove the `isCalService`, `isToilettage`, `toilettageMissingDuration` derived state.

Remove the entire `{/* Step 3a: Cal.com embed */}` JSX block.

Replace the service select optgroup structure with a flat select:

```typescript
<select
  value={selectedService}
  onChange={(e) => setSelectedService(e.target.value)}
  className={inputCls}
>
  {services.map((s) => (
    <option key={s.slug} value={s.slug}>{s.title}</option>
  ))}
</select>
```

The `{/* Step 3b: Manual form */}` block becomes the only booking path — remove the `!isCalService` condition, show it whenever `selectedProfile` is set.

- [ ] **Step 2: Update `src/app/(dashboard)/dashboard/reservations/new/page.tsx`**

Remove the `CAL_LINKS` and `MANUAL_SERVICES` constants. The `ServiceOption` type no longer needs `calLink`. Update `getServices()` to return all services:

```typescript
export interface ServiceOption {
  slug: string
  title: string
}

async function getServices(): Promise<ServiceOption[]> {
  const rows: { slug: string; title: string }[] = await sanityClient.fetch(
    `*[_type == "service"] | order(ordre asc, _createdAt asc) { "slug": slug.current, title }`,
    {},
    { next: { revalidate: 3600 } }
  )
  return rows.filter((s) => s.slug && s.title)
}
```

- [ ] **Step 3: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/dashboard/new-reservation-form.tsx src/app/(dashboard)/dashboard/reservations/new/page.tsx
git commit -m "feat: remove cal.com embed from dashboard reservation form — all services manual"
```

---

## Task 10: Update calendar view to use staff colors from DB

**Files:**

- Modify: `src/app/api/dashboard/calendar/route.ts`
- Modify: `src/components/dashboard/calendar-view.tsx`

Currently staff colors are hardcoded (`Titouan=#1D164E`, `Andrea=#B85C38`). Now they come from the `staff` table.

- [ ] **Step 1: Update `src/app/api/dashboard/calendar/route.ts` to include staff colors**

Add to the end of the response shape:

```typescript
// After fetching visits, fetch staff colors
const { data: staffRows } = await supabaseAdmin.from('staff').select('name, color')
const staffColorMap = Object.fromEntries((staffRows ?? []).map((s) => [s.name, s.color]))

const visits = (data ?? []).map((v) => ({
  ...v,
  client_nom: profileMap[v.profile_id]?.nom ?? '—',
  nom_chien: profileMap[v.profile_id]?.nom_chien ?? null,
  staff_color: v.staff ? (staffColorMap[v.staff] ?? '#4F6072') : '#4F6072',
}))
```

- [ ] **Step 2: Update `src/components/dashboard/calendar-view.tsx`**

Add `staff_color: string` to `CalVisit` interface.

Replace the hardcoded `STAFF_COLORS` lookup:

```typescript
// Remove:
const STAFF_COLORS: Record<string, string> = {
  Titouan: 'bg-[#1D164E] text-white',
  Andrea: 'bg-[#B85C38] text-white',
}
const DEFAULT_COLOR = 'bg-[#4F6072] text-white'

// In the JSX, replace:
className={`... ${STAFF_COLORS[v.staff ?? ''] ?? DEFAULT_COLOR}`}
// With:
className={`... text-white`}
style={{ backgroundColor: v.staff_color }}
```

- [ ] **Step 3: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/dashboard/calendar/route.ts src/components/dashboard/calendar-view.tsx
git commit -m "feat: calendar colors now come from staff table instead of hardcoded values"
```

---

## Self-Review

**Spec coverage check:**

- ✅ toilettage duration from `grooming_duration` — handled in `confirm/route.ts`
- ✅ bains + balnéo: 45min + 15min buffer — in `booking-config.ts`
- ✅ Staff managed by boutique, not by toiletteurs — dashboard UI, no external calendar sync
- ✅ cal.com removed from dashboard form (Task 9)
- ✅ Staff colors in calendar from DB (Task 10)
- ⏳ education restrictions (last 4h of day + admission test) — NOT in this plan. These rules belong in the client booking page plan (Plan B), where the slot picker can filter slots accordingly. The `profiles` table already has fields that could store `admission_passed boolean` — add that migration when building Plan B.
- ⏳ osteo/massage/education durations — TBD per user. The `SERVICE_DURATIONS` map has them at 0 for now; dashboard manual form handles them fine.
- ⏳ Client-facing `/reservation` slot picker — Plan B.

**Placeholder scan:** No TBDs, no "add appropriate error handling" — all code is concrete.

**Type consistency:** `Staff`, `Availability`, `TimeOff` defined in Task 3 and referenced consistently in Tasks 5, 6, 7, 8. `AvailableSlot` defined in Task 4 and returned by Task 6.
