# Monthly Staff Planning Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the fixed weekly availability system for groomers (toiletteurs) with a month-by-month schedule where the admin checks which days each groomer works and sets their hours for that day — reflected immediately in client slot availability.

**Architecture:** Add a new `staff_schedule` table (one row per groomer per worked day, with start/end times). The slot engine (`booking-slots.ts`) checks this table first for `toilettage`; if entries exist for the requested month it uses them, otherwise falls back to `availabilities`. The dashboard gets a new "Planning" tab in the staff page with a monthly calendar grid per groomer.

**Tech Stack:** Next.js 14 App Router, TypeScript strict, Supabase (supabaseAdmin), Tailwind CSS, existing dashboard patterns (`#1D164E` navy, `rounded-2xl`, `shadow-sm`).

---

## File Map

| Action     | Path                                                 | Purpose                                                              |
| ---------- | ---------------------------------------------------- | -------------------------------------------------------------------- |
| **Modify** | `src/lib/supabase-admin.ts`                          | Add `StaffSchedule` interface + CRUD helpers                         |
| **Create** | `src/app/api/dashboard/staff/[id]/schedule/route.ts` | GET + POST + DELETE for schedule entries                             |
| **Modify** | `src/lib/booking-slots.ts`                           | Accept optional `scheduleEntries` per staff, use them for toilettage |
| **Modify** | `src/app/api/booking/slots/route.ts`                 | Fetch `staff_schedule` entries and pass to slot engine               |
| **Create** | `src/components/dashboard/staff-schedule-editor.tsx` | Monthly calendar grid UI for one groomer                             |
| **Modify** | `src/components/dashboard/staff-manager.tsx`         | Add "Planning" tab, embed `StaffScheduleEditor`                      |
| **Modify** | `src/app/(dashboard)/dashboard/staff/page.tsx`       | No changes needed — StaffManager already handles state               |

---

## Task 1: Supabase migration — create `staff_schedule` table

**Files:**

- No code files — SQL to run in Supabase dashboard

- [ ] **Step 1: Run this SQL in the Supabase SQL Editor**

```sql
create table public.staff_schedule (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references public.staff(id) on delete cascade,
  date date not null,
  start_time time not null,
  end_time time not null,
  constraint staff_schedule_unique unique (staff_id, date)
);

-- Index for fast lookup by staff + date range
create index staff_schedule_staff_date on public.staff_schedule (staff_id, date);

-- RLS: service role only (same pattern as other tables)
alter table public.staff_schedule enable row level security;
create policy "Service role full access" on public.staff_schedule
  using (true) with check (true);
```

- [ ] **Step 2: Verify the table exists**

In Supabase Table Editor, confirm `staff_schedule` appears with columns: `id`, `staff_id`, `date`, `start_time`, `end_time`.

---

## Task 2: Add `StaffSchedule` type + helpers to `supabase-admin.ts`

**Files:**

- Modify: `src/lib/supabase-admin.ts` (append after the `TimeOff` section, around line 371)

- [ ] **Step 1: Add the interface and helpers**

Open `src/lib/supabase-admin.ts`. After the `deleteTimeOff` function, add:

```typescript
// --- Staff Schedule ---

export interface StaffSchedule {
  id: string
  staff_id: string
  date: string // YYYY-MM-DD
  start_time: string // HH:MM
  end_time: string // HH:MM
}

export async function getStaffSchedule(
  staffId: string,
  from: string,
  to: string
): Promise<StaffSchedule[]> {
  const { data, error } = await supabaseAdmin
    .from('staff_schedule')
    .select('*')
    .eq('staff_id', staffId)
    .gte('date', from)
    .lte('date', to)
    .order('date')
  if (error) throw error
  return (data ?? []) as StaffSchedule[]
}

export async function upsertStaffSchedule(
  staffId: string,
  date: string,
  startTime: string,
  endTime: string
): Promise<StaffSchedule> {
  const { data, error } = await supabaseAdmin
    .from('staff_schedule')
    .upsert(
      { staff_id: staffId, date, start_time: startTime, end_time: endTime },
      { onConflict: 'staff_id,date' }
    )
    .select()
    .single()
  if (error) throw error
  return data as StaffSchedule
}

export async function deleteStaffSchedule(id: string): Promise<void> {
  const { error } = await supabaseAdmin.from('staff_schedule').delete().eq('id', id)
  if (error) throw error
}
```

- [ ] **Step 2: Type-check**

```bash
cd /Users/matteogarbugli/code/merci-murphy && npx tsc --noEmit 2>&1 | head -20
```

Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/supabase-admin.ts
git commit -m "feat: add StaffSchedule type and CRUD helpers"
```

---

## Task 3: API route for staff schedule

**Files:**

- Create: `src/app/api/dashboard/staff/[id]/schedule/route.ts`

- [ ] **Step 1: Create the file**

```typescript
// src/app/api/dashboard/staff/[id]/schedule/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getStaffSchedule, upsertStaffSchedule, deleteStaffSchedule } from '@/lib/supabase-admin'
import { hasDashboardAccess } from '@/lib/auth-role'

async function requireDashboard() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user || !hasDashboardAccess(user.email)) return null
  return user
}

// GET /api/dashboard/staff/[id]/schedule?from=YYYY-MM-DD&to=YYYY-MM-DD
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireDashboard()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const from = req.nextUrl.searchParams.get('from') ?? new Date().toISOString().slice(0, 10)
  const to = req.nextUrl.searchParams.get('to') ?? from

  const schedule = await getStaffSchedule(params.id, from, to)
  return NextResponse.json(schedule)
}

// POST /api/dashboard/staff/[id]/schedule  { date, start_time, end_time }
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireDashboard()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { date, start_time, end_time } = await req.json()
  if (!date || !start_time || !end_time) {
    return NextResponse.json({ error: 'date, start_time and end_time required' }, { status: 400 })
  }
  if (start_time >= end_time) {
    return NextResponse.json({ error: 'start_time must be before end_time' }, { status: 400 })
  }

  const entry = await upsertStaffSchedule(params.id, date, start_time, end_time)
  return NextResponse.json(entry)
}

// DELETE /api/dashboard/staff/[id]/schedule  { id }
export async function DELETE(req: NextRequest, { params: _ }: { params: { id: string } }) {
  const user = await requireDashboard()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  await deleteStaffSchedule(id)
  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 2: Type-check**

```bash
cd /Users/matteogarbugli/code/merci-murphy && npx tsc --noEmit 2>&1 | head -20
```

Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/dashboard/staff/[id]/schedule/route.ts
git commit -m "feat: add staff schedule API route (GET/POST/DELETE)"
```

---

## Task 4: Update slot engine to use `staff_schedule`

**Files:**

- Modify: `src/lib/booking-slots.ts`
- Modify: `src/app/api/booking/slots/route.ts`

### 4a — Update `booking-slots.ts`

The `StaffInput` interface currently uses `availabilities: Availability[]` and `timeOff: TimeOff[]`. We add an optional `scheduleEntries` field. When present for a given date, it replaces the availability + time-off check entirely.

- [ ] **Step 1: Add `StaffSchedule` import and update `StaffInput`**

In `src/lib/booking-slots.ts`, update the imports at the top:

```typescript
import {
  SERVICE_HOURS,
  SERVICE_BUFFER,
  SLOT_GRANULARITY,
  SERVICE_GRANULARITY,
} from '@/lib/booking-config'
import type { Availability, TimeOff, StaffSchedule } from '@/lib/supabase-admin'
```

Update the `StaffInput` interface:

```typescript
interface StaffInput {
  staffId: string
  staffName: string
  availabilities: Availability[]
  timeOff: TimeOff[]
  bookedSlots: BookedSlot[]
  scheduleEntries?: StaffSchedule[] // monthly schedule — overrides availabilities when present
}
```

- [ ] **Step 2: Update `getSlotsForStaffOnDate` to use schedule entries**

Replace the function signature and the first availability/time-off check block. The full updated function:

```typescript
function getSlotsForStaffOnDate(
  staffId: string,
  staffName: string,
  dateStr: string,
  serviceSlug: string,
  durationMinutes: number,
  bufferMinutes: number,
  availabilities: Availability[],
  timeOff: TimeOff[],
  bookedSlots: BookedSlot[],
  scheduleEntries?: StaffSchedule[]
): AvailableSlot[] {
  const offsetMinutes = getParisOffsetMinutes(dateStr)

  let windowStartMins: number
  let windowEndMins: number

  if (scheduleEntries && scheduleEntries.length > 0) {
    // Use monthly schedule: find entry for this exact date
    const entry = scheduleEntries.find((e) => e.date === dateStr)
    if (!entry) return [] // not scheduled this day
    windowStartMins = timeToMinutes(entry.start_time.slice(0, 5))
    windowEndMins = timeToMinutes(entry.end_time.slice(0, 5))
  } else {
    // Fall back to weekly availability + time-off
    const hasTimeOff = timeOff.some((t) => t.date === dateStr)
    if (hasTimeOff) return []

    const dayOfWeek = getDayOfWeek(dateStr)
    const avail = availabilities.find((a) => a.day_of_week === dayOfWeek)
    if (!avail) return []

    windowStartMins = timeToMinutes(avail.start_time.slice(0, 5))
    windowEndMins = timeToMinutes(avail.end_time.slice(0, 5))
  }

  // Apply SERVICE_HOURS override if this service has one
  const dayOfWeek = getDayOfWeek(dateStr)
  const serviceHourRules = SERVICE_HOURS[serviceSlug]
  if (serviceHourRules) {
    const rule = serviceHourRules.find((r) => r.days.includes(dayOfWeek))
    if (!rule) return []
    const ruleStart = timeToMinutes(rule.start)
    const ruleEnd = timeToMinutes(rule.end)
    windowStartMins = Math.max(windowStartMins, ruleStart)
    windowEndMins = Math.min(windowEndMins, ruleEnd)
    if (windowStartMins >= windowEndMins) return []
  }

  // Build blocked intervals from booked slots
  const blockedIntervals: Array<{ start: number; end: number }> = bookedSlots
    .filter((b) => b.date === dateStr && b.time)
    .map((b) => {
      const utcTime = b.time!.slice(0, 5)
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
```

- [ ] **Step 3: Update `getAvailableSlots` to pass scheduleEntries down**

```typescript
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
      s.bookedSlots,
      s.scheduleEntries
    )
    for (const slot of slots) {
      if (!seen.has(slot.timeParis)) {
        seen.add(slot.timeParis)
        result.push(slot)
      }
    }
  }

  result.sort((a, b) => a.timeParis.localeCompare(b.timeParis))
  return result
}
```

### 4b — Update `slots/route.ts` to fetch schedule entries for toilettage

- [ ] **Step 4: Update the import in `slots/route.ts`**

In `src/app/api/booking/slots/route.ts`, add `getStaffSchedule` to the import:

```typescript
import { supabaseAdmin, getVisitsForStaff, getStaffSchedule } from '@/lib/supabase-admin'
```

- [ ] **Step 5: Fetch schedule entries for toilettage and pass to staffInputs**

In the staff-based slot section of `slots/route.ts`, replace the `staffInputs` building block:

```typescript
// Load availabilities + time-off + schedule + booked visits for each staff member
const staffInputs = await Promise.all(
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
        .eq('date', dateStr)
        .then((r) => (r.data ?? []) as TimeOff[]),
      // For toilettage: fetch the entire month's schedule to check if monthly planning is active
      slugBase === 'toilettage'
        ? getStaffSchedule(
            s.id,
            dateStr.slice(0, 8) + '01', // first day of month
            dateStr.slice(0, 8) + '31' // last possible day of month
          )
        : Promise.resolve([]),
      getVisitsForStaff(s.name, dateStr, dateStr),
    ])

    // Only use scheduleEntries if the admin has set up ANY entries for this month
    // (if empty, fall back to availabilities — backward compatible)
    const scheduleEntries = scheduleRows.length > 0 ? scheduleRows : undefined

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
```

- [ ] **Step 6: Type-check**

```bash
cd /Users/matteogarbugli/code/merci-murphy && npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add src/lib/booking-slots.ts src/app/api/booking/slots/route.ts
git commit -m "feat: slot engine uses staff_schedule for toilettage when entries exist"
```

---

## Task 5: `StaffScheduleEditor` component

**Files:**

- Create: `src/components/dashboard/staff-schedule-editor.tsx`

This is the monthly calendar grid for one groomer. Design: month header with prev/next arrows, a grid of the month's days (Mon–Sat only, matching the spa), each day is a clickable card — grey when off, navy when scheduled. Clicking an off day activates it with default hours (09:30–18:30). Clicking an active day deactivates it (with a confirm). Active days show time inputs for start/end.

- [ ] **Step 1: Create the component**

```typescript
// src/components/dashboard/staff-schedule-editor.tsx
'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { StaffSchedule } from '@/lib/supabase-admin'

interface Props {
  staffId: string
  staffName: string
}

const DAY_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
const DEFAULT_START = '09:30'
const DEFAULT_END = '18:30'

function getMonthDays(year: number, month: number): Date[] {
  const days: Date[] = []
  const d = new Date(year, month, 1)
  while (d.getMonth() === month) {
    const dow = d.getDay() // 0=Sun
    if (dow !== 0) days.push(new Date(d)) // exclude Sunday
    d.setDate(d.getDate() + 1)
  }
  return days
}

function toDateStr(d: Date): string {
  return d.toLocaleDateString('fr-CA') // YYYY-MM-DD
}

function formatMonthLabel(year: number, month: number): string {
  return new Date(year, month, 1).toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
  })
}

export function StaffScheduleEditor({ staffId, staffName }: Props) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [entries, setEntries] = useState<StaffSchedule[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null) // dateStr being saved

  const days = getMonthDays(year, month)
  const firstDay = toDateStr(new Date(year, month, 1))
  const lastDay = toDateStr(new Date(year, month + 1, 0))

  useEffect(() => {
    setLoading(true)
    fetch(`/api/dashboard/staff/${staffId}/schedule?from=${firstDay}&to=${lastDay}`)
      .then((r) => r.json())
      .then((data) => {
        setEntries(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [staffId, firstDay, lastDay])

  function getEntry(dateStr: string): StaffSchedule | undefined {
    return entries.find((e) => e.date === dateStr)
  }

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }

  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  async function toggleDay(dateStr: string) {
    const existing = getEntry(dateStr)
    if (existing) {
      // Deactivate: delete
      setSaving(dateStr)
      await fetch(`/api/dashboard/staff/${staffId}/schedule`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: existing.id }),
      })
      setEntries(prev => prev.filter(e => e.id !== existing.id))
      setSaving(null)
    } else {
      // Activate with default hours
      setSaving(dateStr)
      const res = await fetch(`/api/dashboard/staff/${staffId}/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: dateStr, start_time: DEFAULT_START, end_time: DEFAULT_END }),
      })
      const data = await res.json()
      if (res.ok) setEntries(prev => [...prev, data])
      setSaving(null)
    }
  }

  async function updateTime(
    entry: StaffSchedule,
    field: 'start_time' | 'end_time',
    value: string
  ) {
    const updated = { ...entry, [field]: value }
    // Optimistic update
    setEntries(prev => prev.map(e => e.id === entry.id ? updated : e))
    // Debounce — save after blur instead (handled in onBlur below)
  }

  async function saveTime(entry: StaffSchedule) {
    if (entry.start_time >= entry.end_time) return
    setSaving(entry.date)
    await fetch(`/api/dashboard/staff/${staffId}/schedule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: entry.date,
        start_time: entry.start_time,
        end_time: entry.end_time,
      }),
    })
    setSaving(null)
  }

  // Group days by week for grid layout
  const weeks: Date[][] = []
  let currentWeek: Date[] = []
  // Pad start of first week
  const firstDow = days[0]?.getDay() ?? 1 // 1=Mon
  const padStart = firstDow === 0 ? 6 : firstDow - 1
  for (let i = 0; i < padStart; i++) currentWeek.push(null as unknown as Date)
  for (const day of days) {
    currentWeek.push(day)
    const dow = day.getDay()
    if (dow === 6) { // Saturday = end of display week
      weeks.push(currentWeek)
      currentWeek = []
    }
  }
  if (currentWeek.length > 0) weeks.push(currentWeek)

  const inputCls = 'w-20 text-xs rounded border border-gray-200 px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-[#1D164E]'

  return (
    <div className={`transition-opacity ${loading ? 'opacity-50' : ''}`}>
      {/* Month navigator */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-[#1D164E]"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-semibold text-[#1D164E] capitalize">
          {formatMonthLabel(year, month)}
        </span>
        <button
          onClick={nextMonth}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-[#1D164E]"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-6 gap-1 mb-1">
        {DAY_LABELS.map(l => (
          <div key={l} className="text-center text-xs font-medium text-gray-400 py-1">{l}</div>
        ))}
      </div>

      {/* Weeks */}
      <div className="space-y-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-6 gap-1">
            {Array.from({ length: 6 }, (_, i) => {
              const day = week[i]
              if (!day) return <div key={i} />
              const dateStr = toDateStr(day)
              const entry = getEntry(dateStr)
              const isActive = !!entry
              const isSaving = saving === dateStr
              const isInvalid = entry && entry.start_time >= entry.end_time

              return (
                <div
                  key={dateStr}
                  className={`rounded-xl border transition-all ${
                    isActive
                      ? 'border-[#1D164E] bg-[#1D164E]'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  } ${isSaving ? 'opacity-60' : ''}`}
                >
                  {/* Day number — click to toggle */}
                  <button
                    onClick={() => toggleDay(dateStr)}
                    disabled={isSaving}
                    className={`w-full text-center py-2 text-sm font-semibold transition-colors ${
                      isActive ? 'text-white' : 'text-[#1D164E] hover:text-[#1D164E]/70'
                    }`}
                  >
                    {day.getDate()}
                  </button>

                  {/* Time inputs when active */}
                  {isActive && entry && (
                    <div className="px-1 pb-2 space-y-1">
                      <input
                        type="time"
                        value={entry.start_time.slice(0, 5)}
                        onChange={(e) => updateTime(entry, 'start_time', e.target.value)}
                        onBlur={() => saveTime(entry)}
                        className={`${inputCls} bg-white/10 text-white border-white/30 focus:ring-white/50 w-full`}
                      />
                      <input
                        type="time"
                        value={entry.end_time.slice(0, 5)}
                        onChange={(e) => updateTime(entry, 'end_time', e.target.value)}
                        onBlur={() => saveTime(entry)}
                        className={`${inputCls} ${isInvalid ? 'border-red-400' : 'bg-white/10 text-white border-white/30 focus:ring-white/50'} w-full`}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <p className="text-xs text-gray-400 mt-3">
        Cliquer sur un jour pour l&apos;activer ou désactiver · Les horaires se sauvegardent à la saisie
      </p>
    </div>
  )
}
```

- [ ] **Step 2: Type-check**

```bash
cd /Users/matteogarbugli/code/merci-murphy && npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/staff-schedule-editor.tsx
git commit -m "feat: add StaffScheduleEditor monthly calendar component"
```

---

## Task 6: Integrate into `StaffManager`

**Files:**

- Modify: `src/components/dashboard/staff-manager.tsx`

The current StaffManager has an expandable card per staff member showing "Disponibilités hebdomadaires" and "Congés & absences". We add a third section "Planning mensuel" with a tab switcher, only visible for toiletteurs (`role === 'toiletteur'`).

- [ ] **Step 1: Add the import at the top of `staff-manager.tsx`**

```typescript
import { StaffScheduleEditor } from '@/components/dashboard/staff-schedule-editor'
```

- [ ] **Step 2: Add a tab state inside the expanded staff card**

Find the section where expanded staff content is rendered. Add a local tab state by wrapping the expanded content in a sub-component or using a state keyed by staff id. The simplest approach: add a `[activeTab, setActiveTab]` state scoped per card.

Locate the per-staff expanded section — it looks like:

```tsx
{
  expanded === s.id && (
    <div className="...">
      {/* Disponibilités hebdomadaires */}
      {/* Congés & absences */}
    </div>
  )
}
```

Replace with a version that has tabs for toiletteurs:

```tsx
{
  expanded === s.id && (
    <div className="border-t border-gray-100 p-5 space-y-5">
      {s.role === 'toiletteur' && (
        <div>
          {/* Tab switcher */}
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-4 w-fit">
            {['planning', 'disponibilites', 'absences'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveStaffTab((prev) => ({ ...prev, [s.id]: tab }))}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  (activeStaffTab[s.id] ?? 'planning') === tab
                    ? 'bg-white text-[#1D164E] shadow-sm'
                    : 'text-gray-500 hover:text-[#1D164E]'
                }`}
              >
                {tab === 'planning'
                  ? 'Planning mensuel'
                  : tab === 'disponibilites'
                    ? 'Dispos hebdo'
                    : 'Absences'}
              </button>
            ))}
          </div>

          {(activeStaffTab[s.id] ?? 'planning') === 'planning' && (
            <StaffScheduleEditor staffId={s.id} staffName={s.name} />
          )}
          {(activeStaffTab[s.id] ?? 'planning') === 'disponibilites' && (
            /* existing weekly availability UI here */
            <>{/* keep existing disponibilités hebdomadaires block */}</>
          )}
          {(activeStaffTab[s.id] ?? 'planning') === 'absences' && (
            /* existing time-off UI here */
            <>{/* keep existing congés & absences block */}</>
          )}
        </div>
      )}

      {s.role !== 'toiletteur' && (
        /* Non-toiletteurs: show existing UI unchanged */
        <>
          {/* existing disponibilités hebdomadaires block */}
          {/* existing congés & absences block */}
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Add `activeStaffTab` state to the component**

At the top of the `StaffManager` component, add:

```typescript
const [activeStaffTab, setActiveStaffTab] = useState<Record<string, string>>({})
```

- [ ] **Step 4: Type-check and lint**

```bash
cd /Users/matteogarbugli/code/merci-murphy && npx tsc --noEmit 2>&1 | head -20
npm run lint 2>&1 | head -30
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/dashboard/staff-manager.tsx
git commit -m "feat: add Planning mensuel tab to toiletteur staff cards"
```

---

## Task 7: Manual smoke test + push

- [ ] **Step 1: Start dev server**

```bash
cd /Users/matteogarbugli/code/merci-murphy && npm run dev
```

- [ ] **Step 2: Test the admin flow**

1. Go to `http://localhost:3000/dashboard/staff`
2. Expand a toiletteur card — "Planning mensuel" tab should appear
3. Navigate to next month
4. Click a day → it turns navy with default hours 09:30–18:30
5. Change the end time to 17:00, click elsewhere → change should persist (reload page to verify)
6. Click the day again → it turns grey (deactivated)
7. Verify: go to the booking page as a client, pick toilettage, pick that date → slots should reflect the groomer's custom hours (or no slots if day was deactivated)

- [ ] **Step 3: Test fallback**

For a toiletteur with NO `staff_schedule` entries for a given month, booking slots should still work using the existing `availabilities` (weekly) rules.

- [ ] **Step 4: Final push**

```bash
git push
```

---

## Notes for implementer

- The `staff_schedule` table uses `YYYY-MM-DD` dates. The slot engine receives `dateStr` in the same format — no conversion needed.
- The `SERVICE_HOURS` clamping in `booking-config.ts` still applies on top of the groomer's schedule. If a groomer is set 09:00–19:00 but `SERVICE_HOURS.toilettage` caps at 18:30 on weekdays, the effective window is 09:30–18:30.
- The fallback logic is: if `scheduleEntries` array is non-empty for the requested month → use it. If empty → use `availabilities`. This means an admin who has set up even one day of monthly planning for a groomer will switch that groomer to monthly mode for the whole month.
- Sunday is excluded from the grid (spa is closed). `getMonthDays` filters `getDay() === 0`.
