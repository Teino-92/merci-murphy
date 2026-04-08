# Cal.com Dashboard Integration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Calendly new-tab flow in the dashboard with an inline cal.com embed for slot-based services (toilettage, bains, balnéo), add a manual log form for appointment services (massage, ostéopathie, éducation), wire a cal.com webhook to auto-create visits in Supabase, and add a 60€ SumUp deposit flow for toilettage client online bookings.

**Architecture:** The dashboard reservation form is refactored into two branches: cal.com services show a `@calcom/embed-react` widget (visit created automatically by webhook), manual services show a date/time/duration/price form. A new `POST /api/webhooks/calcom` route validates the cal.com HMAC signature and inserts visits; for toilettage client bookings it also creates a SumUp checkout and sends a deposit email. A new `POST /api/webhooks/sumup` route listens for payment completion, marks the visit confirmed, and sends a confirmation email.

**Tech Stack:** Next.js 14 App Router, TypeScript strict, `@calcom/embed-react`, Supabase service role, Resend, SumUp Checkout API, HMAC-SHA256 (`crypto` built-in)

---

## File Map

| File                                                      | Action  | Purpose                                                                            |
| --------------------------------------------------------- | ------- | ---------------------------------------------------------------------------------- |
| `src/lib/supabase-admin.ts`                               | Modify  | Add `time`, `duration`, `status` to `Visit` interface; update `addVisit` signature |
| `src/app/(dashboard)/dashboard/reservations/new/page.tsx` | Modify  | Fetch client email from auth.users; pass to form; update `ServiceOption` type      |
| `src/components/dashboard/new-reservation-form.tsx`       | Rewrite | Split into cal.com embed path vs manual form path; remove Calendly flow            |
| `src/app/api/webhooks/calcom/route.ts`                    | Create  | HMAC validation, profile lookup, visit insert, optional SumUp deposit trigger      |
| `src/app/api/webhooks/sumup/route.ts`                     | Create  | Payment confirmation, visit status update to `confirmed`, send confirmation email  |
| `src/lib/sumup.ts`                                        | Create  | `createCheckout(amount, reference, description)` → SumUp Checkout API              |
| `src/lib/emails/deposit-request.ts`                       | Create  | HTML template for 60€ deposit payment email                                        |
| `src/lib/emails/booking-confirmed.ts`                     | Create  | HTML template for booking confirmed email                                          |
| `src/app/api/dashboard/customers/[id]/visits/route.ts`    | Modify  | Accept `time`, `duration` in body; always insert with `status = 'confirmed'`       |

---

## Task 1: DB migrations — add `time`, `duration`, `status` to `visits`

**Files:**

- Modify: `src/lib/supabase-admin.ts`

- [ ] **Step 1: Run the SQL migration in Supabase SQL editor**

```sql
ALTER TABLE visits ADD COLUMN time time null;
ALTER TABLE visits ADD COLUMN duration integer null; -- minutes
ALTER TABLE visits ADD COLUMN status text not null default 'confirmed';
```

Expected: no error, `visits` table now has the three new columns.

- [ ] **Step 2: Update the `Visit` interface in `src/lib/supabase-admin.ts`**

Current interface (lines 25–34):

```typescript
export interface Visit {
  id: string
  created_at: string
  profile_id: string
  service: string
  date: string
  notes: string | null
  staff: string | null
  price: number | null
}
```

Replace with:

```typescript
export interface Visit {
  id: string
  created_at: string
  profile_id: string
  service: string
  date: string
  time: string | null // 'HH:MM'
  duration: number | null // minutes
  notes: string | null
  staff: string | null
  price: number | null
  status: 'confirmed' | 'pending_deposit' | 'cancelled'
}
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: 0 errors (the new optional fields don't break existing insert calls since the DB columns are nullable/have defaults)

- [ ] **Step 4: Commit**

```bash
git add src/lib/supabase-admin.ts
git commit -m "feat: add time, duration, status to Visit interface (DB migration applied)"
```

---

## Task 2: Install `@calcom/embed-react`

**Files:**

- Modify: `package.json` (via npm install)

- [ ] **Step 1: Install the package**

```bash
npm install @calcom/embed-react
```

Expected: package added, `node_modules/@calcom/embed-react` exists.

- [ ] **Step 2: Verify it exports a `Cal` component**

```bash
node -e "const { Cal } = require('@calcom/embed-react'); console.log(typeof Cal)"
```

Expected output: `function`

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: install @calcom/embed-react"
```

---

## Task 3: Fetch client email on reservation page

**Files:**

- Modify: `src/app/(dashboard)/dashboard/reservations/new/page.tsx`

The `Profile` type doesn't include email (it lives in `auth.users`). The reservation page must fetch it for cal.com prefill.

- [ ] **Step 1: Update `ServiceOption` type and page to pass `calLink` instead of `calendlyUrl`**

Replace the entire file `src/app/(dashboard)/dashboard/reservations/new/page.tsx`:

```typescript
import { NewReservationForm } from '@/components/dashboard/new-reservation-form'
import { sanityClient } from '@/sanity/client'

export const dynamic = 'force-dynamic'

export interface ServiceOption {
  slug: string
  title: string
  calLink: string | null   // e.g. 'merci-murphy/toilettage' — null for manual services
}

// Cal.com services — slug prefix → cal.com event slug
const CAL_LINKS: Record<string, string> = {
  toilettage: 'merci-murphy/toilettage',
  bains: 'merci-murphy/les-bains',
  balneo: 'merci-murphy/balneo',
}

// Manual services (no cal.com embed)
const MANUAL_SERVICES = new Set(['massage', 'osteo', 'education'])

async function getServices(): Promise<ServiceOption[]> {
  const rows: { slug: string; title: string }[] = await sanityClient.fetch(
    `*[_type == "service"] | order(ordre asc, _createdAt asc) { "slug": slug.current, title }`,
    {},
    { next: { revalidate: 3600 } }
  )
  // Include cal.com services + manual services; exclude crèche and parent entries
  return rows
    .filter((s) => {
      const key = Object.keys(CAL_LINKS).find((k) => s.slug.includes(k))
      return key !== undefined || MANUAL_SERVICES.has(s.slug)
    })
    .map((s) => {
      const calKey = Object.keys(CAL_LINKS).find((k) => s.slug.includes(k))
      return {
        slug: s.slug,
        title: s.title,
        calLink: calKey ? CAL_LINKS[calKey] : null,
      }
    })
}

export default async function NewReservationPage() {
  const services = await getServices()
  return <NewReservationForm services={services} />
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: 0 errors

- [ ] **Step 3: Commit**

```bash
git add src/app/(dashboard)/dashboard/reservations/new/page.tsx
git commit -m "feat: update reservation page to map Sanity slugs to cal.com links"
```

---

## Task 4: Refactor `NewReservationForm` — cal.com embed + manual form

**Files:**

- Modify: `src/components/dashboard/new-reservation-form.tsx`

This is the main UI change. Replace the Calendly open-tab + confirm flow with:

- Cal.com embed (for cal.com services)
- Manual form with date/time/duration/price/staff/notes (for manual services)

- [ ] **Step 1: Replace the entire component**

Write `src/components/dashboard/new-reservation-form.tsx`:

```typescript
'use client'

import { useState, useRef, useEffect } from 'react'
import { Cal } from '@calcom/embed-react'
import { Search, X, Check } from 'lucide-react'
import { POIDS, ETAT_POIL } from '@/lib/dog-constants'
import { useRouter } from 'next/navigation'
import type { Profile } from '@/lib/supabase-admin'
import type { ServiceOption } from '@/app/(dashboard)/dashboard/reservations/new/page'

interface NewReservationFormProps {
  services: ServiceOption[]
}

export function NewReservationForm({ services }: NewReservationFormProps) {
  const router = useRouter()
  const inputCls =
    'w-full text-sm rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1D164E]'

  // Client selection
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Profile[]>([])
  const [searching, setSearching] = useState(false)
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null)
  const [showNewForm, setShowNewForm] = useState(false)
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  // New client form
  const [newClient, setNewClient] = useState({
    email: '',
    nom: '',
    telephone: '',
    nom_chien: '',
    race_chien: '',
    age_chien: '',
    poids_chien: '',
    etat_poil: '',
    grooming_duration: '',
    notes: '',
  })
  const [creatingClient, setCreatingClient] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  // Service selection
  const [selectedService, setSelectedService] = useState(() => services[0]?.slug ?? '')

  // Manual form state
  const [visitDate, setVisitDate] = useState(new Date().toISOString().slice(0, 10))
  const [visitTime, setVisitTime] = useState('')
  const [visitDuration, setVisitDuration] = useState(60)
  const [visitPrice, setVisitPrice] = useState('')
  const [visitStaff, setVisitStaff] = useState('')
  const [visitNotes, setVisitNotes] = useState('')
  const [savingVisit, setSavingVisit] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Derived
  const currentService = services.find((s) => s.slug === selectedService)
  const isCalService = currentService?.calLink != null
  const isToilettage = selectedService.includes('toilettage')
  const toilettageMissingDuration = isToilettage && !selectedProfile?.grooming_duration

  function handleSearchChange(q: string) {
    setSearchQuery(q)
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    if (q.length < 2) {
      setSearchResults([])
      return
    }
    searchTimeout.current = setTimeout(async () => {
      setSearching(true)
      const res = await fetch(`/api/dashboard/customers/search?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setSearchResults(data)
      setSearching(false)
    }, 300)
  }

  function selectProfile(p: Profile) {
    setSelectedProfile(p)
    setSearchQuery('')
    setSearchResults([])
    setShowNewForm(false)
  }

  async function handleCreateClient() {
    setCreatingClient(true)
    setCreateError(null)
    const res = await fetch('/api/dashboard/customers/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...newClient,
        grooming_duration: newClient.grooming_duration ? Number(newClient.grooming_duration) : null,
      }),
    })
    const data = await res.json()
    if (!res.ok) {
      setCreateError(data.error ?? 'Erreur inconnue')
      setCreatingClient(false)
      return
    }
    setSelectedProfile(data)
    setShowNewForm(false)
    setCreatingClient(false)
  }

  async function saveManualVisit() {
    if (!selectedProfile) return
    setSavingVisit(true)
    setSaveError(null)
    const res = await fetch(`/api/dashboard/customers/${selectedProfile.id}/visits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service: selectedService,
        date: visitDate,
        time: visitTime || null,
        duration: visitDuration,
        notes: visitNotes || null,
        staff: visitStaff || null,
        price: visitPrice ? Number(visitPrice) : null,
      }),
    })
    setSavingVisit(false)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setSaveError(data.error ?? `Erreur ${res.status}`)
      return
    }
    router.push(`/dashboard/customers/${selectedProfile.id}`)
    router.refresh()
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-xl font-bold text-[#1D164E]">Nouvelle réservation</h1>

      {/* Step 1: Client */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
          1. Client
        </p>

        {selectedProfile ? (
          <div className="flex items-start justify-between p-4 rounded-xl bg-gray-50 border border-gray-200">
            <div>
              <p className="font-semibold text-[#1D164E]">{selectedProfile.nom}</p>
              <p className="text-sm text-gray-500">{selectedProfile.telephone}</p>
              {selectedProfile.nom_chien && (
                <p className="text-sm text-gray-500 mt-1">
                  🐶 {selectedProfile.nom_chien}
                  {selectedProfile.grooming_duration && (
                    <span className="ml-2 text-terracotta-dark font-medium">
                      · {selectedProfile.grooming_duration} min toilettage
                    </span>
                  )}
                </p>
              )}
            </div>
            <button
              onClick={() => setSelectedProfile(null)}
              className="text-gray-400 hover:text-red-400 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <>
            {!showNewForm && (
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Rechercher par nom ou téléphone…"
                  className="w-full text-sm rounded-lg border border-gray-200 pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1D164E]"
                />
                {searching && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                    …
                  </span>
                )}
              </div>
            )}

            {searchResults.length > 0 && !showNewForm && (
              <div className="border border-gray-200 rounded-xl overflow-hidden mb-3">
                {searchResults.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => selectProfile(p)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                  >
                    <p className="text-sm font-medium text-[#1D164E]">{p.nom}</p>
                    <p className="text-xs text-gray-400">
                      {p.telephone}
                      {p.nom_chien ? ` · 🐶 ${p.nom_chien}` : ''}
                    </p>
                  </button>
                ))}
              </div>
            )}

            {!showNewForm ? (
              <button
                onClick={() => setShowNewForm(true)}
                className="text-sm font-medium text-[#1D164E] underline underline-offset-2"
              >
                + Nouveau client
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-[#1D164E]">Nouveau client</p>
                {[
                  { key: 'nom', label: 'Nom', required: true, type: 'text' },
                  { key: 'email', label: 'Email', required: true, type: 'email' },
                  { key: 'telephone', label: 'Téléphone', required: true, type: 'tel' },
                  { key: 'nom_chien', label: 'Nom du chien', required: true, type: 'text' },
                  { key: 'race_chien', label: 'Race', required: false, type: 'text' },
                  { key: 'age_chien', label: 'Âge', required: false, type: 'text' },
                ].map(({ key, label, required, type }) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      {label}
                      {required && <span className="text-red-400 ml-0.5">*</span>}
                    </label>
                    <input
                      type={type}
                      className={inputCls}
                      value={newClient[key as keyof typeof newClient]}
                      onChange={(e) => setNewClient((d) => ({ ...d, [key]: e.target.value }))}
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Poids</label>
                  <select
                    className={inputCls}
                    value={newClient.poids_chien}
                    onChange={(e) => setNewClient((d) => ({ ...d, poids_chien: e.target.value }))}
                  >
                    <option value="">—</option>
                    {POIDS.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">État du poil</label>
                  <select
                    className={inputCls}
                    value={newClient.etat_poil}
                    onChange={(e) => setNewClient((d) => ({ ...d, etat_poil: e.target.value }))}
                  >
                    <option value="">—</option>
                    {ETAT_POIL.map((e) => (
                      <option key={e.value} value={e.value}>
                        {e.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Durée toilettage (min)
                  </label>
                  <input
                    type="number"
                    min="15"
                    step="15"
                    className={inputCls}
                    placeholder="Ex: 90"
                    value={newClient.grooming_duration}
                    onChange={(e) =>
                      setNewClient((d) => ({ ...d, grooming_duration: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Notes internes</label>
                  <textarea
                    rows={2}
                    className={`${inputCls} resize-none`}
                    value={newClient.notes}
                    onChange={(e) => setNewClient((d) => ({ ...d, notes: e.target.value }))}
                  />
                </div>
                {createError && <p className="text-sm text-red-500">{createError}</p>}
                <div className="flex gap-2">
                  <button
                    onClick={handleCreateClient}
                    disabled={
                      creatingClient ||
                      !newClient.nom ||
                      !newClient.email ||
                      !newClient.telephone ||
                      !newClient.nom_chien
                    }
                    className="flex-1 bg-[#1D164E] text-white rounded-lg py-2 text-sm font-medium hover:bg-[#1D164E]/90 disabled:opacity-50 transition-colors"
                  >
                    {creatingClient ? 'Création…' : 'Créer le client'}
                  </button>
                  <button
                    onClick={() => setShowNewForm(false)}
                    className="px-4 rounded-lg border border-gray-200 text-sm text-gray-500 hover:bg-gray-100 transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Step 2: Service */}
      {selectedProfile && (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
            2. Service
          </p>

          {/* Group label above */}
          <div className="mb-1 text-xs text-gray-400 font-medium">Cal.com (réservation en ligne)</div>
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className={inputCls}
          >
            <optgroup label="Réservation en ligne (cal.com)">
              {services.filter((s) => s.calLink).map((s) => (
                <option key={s.slug} value={s.slug}>{s.title}</option>
              ))}
            </optgroup>
            <optgroup label="Rendez-vous manuel">
              {services.filter((s) => !s.calLink).map((s) => (
                <option key={s.slug} value={s.slug}>{s.title}</option>
              ))}
            </optgroup>
          </select>

          {isCalService && toilettageMissingDuration && (
            <p className="mt-3 text-sm text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
              ⚠️ La durée de toilettage n&apos;est pas définie pour ce client. Veuillez la renseigner sur{' '}
              <a href={`/dashboard/customers/${selectedProfile.id}`} className="underline font-medium">
                le profil client
              </a>{' '}
              avant de réserver.
            </p>
          )}
        </div>
      )}

      {/* Step 3a: Cal.com embed */}
      {selectedProfile && isCalService && !toilettageMissingDuration && currentService?.calLink && (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
            3. Réservation
          </p>
          <Cal
            calLink={currentService.calLink}
            config={{
              name: selectedProfile.nom,
              notes: 'source=dashboard',
              ...(isToilettage && selectedProfile.grooming_duration
                ? { duration: selectedProfile.grooming_duration }
                : {}),
            }}
            style={{ width: '100%', height: '600px', border: 'none' }}
          />
          <p className="mt-4 text-xs text-gray-400 text-center">
            La visite sera enregistrée automatiquement une fois la réservation confirmée.
          </p>
        </div>
      )}

      {/* Step 3b: Manual form */}
      {selectedProfile && !isCalService && (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
            3. Détails du rendez-vous
          </p>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
                <input
                  type="date"
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Heure</label>
                <input
                  type="time"
                  value={visitTime}
                  onChange={(e) => setVisitTime(e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Durée (min)</label>
                <input
                  type="number"
                  min="15"
                  step="15"
                  value={visitDuration}
                  onChange={(e) => setVisitDuration(Number(e.target.value))}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Prix (€)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={visitPrice}
                  onChange={(e) => setVisitPrice(e.target.value)}
                  placeholder="Ex: 75.00"
                  className={inputCls}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Staff</label>
              <input
                type="text"
                value={visitStaff}
                onChange={(e) => setVisitStaff(e.target.value)}
                placeholder="Prénom du praticien"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Notes</label>
              <textarea
                rows={2}
                value={visitNotes}
                onChange={(e) => setVisitNotes(e.target.value)}
                placeholder="Observations…"
                className={`${inputCls} resize-none`}
              />
            </div>
            {saveError && (
              <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{saveError}</p>
            )}
            <button
              onClick={saveManualVisit}
              disabled={savingVisit || !visitDate}
              className="w-full flex items-center justify-center gap-2 bg-[#1D164E] text-white rounded-lg py-2.5 text-sm font-medium hover:bg-[#1D164E]/90 disabled:opacity-50 transition-colors"
            >
              <Check className="h-4 w-4" />
              {savingVisit ? 'Enregistrement…' : 'Enregistrer la visite'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: 0 errors. If `@calcom/embed-react` has no types, install `@types/calcom__embed-react` or add a shim `src/types/calcom-embed-react.d.ts`:

```typescript
// src/types/calcom-embed-react.d.ts
declare module '@calcom/embed-react' {
  import { CSSProperties } from 'react'
  interface CalProps {
    calLink: string
    config?: Record<string, string | number | undefined>
    style?: CSSProperties
  }
  export function Cal(props: CalProps): JSX.Element
}
```

- [ ] **Step 3: Run dev server and verify the form renders**

```bash
npm run dev
```

Open `http://localhost:3000/dashboard/reservations/new`. Verify:

- Service dropdown shows two optgroups
- Selecting toilettage/bains/balnéo shows the Cal.com embed area
- Selecting massage/ostéo/éducation shows the manual form

- [ ] **Step 4: Commit**

```bash
git add src/components/dashboard/new-reservation-form.tsx src/types/
git commit -m "feat: replace Calendly flow with cal.com embed + manual form in reservation page"
```

---

## Task 5: Update visits API route to accept `time`, `duration`, `status`

**Files:**

- Modify: `src/app/api/dashboard/customers/[id]/visits/route.ts`

- [ ] **Step 1: Update the route**

Replace `src/app/api/dashboard/customers/[id]/visits/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { service, date, time, duration, notes, staff, price } = await req.json()
  const { data, error } = await supabaseAdmin
    .from('visits')
    .insert({
      profile_id: params.id,
      service,
      date,
      time: time ?? null,
      duration: duration != null ? Number(duration) : null,
      notes: notes ?? null,
      staff: staff ?? null,
      price: price != null && price !== '' ? Number(price) : null,
      status: 'confirmed',
    })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: 0 errors

- [ ] **Step 3: Commit**

```bash
git add src/app/api/dashboard/customers/[id]/visits/route.ts
git commit -m "feat: accept time, duration, status in visits POST route"
```

---

## Task 6: Create `src/lib/sumup.ts` — SumUp Checkout API helper

**Files:**

- Create: `src/lib/sumup.ts`

SumUp Checkout API docs: `POST https://api.sumup.com/v0.1/checkouts`

- [ ] **Step 1: Create the file**

```typescript
// src/lib/sumup.ts
// SumUp Checkout API — create a payment link for a given amount

interface SumUpCheckoutResponse {
  id: string
  checkout_reference: string
  amount: number
  currency: string
  pay_to_email: string
  status: string
}

export async function createSumUpCheckout(params: {
  amount: number // in euros, e.g. 60
  reference: string // unique, e.g. `deposit_${visitId}`
  description: string // shown on the payment page
  returnUrl: string // where SumUp redirects after payment
}): Promise<SumUpCheckoutResponse> {
  const res = await fetch('https://api.sumup.com/v0.1/checkouts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.SUMUP_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      checkout_reference: params.reference,
      amount: params.amount,
      currency: 'EUR',
      pay_to_email: process.env.SUMUP_MERCHANT_EMAIL,
      description: params.description,
      return_url: params.returnUrl,
    }),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`SumUp checkout creation failed: ${res.status} ${body}`)
  }
  return res.json()
}

export function getSumUpCheckoutUrl(checkoutId: string): string {
  return `https://pay.sumup.com/b2c/checkout/${checkoutId}`
}
```

- [ ] **Step 2: Add env vars to `.env.local` (for local dev)**

Add to `.env.local`:

```
SUMUP_API_KEY=           # SumUp personal access token
SUMUP_MERCHANT_EMAIL=    # merchant account email (for pay_to_email)
```

Also add to Vercel environment variables.

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: 0 errors

- [ ] **Step 4: Commit**

```bash
git add src/lib/sumup.ts
git commit -m "feat: add SumUp checkout helper"
```

---

## Task 7: Create deposit request email template

**Files:**

- Create: `src/lib/emails/deposit-request.ts`

- [ ] **Step 1: Create the file**

```typescript
// src/lib/emails/deposit-request.ts

export function depositRequestHtml(params: {
  clientName: string
  serviceName: string
  appointmentDate: string // formatted, e.g. 'vendredi 11 avril 2026 à 14h30'
  depositAmount: number // 60
  paymentUrl: string
}): string {
  const { clientName, serviceName, appointmentDate, depositAmount, paymentUrl } = params
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Confirmez votre réservation — merci murphy®</title></head>
<body style="margin:0;padding:0;background:#f5f0eb;font-family:Inter,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0">
<tr><td align="center" style="padding:48px 16px;">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;">
<tr><td style="padding:40px 48px;background:#1D164E;text-align:center;">
  <p style="margin:0;color:#f5f0eb;font-size:22px;font-weight:600;letter-spacing:0.02em;">merci murphy®</p>
</td></tr>
<tr><td style="padding:40px 48px;">
  <h1 style="margin:0 0 8px;font-size:24px;font-weight:600;color:#1D164E;">Votre réservation est presque confirmée</h1>
  <p style="margin:0 0 24px;font-size:15px;color:#4a4a4a;line-height:1.6;">Bonjour ${clientName},</p>
  <p style="margin:0 0 24px;font-size:15px;color:#4a4a4a;line-height:1.6;">
    Votre demande de <strong>${serviceName}</strong> le <strong>${appointmentDate}</strong> a bien été reçue.<br>
    Pour la confirmer définitivement, un acompte de <strong>${depositAmount}€</strong> est requis.
  </p>
  <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
    <tr><td align="center">
      <a href="${paymentUrl}" style="display:inline-block;background:#B85C38;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 32px;border-radius:100px;">
        Payer l'acompte de ${depositAmount}€
      </a>
    </td></tr>
  </table>
  <p style="margin:0 0 8px;font-size:13px;color:#888;line-height:1.6;">
    Ce lien est valable jusqu'à votre rendez-vous. Sans paiement, votre créneau pourra être libéré.
  </p>
  <p style="margin:0;font-size:13px;color:#888;line-height:1.6;">
    Une question ? Répondez à cet email ou appelez-nous directement.
  </p>
</td></tr>
<tr><td style="padding:24px 48px;background:#f5f0eb;text-align:center;">
  <p style="margin:0;font-size:12px;color:#888;">merci murphy® · Paris · bonjour@mercimurphy.com</p>
</td></tr>
</table>
</td></tr>
</table>
</body></html>`
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/emails/deposit-request.ts
git commit -m "feat: add deposit request email template"
```

---

## Task 8: Create booking confirmed email template

**Files:**

- Create: `src/lib/emails/booking-confirmed.ts`

- [ ] **Step 1: Create the file**

```typescript
// src/lib/emails/booking-confirmed.ts

export function bookingConfirmedHtml(params: {
  clientName: string
  serviceName: string
  appointmentDate: string // e.g. 'vendredi 11 avril 2026 à 14h30'
}): string {
  const { clientName, serviceName, appointmentDate } = params
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Votre réservation est confirmée — merci murphy®</title></head>
<body style="margin:0;padding:0;background:#f5f0eb;font-family:Inter,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0">
<tr><td align="center" style="padding:48px 16px;">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;">
<tr><td style="padding:40px 48px;background:#1D164E;text-align:center;">
  <p style="margin:0;color:#f5f0eb;font-size:22px;font-weight:600;letter-spacing:0.02em;">merci murphy®</p>
</td></tr>
<tr><td style="padding:40px 48px;">
  <h1 style="margin:0 0 8px;font-size:24px;font-weight:600;color:#1D164E;">C'est confirmé ! 🐾</h1>
  <p style="margin:0 0 24px;font-size:15px;color:#4a4a4a;line-height:1.6;">Bonjour ${clientName},</p>
  <p style="margin:0 0 24px;font-size:15px;color:#4a4a4a;line-height:1.6;">
    Votre réservation pour <strong>${serviceName}</strong> le <strong>${appointmentDate}</strong> est confirmée.<br>
    Nous avons bien reçu votre acompte — merci !
  </p>
  <p style="margin:0 0 8px;font-size:13px;color:#888;line-height:1.6;">
    Si vous avez la moindre question avant votre rendez-vous, n'hésitez pas à nous contacter.
  </p>
  <p style="margin:0;font-size:13px;color:#888;line-height:1.6;">
    À très bientôt chez merci murphy® !
  </p>
</td></tr>
<tr><td style="padding:24px 48px;background:#f5f0eb;text-align:center;">
  <p style="margin:0;font-size:12px;color:#888;">merci murphy® · Paris · bonjour@mercimurphy.com</p>
</td></tr>
</table>
</td></tr>
</table>
</body></html>`
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/emails/booking-confirmed.ts
git commit -m "feat: add booking confirmed email template"
```

---

## Task 9: Create `POST /api/webhooks/calcom` — webhook endpoint

**Files:**

- Create: `src/app/api/webhooks/calcom/route.ts`

Cal.com sends a POST when a booking is confirmed. The payload contains `attendee`, `eventType`, `startTime`, `endTime`.

Cal.com signs the payload with an HMAC-SHA256 of the raw body using the webhook secret. The signature is in the `X-Cal-Signature-256` header.

- [ ] **Step 1: Create the route**

```typescript
// src/app/api/webhooks/calcom/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { createSumUpCheckout, getSumUpCheckoutUrl } from '@/lib/sumup'
import { depositRequestHtml } from '@/lib/emails/deposit-request'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// Map cal.com event slug to Supabase visit service value
const EVENT_SLUG_TO_SERVICE: Record<string, string> = {
  toilettage: 'toilettage',
  'les-bains': 'bains',
  balneo: 'balneo',
}

function getServiceFromCalLink(eventSlug: string): string | null {
  // eventSlug may be full path like 'merci-murphy/toilettage'
  const parts = eventSlug.split('/')
  const slug = parts[parts.length - 1]
  return EVENT_SLUG_TO_SERVICE[slug] ?? null
}

async function verifySignature(req: NextRequest, rawBody: string): Promise<boolean> {
  const secret = process.env.CAL_WEBHOOK_SECRET
  if (!secret) return false
  const sig = req.headers.get('x-cal-signature-256')
  if (!sig) return false
  const expected = createHmac('sha256', secret).update(rawBody).digest('hex')
  return sig === expected
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text()

  const valid = await verifySignature(req, rawBody)
  if (!valid) return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })

  let payload: {
    triggerEvent: string
    payload: {
      attendees: { name: string; email: string }[]
      eventType: { slug: string; title: string }
      startTime: string
      endTime: string
      metadata?: Record<string, string>
      responses?: { notes?: { value?: string } }
    }
  }

  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Only handle BOOKING_CREATED
  if (payload.triggerEvent !== 'BOOKING_CREATED') {
    return NextResponse.json({ ok: true })
  }

  const attendee = payload.payload.attendees[0]
  if (!attendee) return NextResponse.json({ error: 'No attendee' }, { status: 400 })

  const service = getServiceFromCalLink(payload.payload.eventType.slug)
  if (!service) return NextResponse.json({ error: 'Unknown event type' }, { status: 400 })

  // Detect if booked from dashboard (source=dashboard in notes prefill)
  const notesValue = payload.payload.responses?.notes?.value ?? ''
  const isDashboardBooking = notesValue.includes('source=dashboard')

  // Look up profile by attendee email
  const { data: users } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 })
  const authUser = (users?.users ?? []).find((u) => u.email === attendee.email)
  if (!authUser) {
    // No account yet — skip visit creation (client booked before creating account)
    // This can happen if the cal.com link is shared publicly
    return NextResponse.json({ ok: true, skipped: 'no_profile' })
  }

  // Parse start time
  const startDate = new Date(payload.payload.startTime)
  const dateStr = startDate.toISOString().slice(0, 10) // YYYY-MM-DD
  const timeStr = startDate.toISOString().slice(11, 16) // HH:MM

  // Insert visit
  const status = service === 'toilettage' && !isDashboardBooking ? 'pending_deposit' : 'confirmed'

  const { data: visit, error: visitError } = await supabaseAdmin
    .from('visits')
    .insert({
      profile_id: authUser.id,
      service,
      date: dateStr,
      time: timeStr,
      duration: null,
      notes: null,
      staff: null,
      price: null,
      status,
    })
    .select()
    .single()

  if (visitError) {
    console.error('Visit insert error:', visitError)
    return NextResponse.json({ error: visitError.message }, { status: 500 })
  }

  // Toilettage + client booking → create deposit
  if (service === 'toilettage' && !isDashboardBooking) {
    try {
      const checkout = await createSumUpCheckout({
        amount: 60,
        reference: `deposit_${visit.id}`,
        description: `Acompte toilettage — ${attendee.name}`,
        returnUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/booking/confirmed`,
      })

      // Store checkout id on the visit
      await supabaseAdmin
        .from('visits')
        .update({ sumup_checkout_id: checkout.id })
        .eq('id', visit.id)

      const paymentUrl = getSumUpCheckoutUrl(checkout.id)

      // Format date for email
      const formatted = startDate.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Europe/Paris',
      })

      await resend.emails.send({
        from: `merci murphy® <${process.env.RESEND_FROM_EMAIL}>`,
        to: attendee.email,
        subject: 'Confirmez votre réservation — merci murphy® 🐾',
        html: depositRequestHtml({
          clientName: attendee.name,
          serviceName: 'toilettage',
          appointmentDate: formatted,
          depositAmount: 60,
          paymentUrl,
        }),
      })
    } catch (err) {
      // Log but don't fail the webhook — visit is created
      console.error('Deposit flow error:', err)
    }
  }

  return NextResponse.json({ ok: true, visitId: visit.id })
}
```

- [ ] **Step 2: Add `sumup_checkout_id` column to `visits` table**

Run in Supabase SQL editor:

```sql
ALTER TABLE visits ADD COLUMN sumup_checkout_id text null;
```

- [ ] **Step 3: Add `sumup_checkout_id` to `Visit` interface in `src/lib/supabase-admin.ts`**

In the `Visit` interface, add after `status`:

```typescript
sumup_checkout_id: string | null
```

- [ ] **Step 4: Add env var**

Add to `.env.local` and Vercel:

```
CAL_WEBHOOK_SECRET=       # set once cal.com webhook is configured
NEXT_PUBLIC_SITE_URL=https://mercimurphy.com  # or https://merci-murphy.vercel.app for staging
```

- [ ] **Step 5: Type-check**

Run: `npx tsc --noEmit`
Expected: 0 errors

- [ ] **Step 6: Commit**

```bash
git add src/app/api/webhooks/calcom/route.ts src/lib/supabase-admin.ts
git commit -m "feat: add cal.com webhook endpoint with HMAC validation and SumUp deposit trigger"
```

---

## Task 10: Create `POST /api/webhooks/sumup` — payment confirmation

**Files:**

- Create: `src/app/api/webhooks/sumup/route.ts`

SumUp sends a webhook when a payment is completed. The payload includes `checkout_reference` which we set to `deposit_${visitId}`.

SumUp webhook verification: SumUp signs with HMAC-SHA256 but the exact header name is `x-payload-signature`. Validate using the same SUMUP_WEBHOOK_SECRET (different from SUMUP_API_KEY).

- [ ] **Step 1: Create the route**

```typescript
// src/app/api/webhooks/sumup/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { bookingConfirmedHtml } from '@/lib/emails/booking-confirmed'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

async function verifySignature(req: NextRequest, rawBody: string): Promise<boolean> {
  const secret = process.env.SUMUP_WEBHOOK_SECRET
  if (!secret) return false
  const sig = req.headers.get('x-payload-signature')
  if (!sig) return false
  const expected = createHmac('sha256', secret).update(rawBody).digest('hex')
  return sig === expected
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text()

  const valid = await verifySignature(req, rawBody)
  if (!valid) return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })

  let payload: {
    event_type: string
    checkout_reference: string
    status: string
    customer?: { email?: string; name?: string }
    transaction_code?: string
    timestamp?: string
  }

  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (payload.event_type !== 'CHECKOUT_STATUS_CHANGED' || payload.status !== 'PAID') {
    return NextResponse.json({ ok: true })
  }

  // checkout_reference is 'deposit_<visitId>'
  const visitId = payload.checkout_reference.replace('deposit_', '')

  const { data: visit, error: fetchError } = await supabaseAdmin
    .from('visits')
    .select('*')
    .eq('id', visitId)
    .single()

  if (fetchError || !visit) {
    return NextResponse.json({ error: 'Visit not found' }, { status: 404 })
  }

  // Update status
  await supabaseAdmin
    .from('visits')
    .update({ status: 'confirmed', deposit_paid_at: new Date().toISOString() })
    .eq('id', visit.id)

  // Send confirmation email
  if (payload.customer?.email) {
    // Fetch profile for name
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('nom')
      .eq('id', visit.profile_id)
      .single()

    const startDate = new Date(`${visit.date}T${visit.time ?? '00:00'}`)
    const formatted = startDate.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Paris',
    })

    await resend.emails
      .send({
        from: `merci murphy® <${process.env.RESEND_FROM_EMAIL}>`,
        to: payload.customer.email,
        subject: 'Réservation confirmée — merci murphy® 🐾',
        html: bookingConfirmedHtml({
          clientName: profile?.nom ?? payload.customer.name ?? 'Client',
          serviceName: 'toilettage',
          appointmentDate: formatted,
        }),
      })
      .catch((err) => console.error('Confirmation email error:', err))
  }

  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 2: Add `deposit_paid_at` column to `visits` table**

Run in Supabase SQL editor:

```sql
ALTER TABLE visits ADD COLUMN deposit_paid_at timestamptz null;
```

- [ ] **Step 3: Add `deposit_paid_at` to `Visit` interface**

In `src/lib/supabase-admin.ts`, in the `Visit` interface, add:

```typescript
deposit_paid_at: string | null
```

- [ ] **Step 4: Add env var**

Add to `.env.local` and Vercel:

```
SUMUP_WEBHOOK_SECRET=    # SumUp webhook signing secret
```

- [ ] **Step 5: Type-check**

Run: `npx tsc --noEmit`
Expected: 0 errors

- [ ] **Step 6: Commit**

```bash
git add src/app/api/webhooks/sumup/route.ts src/lib/supabase-admin.ts
git commit -m "feat: add SumUp payment webhook to confirm visit and send booking confirmation email"
```

---

## Task 11: Configure cal.com webhook in cal.com dashboard

This is a manual configuration step.

- [ ] **Step 1: Deploy the app to Vercel** (if not already deployed) so the webhook URL is accessible

- [ ] **Step 2: In cal.com dashboard, go to Settings → Developer → Webhooks → Add webhook**
  - URL: `https://mercimurphy.com/api/webhooks/calcom`
  - Events: `BOOKING_CREATED`
  - Copy the generated webhook secret

- [ ] **Step 3: Add `CAL_WEBHOOK_SECRET` to Vercel environment variables**
  - Paste the secret from step 2

- [ ] **Step 4: Test the webhook**
  - Make a test booking via the embed in the dashboard
  - Verify in Supabase that a visit row was created with `status = 'confirmed'`
  - Check cal.com webhook logs for a 200 response

---

## Task 12: Final type-check and build verification

- [ ] **Step 1: Full type-check**

```bash
npx tsc --noEmit
```

Expected: 0 errors

- [ ] **Step 2: Build**

```bash
npm run build
```

Expected: successful build, no errors

- [ ] **Step 3: Lint**

```bash
npm run lint
```

Expected: 0 errors

- [ ] **Step 4: Commit any lint fixes**

```bash
git add -A
git commit -m "fix: lint issues from cal.com integration"
```

---

## Self-Review

### Spec coverage check

| Spec section                                             | Covered by task                            |
| -------------------------------------------------------- | ------------------------------------------ |
| Cal.com embed for toilettage/bains/balnéo                | Task 3, 4                                  |
| Manual form for massage/ostéo/éducation                  | Task 4                                     |
| `?duration=` for toilettage                              | Task 4 (config prop on Cal component)      |
| Webhook `POST /api/webhooks/calcom`                      | Task 9                                     |
| HMAC-SHA256 signature validation                         | Task 9                                     |
| Profile lookup by email                                  | Task 9                                     |
| Visit created with partial data                          | Task 9                                     |
| Visit `status = 'pending_deposit'` for client toilettage | Task 9                                     |
| SumUp 60€ checkout creation                              | Task 6, 9                                  |
| Deposit email via Resend                                 | Task 7, 9                                  |
| SumUp webhook `POST /api/webhooks/sumup`                 | Task 10                                    |
| Visit updated to `status = 'confirmed'` on payment       | Task 10                                    |
| Confirmation email via Resend                            | Task 8, 10                                 |
| Dashboard bookings skip deposit (`source=dashboard`)     | Task 4 (notes prefill), Task 9 (detection) |
| DB migrations: `time`, `duration`, `status`              | Task 1                                     |
| DB migrations: `sumup_checkout_id`, `deposit_paid_at`    | Task 9, 10                                 |
| `Visit` interface updated                                | Tasks 1, 9, 10                             |
| Remove Calendly flow                                     | Task 4                                     |
| Manual services `status = 'confirmed'` directly          | Task 5                                     |

### Notes for implementer

- **`@calcom/embed-react` types**: The package may not include TypeScript types. If `tsc` errors on the import, create `src/types/calcom-embed-react.d.ts` as shown in Task 4.
- **Cal.com `config.notes`**: The `notes` field in the config prefill is how `source=dashboard` is passed. Verify this works once cal.com embed is live — the field may be named differently in the embed config vs. the booking form.
- **SumUp webhook signature**: SumUp's signature header is `x-payload-signature`. Double-check this against SumUp's current docs when setting up the webhook, as the header name may differ between SumUp regions/plans.
- **Crèche**: Not included — handled via the existing leads form. Do not add crèche to the cal.com service map.
- **Automatic deposit expiry**: Deferred — not in this plan. The team handles unpaid deposits manually for now.
