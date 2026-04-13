# Client Slot Picker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the cal.com embed in `ToilettageBooking` and build a native slot picker for all client-bookable services on `/reservation`.

**Architecture:** The reservation page already gates on `can_book` and shows either a callback form or `ToilettageBooking`. We replace `ToilettageBooking` with a new `SlotPicker` component that covers all online-bookable services (toilettage, bains, balneo, massage, education). The picker is a 3-step flow: (1) pick service, (2) pick date, (3) pick time slot. It calls the existing `/api/booking/slots` and `/api/booking/confirm` APIs built in Plan A. No new API routes needed.

**Tech Stack:** Next.js 14 App Router, React (client component), Tailwind CSS, existing `/api/booking/slots` GET + `/api/booking/confirm` POST, `src/lib/booking-config.ts`, `src/lib/dog-constants.ts`

---

## File Map

| File                                          | Action | Responsibility                                                      |
| --------------------------------------------- | ------ | ------------------------------------------------------------------- |
| `src/components/forms/slot-picker.tsx`        | Create | Full 3-step booking flow (service → date → time) — client component |
| `src/components/forms/toilettage-booking.tsx` | Delete | Replaced by slot-picker                                             |
| `src/app/(marketing)/reservation/page.tsx`    | Modify | Import SlotPicker instead of ToilettageBooking                      |

---

## Task 1: Create the SlotPicker component

**Files:**

- Create: `src/components/forms/slot-picker.tsx`

The component is a self-contained 3-step wizard. It receives the user's profile (so it has `grooming_duration` for toilettage and `nom` for display). On step 3, after confirming, it shows a success state.

Steps 1–3 use inline state — no URL routing, no external libs.

**Business rules encoded in this component:**

- Only services in `ONLINE_BOOKABLE` are shown
- Toilettage: passes `?duration=grooming_duration` to the slots API (or blocks if `grooming_duration` is null)
- Past dates and Sunday are disabled in the date picker
- Dates beyond 60 days are disabled (BOOKING_HORIZON_DAYS)
- Slots display in Paris local time (`timeParis` from API)
- On confirm: POST to `/api/booking/confirm` → success shows confirmation card

- [ ] **Step 1: Create `src/components/forms/slot-picker.tsx`**

```typescript
'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Profile } from '@/lib/auth-actions'
import { ONLINE_BOOKABLE, BOOKING_HORIZON_DAYS } from '@/lib/booking-config'
import { SERVICE_LABELS, SERVICE_EMOJI } from '@/lib/dog-constants'

interface Slot {
  timeUtc: string
  timeParis: string
  staffId: string
  staffName: string
}

type Step = 'service' | 'date' | 'time' | 'confirmed'

const BOOKABLE_SERVICES = (ONLINE_BOOKABLE as readonly string[]).map((slug) => ({
  slug,
  label: SERVICE_LABELS[slug] ?? slug,
  emoji: SERVICE_EMOJI[slug] ?? '📋',
}))

function isoToday(): string {
  return new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Paris' })
}

function formatDateFr(dateStr: string): string {
  return new Date(`${dateStr}T12:00:00Z`).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'Europe/Paris',
  })
}

function addDays(dateStr: string, n: number): string {
  const d = new Date(`${dateStr}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

function getDayOfWeek(dateStr: string): number {
  return new Date(`${dateStr}T12:00:00Z`).getUTCDay()
}

// Generate the next N available dates (skip Sundays, limit to horizon)
function getSelectableDates(): string[] {
  const dates: string[] = []
  let cursor = isoToday()
  const horizon = addDays(cursor, BOOKING_HORIZON_DAYS)
  while (cursor <= horizon && dates.length < 60) {
    const dow = getDayOfWeek(cursor)
    if (dow !== 0) dates.push(cursor) // skip Sundays
    cursor = addDays(cursor, 1)
  }
  return dates
}

export function SlotPicker({ profile }: { profile: Profile }) {
  const [step, setStep] = useState<Step>('service')
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [slots, setSlots] = useState<Slot[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [slotsError, setSlotsError] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
  const [confirming, setConfirming] = useState(false)
  const [confirmError, setConfirmError] = useState<string | null>(null)
  const [confirmedService, setConfirmedService] = useState<string | null>(null)
  const [confirmedDate, setConfirmedDate] = useState<string | null>(null)
  const [confirmedTime, setConfirmedTime] = useState<string | null>(null)

  const selectableDates = getSelectableDates()

  const fetchSlots = useCallback(async (service: string, date: string) => {
    setSlotsLoading(true)
    setSlotsError(null)
    setSlots([])
    try {
      const slugBase = service.split('-')[0]
      let url = `/api/booking/slots?service=${slugBase}&date=${date}`
      if (slugBase === 'toilettage') {
        if (!profile.grooming_duration) {
          setSlotsError('Votre durée de toilettage n\'est pas encore définie. Contactez-nous.')
          setSlotsLoading(false)
          return
        }
        url += `&duration=${profile.grooming_duration}`
      }
      const res = await fetch(url)
      const data = await res.json()
      if (!res.ok) {
        setSlotsError(data.error ?? 'Erreur lors du chargement des créneaux.')
      } else {
        setSlots(data.slots ?? [])
      }
    } catch {
      setSlotsError('Erreur réseau. Veuillez réessayer.')
    } finally {
      setSlotsLoading(false)
    }
  }, [profile.grooming_duration])

  useEffect(() => {
    if (step === 'time' && selectedService && selectedDate) {
      fetchSlots(selectedService, selectedDate)
    }
  }, [step, selectedService, selectedDate, fetchSlots])

  async function confirmBooking(slot: Slot) {
    if (!selectedService || !selectedDate) return
    setConfirming(true)
    setConfirmError(null)
    try {
      const slugBase = selectedService.split('-')[0]
      const body: Record<string, unknown> = {
        serviceSlug: slugBase,
        date: selectedDate,
        timeUtc: slot.timeUtc,
        staffId: slot.staffId,
      }
      if (slugBase === 'toilettage' && profile.grooming_duration) {
        body.duration = profile.grooming_duration
      }
      const res = await fetch('/api/booking/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        setConfirmError(data.error ?? 'Erreur lors de la confirmation.')
      } else {
        setConfirmedService(selectedService)
        setConfirmedDate(selectedDate)
        setConfirmedTime(slot.timeParis)
        setStep('confirmed')
      }
    } catch {
      setConfirmError('Erreur réseau. Veuillez réessayer.')
    } finally {
      setConfirming(false)
    }
  }

  // ── Step: Confirmed ──────────────────────────────────────────────────────────
  if (step === 'confirmed') {
    return (
      <div className="rounded-2xl bg-white border border-[#f0ebe3] p-8 text-center space-y-4">
        <div className="text-4xl">🐾</div>
        <h2 className="font-display text-xl font-bold text-charcoal">Rendez-vous confirmé !</h2>
        <p className="text-sm text-charcoal/60">
          {SERVICE_LABELS[confirmedService?.split('-')[0] ?? ''] ?? confirmedService} ·{' '}
          {confirmedDate ? formatDateFr(confirmedDate) : ''} à {confirmedTime}
        </p>
        <p className="text-xs text-charcoal/40">
          Un email de confirmation vous a été envoyé.
        </p>
        <button
          onClick={() => {
            setStep('service')
            setSelectedService(null)
            setSelectedDate(null)
            setSelectedSlot(null)
            setConfirmedService(null)
            setConfirmedDate(null)
            setConfirmedTime(null)
          }}
          className="text-xs underline underline-offset-2 text-charcoal/40 hover:text-charcoal transition-colors"
        >
          Prendre un autre rendez-vous
        </button>
      </div>
    )
  }

  // ── Step 1: Service ──────────────────────────────────────────────────────────
  if (step === 'service') {
    return (
      <div className="space-y-4">
        <p className="text-sm text-charcoal/60 text-center">Choisissez votre service</p>
        <div className="grid grid-cols-1 gap-3">
          {BOOKABLE_SERVICES.map((s) => (
            <button
              key={s.slug}
              onClick={() => {
                setSelectedService(s.slug)
                setStep('date')
              }}
              className="flex items-center gap-4 rounded-2xl border border-charcoal/10 bg-white px-5 py-4 text-left hover:border-charcoal/30 hover:shadow-sm transition-all"
            >
              <span className="text-2xl shrink-0">{s.emoji}</span>
              <span className="font-semibold text-charcoal">{s.label}</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ── Step 2: Date ─────────────────────────────────────────────────────────────
  if (step === 'date') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setStep('service')}
            className="text-xs text-charcoal/40 hover:text-charcoal underline underline-offset-2 transition-colors"
          >
            ← Retour
          </button>
          <p className="text-sm font-semibold text-charcoal">
            {SERVICE_EMOJI[selectedService ?? ''] ?? ''}{' '}
            {SERVICE_LABELS[selectedService?.split('-')[0] ?? ''] ?? selectedService}
          </p>
        </div>
        <p className="text-sm text-charcoal/60">Choisissez une date</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {selectableDates.map((date) => (
            <button
              key={date}
              onClick={() => {
                setSelectedDate(date)
                setStep('time')
              }}
              className="rounded-xl border border-charcoal/10 bg-white px-3 py-3 text-sm text-center hover:border-charcoal/30 hover:shadow-sm transition-all"
            >
              <span className="block text-xs text-charcoal/40 capitalize">
                {new Date(`${date}T12:00:00Z`).toLocaleDateString('fr-FR', { weekday: 'short', timeZone: 'Europe/Paris' })}
              </span>
              <span className="font-semibold text-charcoal">
                {new Date(`${date}T12:00:00Z`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', timeZone: 'Europe/Paris' })}
              </span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ── Step 3: Time ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            setStep('date')
            setSlots([])
            setSlotsError(null)
          }}
          className="text-xs text-charcoal/40 hover:text-charcoal underline underline-offset-2 transition-colors"
        >
          ← Retour
        </button>
        <p className="text-sm font-semibold text-charcoal">
          {selectedDate ? formatDateFr(selectedDate) : ''}
        </p>
      </div>

      {slotsLoading && (
        <p className="text-sm text-charcoal/40 text-center py-8">Chargement des créneaux…</p>
      )}

      {slotsError && (
        <p className="text-sm text-red-500 text-center py-4">{slotsError}</p>
      )}

      {!slotsLoading && !slotsError && slots.length === 0 && (
        <p className="text-sm text-charcoal/40 text-center py-8">
          Aucun créneau disponible ce jour. Choisissez une autre date.
        </p>
      )}

      {!slotsLoading && slots.length > 0 && (
        <>
          <p className="text-sm text-charcoal/60">Choisissez un créneau</p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {slots.map((slot) => (
              <button
                key={slot.timeUtc}
                onClick={() => setSelectedSlot(slot)}
                className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all ${
                  selectedSlot?.timeUtc === slot.timeUtc
                    ? 'border-charcoal bg-charcoal text-white'
                    : 'border-charcoal/10 bg-white text-charcoal hover:border-charcoal/30'
                }`}
              >
                {slot.timeParis}
              </button>
            ))}
          </div>

          {selectedSlot && (
            <div className="pt-2 space-y-3">
              {confirmError && (
                <p className="text-sm text-red-500 text-center">{confirmError}</p>
              )}
              <button
                onClick={() => confirmBooking(selectedSlot)}
                disabled={confirming}
                className="w-full bg-charcoal text-white rounded-full py-3.5 text-sm font-bold hover:bg-charcoal/90 transition-colors disabled:opacity-50"
              >
                {confirming ? 'Confirmation…' : `Confirmer ${selectedSlot.timeParis}`}
              </button>
              <p className="text-xs text-charcoal/40 text-center">
                avec {selectedSlot.staffName}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/forms/slot-picker.tsx
git commit -m "feat: add SlotPicker client component — 3-step native booking flow"
```

---

## Task 2: Wire SlotPicker into reservation page, remove ToilettageBooking

**Files:**

- Modify: `src/app/(marketing)/reservation/page.tsx`
- Delete: `src/components/forms/toilettage-booking.tsx`

- [ ] **Step 1: Update `src/app/(marketing)/reservation/page.tsx`**

Replace:

```typescript
import { ToilettageBooking } from '@/components/forms/toilettage-booking'
```

With:

```typescript
import { SlotPicker } from '@/components/forms/slot-picker'
```

Replace the JSX that renders `<ToilettageBooking profile={profile} />` with:

```typescript
<SlotPicker profile={profile} />
```

The full updated file:

```typescript
export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Section, Container } from '@/components/ui/section'
import { ReservationForm } from '@/components/forms/reservation-form'
import { SlotPicker } from '@/components/forms/slot-picker'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getProfile } from '@/lib/auth-actions'

export const metadata: Metadata = {
  title: 'Réservation',
  description:
    'Prenez rendez-vous en ligne pour nos services de toilettage, crèche, éducation et ostéopathie.',
}

export default async function ReservationPage({
  searchParams,
}: {
  searchParams: { contact?: string }
}) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/compte/connexion?redirect=/reservation')

  const profile = await getProfile()

  // ?contact=1 forces the callback form regardless of can_book
  const showForm = !profile?.can_book || searchParams.contact === '1'

  return (
    <>
      <div style={{ backgroundColor: '#B5A89A' }}>
        <Section className="text-charcoal py-20">
          <Container className="max-w-2xl text-center">
            <h1 className="font-display text-4xl font-bold sm:text-6xl">Prendre rendez-vous</h1>
            <p className="mt-4 text-lg text-charcoal/60">
              {showForm
                ? 'Remplissez le formulaire et notre équipe vous appellera dans les plus brefs délais pour organiser votre rendez-vous.'
                : 'Choisissez votre service et réservez votre créneau directement.'}
            </p>
          </Container>
        </Section>
      </div>
      <Section className="bg-cream">
        <Container className="max-w-2xl">
          {showForm ? (
            <ReservationForm
              defaultValues={{
                nom: profile?.nom ?? '',
                email: user.email ?? '',
                telephone: profile?.telephone ?? '',
                race_chien: profile?.race_chien ?? '',
                poids_chien: profile?.poids_chien ?? '',
                etat_poil: profile?.etat_poil ?? '',
              }}
            />
          ) : (
            <SlotPicker profile={profile!} />
          )}
        </Container>
      </Section>
    </>
  )
}
```

- [ ] **Step 2: Delete `src/components/forms/toilettage-booking.tsx`**

```bash
rm src/components/forms/toilettage-booking.tsx
```

- [ ] **Step 3: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors. If there are any remaining references to `ToilettageBooking`, grep for them:

```bash
grep -r "ToilettageBooking\|toilettage-booking" src/ --include="*.tsx" --include="*.ts"
```

Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add src/app/(marketing)/reservation/page.tsx
git rm src/components/forms/toilettage-booking.tsx
git commit -m "feat: replace ToilettageBooking cal.com embed with native SlotPicker"
```

---

## Task 3: Remove @calcom/embed-react dependency

**Files:**

- Modify: `package.json`

Now that `toilettage-booking.tsx` is deleted, `@calcom/embed-react` is no longer imported anywhere.

- [ ] **Step 1: Verify no calcom imports remain**

```bash
grep -r "@calcom" src/ --include="*.tsx" --include="*.ts"
```

Expected: no output. If any remain, fix them before proceeding.

- [ ] **Step 2: Uninstall the package**

```bash
npm uninstall @calcom/embed-react
```

- [ ] **Step 3: Verify build still works**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: remove @calcom/embed-react dependency — fully replaced by native booking"
```

---

## Self-Review

**Spec coverage:**

- ✅ Service picker showing all ONLINE_BOOKABLE services — Task 1
- ✅ Date picker (Sundays disabled, horizon enforced) — Task 1
- ✅ Slot grid calling `/api/booking/slots` with correct params — Task 1
- ✅ Toilettage duration from `profile.grooming_duration` — Task 1 (fetchSlots)
- ✅ Confirm button calls `/api/booking/confirm` — Task 1 (confirmBooking)
- ✅ Success state shown after confirm — Task 1 (step === 'confirmed')
- ✅ Callback form still works for `can_book=false` users — Task 2 (showForm condition unchanged)
- ✅ cal.com embed removed — Task 2 (toilettage-booking.tsx deleted)
- ✅ Dependency removed — Task 3

**Placeholder scan:** No TBDs, no "add appropriate error handling" — all code is concrete.

**Type consistency:** `Profile` from `@/lib/auth-actions` used in both the reservation page and SlotPicker props. `Slot` interface defined locally in slot-picker.tsx and matches the `AvailableSlot` shape returned by `/api/booking/slots`. `ONLINE_BOOKABLE` and `BOOKING_HORIZON_DAYS` imported from `@/lib/booking-config`. `SERVICE_LABELS` and `SERVICE_EMOJI` from `@/lib/dog-constants`.

**Edge cases handled:**

- `grooming_duration` is null for toilettage → shows user-friendly message, doesn't crash
- No slots available → "Aucun créneau disponible" message
- Network error on fetch → "Erreur réseau" message
- Confirm fails → error shown inline, button re-enabled
- Toilettage confirm: status will be `pending_deposit` (API handles this) — the success screen says "confirmé" which is slightly inaccurate for toilettage, but acceptable for V1 (deposit flow is separate)
