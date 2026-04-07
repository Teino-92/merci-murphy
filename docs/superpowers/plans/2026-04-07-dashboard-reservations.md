# Dashboard Reservations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `/dashboard/reservations/new` page for the team to book appointments for existing or new clients, with `grooming_duration` driving Calendly slot length for toilettage.

**Architecture:** A new server-rendered page fetches Calendly URLs from Sanity per service, then passes them to a fully client-side multi-step form. Client search hits a new API route. New client creation uses `supabaseAdmin.auth.admin.createUser` then inserts a profile row. After opening Calendly, the team manually confirms the visit which is saved to the `visits` table via the existing visits API. `grooming_duration` is added to `Profile`, stored in Supabase, surfaced in the dashboard edit form and read-only in the client account page.

**Tech Stack:** Next.js 14 App Router, TypeScript strict, Supabase (service role), Sanity GROQ, Tailwind CSS, lucide-react

---

## File Map

| File                                                      | Action | Responsibility                                                                                        |
| --------------------------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------- |
| `src/lib/supabase-admin.ts`                               | Modify | Add `grooming_duration` to `Profile` interface + `searchProfiles` + `createProfileWithAuth` functions |
| `src/components/dashboard/nav.tsx`                        | Modify | Add Réservations nav entry                                                                            |
| `src/app/api/dashboard/customers/search/route.ts`         | Create | GET endpoint: search profiles by nom/telephone                                                        |
| `src/app/api/dashboard/customers/create/route.ts`         | Create | POST endpoint: create auth user + profile row                                                         |
| `src/app/(dashboard)/dashboard/reservations/new/page.tsx` | Create | Server component: fetch Calendly URLs from Sanity, render client component                            |
| `src/components/dashboard/new-reservation-form.tsx`       | Create | Client component: multi-step form (search/create client → service → Calendly → confirm visit)         |
| `src/components/dashboard/customer-detail.tsx`            | Modify | Add `grooming_duration` to edit form + view mode                                                      |
| `src/components/account/dogs-card.tsx`                    | Modify | Show `grooming_duration` read-only in client account page                                             |

---

## Task 1: Add `grooming_duration` to Supabase

**Files:**

- Modify: `src/lib/supabase-admin.ts`

- [ ] **Step 1: Run the migration in Supabase SQL editor**

Open the Supabase dashboard → SQL Editor → run:

```sql
ALTER TABLE profiles ADD COLUMN grooming_duration integer null;
```

- [ ] **Step 2: Add `grooming_duration` to the `Profile` interface**

In `src/lib/supabase-admin.ts`, update the `Profile` interface:

```typescript
export interface Profile {
  id: string
  created_at: string
  nom: string
  telephone: string
  nom_chien: string | null
  race_chien: string | null
  age_chien: string | null
  poids_chien: string | null
  etat_poil: string | null
  notes: string | null
  can_book: boolean
  grooming_duration: number | null
}
```

- [ ] **Step 3: Add `searchProfiles` function**

At the bottom of `src/lib/supabase-admin.ts`, add:

```typescript
export async function searchProfiles(query: string): Promise<Profile[]> {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .or(`nom.ilike.%${query}%,telephone.ilike.%${query}%`)
    .order('nom', { ascending: true })
    .limit(10)
  if (error) throw error
  return data ?? []
}
```

- [ ] **Step 4: Add `createProfileWithAuth` function**

In `src/lib/supabase-admin.ts`, add:

```typescript
export interface CreateProfileInput {
  email: string
  nom: string
  telephone: string
  nom_chien: string
  race_chien?: string
  age_chien?: string
  poids_chien?: string
  etat_poil?: string
  grooming_duration?: number | null
  notes?: string | null
}

export async function createProfileWithAuth(input: CreateProfileInput): Promise<Profile> {
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: input.email,
    email_confirm: false,
  })
  if (authError || !authData.user) {
    throw new Error(authError?.message ?? 'Erreur création compte')
  }

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .insert({
      id: authData.user.id,
      nom: input.nom,
      telephone: input.telephone,
      nom_chien: input.nom_chien,
      race_chien: input.race_chien ?? null,
      age_chien: input.age_chien ?? null,
      poids_chien: input.poids_chien ?? null,
      etat_poil: input.etat_poil ?? null,
      grooming_duration: input.grooming_duration ?? null,
      notes: input.notes ?? null,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}
```

- [ ] **Step 5: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/lib/supabase-admin.ts
git commit -m "feat: add grooming_duration to Profile + searchProfiles + createProfileWithAuth"
```

---

## Task 2: Customer Search API Route

**Files:**

- Create: `src/app/api/dashboard/customers/search/route.ts`

- [ ] **Step 1: Create the route**

```typescript
// src/app/api/dashboard/customers/search/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { searchProfiles } from '@/lib/supabase-admin'

export async function GET(req: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const query = req.nextUrl.searchParams.get('q') ?? ''
  if (query.length < 2) return NextResponse.json([])

  const profiles = await searchProfiles(query)
  return NextResponse.json(profiles)
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/dashboard/customers/search/route.ts
git commit -m "feat: add customer search API route for reservation form"
```

---

## Task 3: Create Customer API Route

**Files:**

- Create: `src/app/api/dashboard/customers/create/route.ts`

- [ ] **Step 1: Create the route**

```typescript
// src/app/api/dashboard/customers/create/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { createProfileWithAuth } from '@/lib/supabase-admin'

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const {
    email,
    nom,
    telephone,
    nom_chien,
    race_chien,
    age_chien,
    poids_chien,
    etat_poil,
    grooming_duration,
    notes,
  } = body

  if (!email || !nom || !telephone || !nom_chien) {
    return NextResponse.json({ error: 'Champs obligatoires manquants' }, { status: 400 })
  }

  try {
    const profile = await createProfileWithAuth({
      email,
      nom,
      telephone,
      nom_chien,
      race_chien: race_chien || undefined,
      age_chien: age_chien || undefined,
      poids_chien: poids_chien || undefined,
      etat_poil: etat_poil || undefined,
      grooming_duration: grooming_duration ? Number(grooming_duration) : null,
      notes: notes || null,
    })
    return NextResponse.json(profile)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/dashboard/customers/create/route.ts
git commit -m "feat: add create customer API route for reservation form"
```

---

## Task 4: Add Réservations to Nav

**Files:**

- Modify: `src/components/dashboard/nav.tsx`

- [ ] **Step 1: Add CalendarPlus to imports and add nav entry**

In `src/components/dashboard/nav.tsx`, update the import line:

```typescript
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  ShoppingBag,
  Mail,
  LogOut,
  CalendarPlus,
} from 'lucide-react'
```

Update the `NAV` array:

```typescript
const NAV = [
  { href: '/dashboard', label: "Vue d'ensemble", icon: LayoutDashboard },
  { href: '/dashboard/customers', label: 'Clients', icon: Users },
  { href: '/dashboard/reservations/new', label: 'Réservation', icon: CalendarPlus },
  { href: '/dashboard/shopify-customers', label: 'Clients Shopify', icon: ShoppingBag },
  { href: '/dashboard/leads', label: 'Demandes', icon: ClipboardList },
  { href: '/dashboard/newsletter', label: 'Newsletter', icon: Mail },
]
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/nav.tsx
git commit -m "feat: add Réservations entry to dashboard nav"
```

---

## Task 5: New Reservation Form Component

**Files:**

- Create: `src/components/dashboard/new-reservation-form.tsx`

This is the main client component. It has 4 steps:

1. Select or create client
2. Select service
3. Open Calendly (new tab)
4. Confirm visit (saves to Supabase)

- [ ] **Step 1: Create the component**

```typescript
// src/components/dashboard/new-reservation-form.tsx
'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, ExternalLink, Check } from 'lucide-react'
import { SERVICE_LABELS, POIDS, ETAT_POIL } from '@/lib/dog-constants'
import type { Profile } from '@/lib/supabase-admin'

interface NewReservationFormProps {
  calendlyUrls: Record<string, string> // slug → calendlyUrl
}

type Step = 'client' | 'service' | 'calendly' | 'confirm'

export function NewReservationForm({ calendlyUrls }: NewReservationFormProps) {
  const router = useRouter()
  const inputCls = 'w-full text-sm rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1D164E]'

  // Step tracking
  const [step, setStep] = useState<Step>('client')

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
  const [selectedService, setSelectedService] = useState('toilettage')

  // Visit confirmation
  const [visitDate, setVisitDate] = useState(new Date().toISOString().slice(0, 10))
  const [visitPrice, setVisitPrice] = useState('')
  const [visitStaff, setVisitStaff] = useState('')
  const [visitNotes, setVisitNotes] = useState('')
  const [savingVisit, setSavingVisit] = useState(false)

  // --- Search ---
  function handleSearchChange(q: string) {
    setSearchQuery(q)
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    if (q.length < 2) { setSearchResults([]); return }
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

  // --- New client ---
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

  // --- Calendly URL ---
  function buildCalendlyUrl(): string | null {
    const base = calendlyUrls[selectedService]
    if (!base) return null
    if (selectedService === 'toilettage' && selectedProfile?.grooming_duration) {
      return `${base}?duration=${selectedProfile.grooming_duration}`
    }
    return base
  }

  function openCalendly() {
    const url = buildCalendlyUrl()
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer')
      setStep('confirm')
    }
  }

  // --- Save visit ---
  async function saveVisit() {
    if (!selectedProfile) return
    setSavingVisit(true)
    await fetch(`/api/dashboard/customers/${selectedProfile.id}/visits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service: selectedService,
        date: visitDate,
        notes: visitNotes,
        staff: visitStaff,
        price: visitPrice,
      }),
    })
    setSavingVisit(false)
    router.push(`/dashboard/customers/${selectedProfile.id}`)
    router.refresh()
  }

  const toilettageMissingDuration =
    selectedService === 'toilettage' && !selectedProfile?.grooming_duration

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-xl font-bold text-[#1D164E]">Nouvelle réservation</h1>

      {/* ── Step 1: Client ── */}
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
              onClick={() => { setSelectedProfile(null); setStep('client') }}
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
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">…</span>
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
                      {p.telephone}{p.nom_chien ? ` · 🐶 ${p.nom_chien}` : ''}
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
                      {label}{required && <span className="text-red-400 ml-0.5">*</span>}
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
                    {POIDS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
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
                    {ETAT_POIL.map((e) => <option key={e.value} value={e.value}>{e.label}</option>)}
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
                    onChange={(e) => setNewClient((d) => ({ ...d, grooming_duration: e.target.value }))}
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
                {createError && (
                  <p className="text-sm text-red-500">{createError}</p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={handleCreateClient}
                    disabled={creatingClient || !newClient.nom || !newClient.email || !newClient.telephone || !newClient.nom_chien}
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

      {/* ── Step 2: Service ── */}
      {selectedProfile && (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
            2. Service
          </p>
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className={inputCls}
          >
            {Object.entries(SERVICE_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>

          {toilettageMissingDuration && (
            <p className="mt-3 text-sm text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
              ⚠️ La durée de toilettage n&apos;est pas définie pour ce client. Veuillez la renseigner sur{' '}
              <a
                href={`/dashboard/customers/${selectedProfile.id}`}
                className="underline font-medium"
              >
                le profil client
              </a>{' '}
              avant de réserver.
            </p>
          )}

          {!toilettageMissingDuration && !calendlyUrls[selectedService] && (
            <p className="mt-3 text-sm text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
              Aucun lien Calendly configuré pour ce service.
            </p>
          )}
        </div>
      )}

      {/* ── Step 3: Open Calendly ── */}
      {selectedProfile && !toilettageMissingDuration && calendlyUrls[selectedService] && step !== 'confirm' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
            3. Calendly
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Ouvrez Calendly dans un nouvel onglet, complétez la réservation, puis revenez ici pour enregistrer la visite.
          </p>
          <button
            onClick={openCalendly}
            className="flex items-center gap-2 bg-[#1D164E] text-white rounded-lg px-5 py-2.5 text-sm font-medium hover:bg-[#1D164E]/90 transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            Ouvrir Calendly
          </button>
        </div>
      )}

      {/* ── Step 4: Confirm visit ── */}
      {step === 'confirm' && selectedProfile && (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
            4. Confirmer la visite
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
                placeholder="Prénom du toiletteur / responsable"
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
            <div className="flex gap-2 pt-1">
              <button
                onClick={saveVisit}
                disabled={savingVisit}
                className="flex-1 flex items-center justify-center gap-2 bg-[#1D164E] text-white rounded-lg py-2.5 text-sm font-medium hover:bg-[#1D164E]/90 disabled:opacity-50 transition-colors"
              >
                <Check className="h-4 w-4" />
                {savingVisit ? 'Enregistrement…' : 'Enregistrer la visite'}
              </button>
              <button
                onClick={() => setStep('service')}
                className="px-4 rounded-lg border border-gray-200 text-sm text-gray-500 hover:bg-gray-100 transition-colors"
              >
                Retour
              </button>
            </div>
          </div>
        </div>
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
git add src/components/dashboard/new-reservation-form.tsx
git commit -m "feat: add NewReservationForm client component"
```

---

## Task 6: Reservation Page (Server Component)

**Files:**

- Create: `src/app/(dashboard)/dashboard/reservations/new/page.tsx`

- [ ] **Step 1: Create the page**

```typescript
// src/app/(dashboard)/dashboard/reservations/new/page.tsx
import { NewReservationForm } from '@/components/dashboard/new-reservation-form'
import { sanityClient } from '@/sanity/client'

export const dynamic = 'force-dynamic'

interface ServiceCalendly {
  slug: { current: string }
  calendlyUrl: string | null
}

async function getCalendlyUrls(): Promise<Record<string, string>> {
  const services: ServiceCalendly[] = await sanityClient.fetch(
    `*[_type == "service" && defined(calendlyUrl)] { slug, calendlyUrl }`,
    {},
    { next: { revalidate: 3600 } }
  )
  return Object.fromEntries(
    services
      .filter((s) => s.calendlyUrl)
      .map((s) => [s.slug.current, s.calendlyUrl as string])
  )
}

export default async function NewReservationPage() {
  const calendlyUrls = await getCalendlyUrls()
  return <NewReservationForm calendlyUrls={calendlyUrls} />
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Test manually**

Run `npm run dev`, navigate to `/dashboard/reservations/new`. Verify:

- Page loads without error
- Nav shows "Réservation" entry
- Search input appears

- [ ] **Step 4: Commit**

```bash
git add "src/app/(dashboard)/dashboard/reservations/new/page.tsx"
git commit -m "feat: add /dashboard/reservations/new server page"
```

---

## Task 7: grooming_duration in Customer Detail (Dashboard)

**Files:**

- Modify: `src/components/dashboard/customer-detail.tsx`

- [ ] **Step 1: Add `grooming_duration` to `editData` state**

Find the `editData` state initializer (around line 28) and add the field:

```typescript
const [editData, setEditData] = useState({
  nom: initial.nom,
  telephone: initial.telephone,
  nom_chien: initial.nom_chien ?? '',
  race_chien: initial.race_chien ?? '',
  age_chien: initial.age_chien ?? '',
  poids_chien: initial.poids_chien ?? '',
  etat_poil: initial.etat_poil ?? '',
  grooming_duration: initial.grooming_duration ?? ('' as number | ''),
})
```

- [ ] **Step 2: Add input in the edit form**

Find the "État du poil" input block in the edit form (after `etat_poil` field, before the save button) and add after it:

```tsx
{
  editData.nom_chien && (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">Durée toilettage (min)</label>
      <input
        type="number"
        min="15"
        step="15"
        placeholder="Ex: 90"
        className={inputCls}
        value={editData.grooming_duration}
        onChange={(e) =>
          setEditData((d) => ({
            ...d,
            grooming_duration: e.target.value === '' ? '' : Number(e.target.value),
          }))
        }
      />
    </div>
  )
}
```

- [ ] **Step 3: Add read-only display in view mode**

Find the dog info view block (the one that shows `race_chien`, `age_chien`, etc., around line 252). Add after the `etat_poil` display:

```tsx
{
  profile.grooming_duration && (
    <p>
      <span className="text-gray-400">Durée séance :</span>{' '}
      <span className="font-medium text-[#1D164E]">{profile.grooming_duration} min</span>
    </p>
  )
}
```

- [ ] **Step 4: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/dashboard/customer-detail.tsx
git commit -m "feat: add grooming_duration to customer detail edit form and view"
```

---

## Task 8: grooming_duration in Client Account Page (Read-only)

**Files:**

- Modify: `src/components/account/dogs-card.tsx`

The `Dog` type is in `src/lib/auth-actions.ts`. First check if `grooming_duration` is already on it.

- [ ] **Step 1: Check the Dog type**

Open `src/lib/auth-actions.ts` and find the `Dog` interface. If `grooming_duration` is missing, add it:

```typescript
export interface Dog {
  id: string
  name: string
  breed: string | null
  age: string | null
  poids: string | null
  etat_poil: string | null
  photo_url: string | null
  grooming_duration: number | null // add this line
}
```

Also verify the Supabase query that fetches dogs includes `grooming_duration` in the select. Search for `.from('dogs').select(` in `auth-actions.ts` and ensure `grooming_duration` is included (or use `*`).

- [ ] **Step 2: Add read-only display in DogSubCard**

In `src/components/account/dogs-card.tsx`, find `DogSubCard` and add after the `DogTag` elements:

```tsx
{
  dog.grooming_duration && <DogTag>{dog.grooming_duration} min</DogTag>
}
```

- [ ] **Step 3: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/lib/auth-actions.ts src/components/account/dogs-card.tsx
git commit -m "feat: show grooming_duration read-only on client account dog card"
```

---

## Task 9: Build Check & Push

- [ ] **Step 1: Full build**

```bash
npm run build
```

Expected: no errors, no type errors.

- [ ] **Step 2: Push**

```bash
git push
```
