# Mon Compte — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a protected `/compte` page where authenticated merci murphy® clients can view and edit their profile, manage multiple dogs (with Cloudinary photo uploads), and see their visit history.

**Architecture:** Server Component page (`/compte/page.tsx`) fetches all data server-side and passes it to focused Client Component cards. Dog mutations use Server Actions. Photo uploads go directly to Cloudinary (unsigned preset); only the resulting URL is stored in Supabase.

**Tech Stack:** Next.js 14 App Router, TypeScript strict, Tailwind CSS, Supabase (server + browser clients), Cloudinary Upload API, Zod, shadcn/ui primitives (`Button`, `Input`, `Select`)

---

## File Map

| Path                                          | Action | Responsibility                                                                   |
| --------------------------------------------- | ------ | -------------------------------------------------------------------------------- |
| `project/migrations/002_dogs_and_visits.sql`  | Create | DB migration: dogs table + visits.dog_id                                         |
| `src/lib/dog-actions.ts`                      | Create | Server Actions for dog CRUD                                                      |
| `src/app/(marketing)/compte/page.tsx`         | Create | Protected server page, fetches all data                                          |
| `src/components/account/account-welcome.tsx`  | Create | Welcome header card (display only)                                               |
| `src/components/account/profile-card.tsx`     | Create | Profile view + inline edit                                                       |
| `src/components/account/dogs-card.tsx`        | Create | Dogs list + add/edit dog sheet                                                   |
| `src/components/account/dog-form.tsx`         | Create | Shared form for add/edit dog (used inside sheet)                                 |
| `src/components/account/dog-photo-upload.tsx` | Create | Cloudinary photo upload circle                                                   |
| `src/components/account/booking-cta.tsx`      | Create | Terracotta CTA card (conditional)                                                |
| `src/components/account/visit-timeline.tsx`   | Create | Visit history list (display only)                                                |
| `src/components/layout/auth-button.tsx`       | Modify | Add "Mon compte" link to `/compte`                                               |
| `src/lib/auth-actions.ts`                     | Modify | Add `getDogs()` and `getVisits()` server functions                               |
| `.env.local`                                  | Modify | Add `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` + `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` |

---

## Task 1: Database migration — dogs table + visits.dog_id

**Files:**

- Create: `project/migrations/002_dogs_and_visits.sql`

- [ ] **Step 1: Write the migration file**

```sql
-- Migration 002: dogs table + dog_id on visits

create table if not exists public.dogs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  breed text,
  age text,
  poids text,
  etat_poil text,
  photo_url text,
  grooming_duration integer,
  notes text,
  can_book_online boolean not null default false
);

alter table public.dogs enable row level security;

create policy "dogs_select_own" on public.dogs
  for select to authenticated
  using (owner_id = auth.uid());

create policy "dogs_insert_own" on public.dogs
  for insert to authenticated
  with check (owner_id = auth.uid());

create policy "dogs_update_own_safe" on public.dogs
  for update to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "dogs_all_service_role" on public.dogs
  for all to service_role using (true);

-- Add dog attribution to visits (nullable — old visits have no dog)
alter table public.visits
  add column if not exists dog_id uuid references public.dogs(id) on delete set null;
```

- [ ] **Step 2: Run the migration in Supabase**

Apply via the Supabase dashboard SQL editor or CLI:

```bash
# If using Supabase CLI:
supabase db push
# Or paste migration content into Supabase dashboard → SQL Editor → Run
```

Expected: no errors, `dogs` table appears in Table Editor.

- [ ] **Step 3: Commit**

```bash
git add project/migrations/002_dogs_and_visits.sql
git commit -m "feat: add dogs table migration + visits.dog_id"
```

---

## Task 2: Add getDogs() and getVisits() to auth-actions.ts

**Files:**

- Modify: `src/lib/auth-actions.ts`

- [ ] **Step 1: Add Dog and Visit types + fetch functions**

Add to the end of `src/lib/auth-actions.ts`:

```typescript
// ─── Dog types ────────────────────────────────────────────────────────────────

export interface Dog {
  id: string
  owner_id: string
  name: string
  breed: string | null
  age: string | null
  poids: string | null
  etat_poil: string | null
  photo_url: string | null
  can_book_online: boolean
}

// ─── Visit types ──────────────────────────────────────────────────────────────

export interface Visit {
  id: string
  service: string
  date: string
  dog_id: string | null
}

// ─── Get dogs for current user ────────────────────────────────────────────────

export async function getDogs(): Promise<Dog[]> {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('dogs')
    .select('id, owner_id, name, breed, age, poids, etat_poil, photo_url, can_book_online')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: true })

  return data ?? []
}

// ─── Get visits for current user ─────────────────────────────────────────────

export async function getVisits(): Promise<Visit[]> {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('visits')
    .select('id, service, date, dog_id')
    .eq('profile_id', user.id)
    .order('date', { ascending: false })

  return data ?? []
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/auth-actions.ts
git commit -m "feat: add getDogs and getVisits server functions"
```

---

## Task 3: Dog Server Actions

**Files:**

- Create: `src/lib/dog-actions.ts`

- [ ] **Step 1: Write the dog-actions file**

```typescript
'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/lib/supabase-server'

// ─── Schemas ──────────────────────────────────────────────────────────────────

const DogSchema = z.object({
  name: z.string().min(1, 'Le prénom est requis'),
  breed: z.string().optional(),
  age: z.string().optional(),
  poids: z.string().optional(),
  etat_poil: z.string().optional(),
  photo_url: z.string().url().optional().or(z.literal('')),
})

// ─── Add dog ──────────────────────────────────────────────────────────────────

export async function addDog(data: z.infer<typeof DogSchema>) {
  const parsed = DogSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: 'Données invalides.' }

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Non authentifié.' }

  const { error } = await supabase.from('dogs').insert({
    owner_id: user.id,
    name: parsed.data.name,
    breed: parsed.data.breed ?? null,
    age: parsed.data.age ?? null,
    poids: parsed.data.poids ?? null,
    etat_poil: parsed.data.etat_poil ?? null,
    photo_url: parsed.data.photo_url || null,
  })

  if (error) return { success: false, error: "Erreur lors de l'ajout." }

  revalidatePath('/compte')
  return { success: true }
}

// ─── Update dog ───────────────────────────────────────────────────────────────

export async function updateDog(dogId: string, data: z.infer<typeof DogSchema>) {
  const parsed = DogSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: 'Données invalides.' }

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Non authentifié.' }

  const { error } = await supabase
    .from('dogs')
    .update({
      name: parsed.data.name,
      breed: parsed.data.breed ?? null,
      age: parsed.data.age ?? null,
      poids: parsed.data.poids ?? null,
      etat_poil: parsed.data.etat_poil ?? null,
      photo_url: parsed.data.photo_url || null,
    })
    .eq('id', dogId)
    .eq('owner_id', user.id)

  if (error) return { success: false, error: 'Erreur lors de la mise à jour.' }

  revalidatePath('/compte')
  return { success: true }
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/dog-actions.ts
git commit -m "feat: add dog server actions (add, update)"
```

---

## Task 4: Account page — server component

**Files:**

- Create: `src/app/(marketing)/compte/page.tsx`

- [ ] **Step 1: Write the page**

```typescript
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getProfile, getDogs, getVisits } from '@/lib/auth-actions'
import { AccountWelcome } from '@/components/account/account-welcome'
import { ProfileCard } from '@/components/account/profile-card'
import { DogsCard } from '@/components/account/dogs-card'
import { BookingCta } from '@/components/account/booking-cta'
import { VisitTimeline } from '@/components/account/visit-timeline'

export const metadata: Metadata = {
  title: 'Mon compte',
  description: 'Votre espace personnel merci murphy®.',
}

export default async function ComptePage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/compte/connexion?redirect=/compte')

  const [profile, dogs, visits] = await Promise.all([
    getProfile(),
    getDogs(),
    getVisits(),
  ])

  if (!profile) redirect('/compte/connexion?redirect=/compte')

  const memberSince = new Date(user.created_at).toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
  })

  const canBook = dogs.some((d) => d.can_book_online)

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f5f0eb' }}>
      <div className="mx-auto max-w-[480px] px-4 py-8 pb-20">
        <AccountWelcome
          prenom={profile.nom.split(' ')[0]}
          memberSince={memberSince}
          canBook={canBook}
        />
        <ProfileCard profile={profile} email={user.email ?? ''} />
        <DogsCard dogs={dogs} />
        {canBook && <BookingCta />}
        <VisitTimeline visits={visits} dogs={dogs} />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: errors only from missing component files (expected at this stage).

- [ ] **Step 3: Commit**

```bash
git add "src/app/(marketing)/compte/page.tsx"
git commit -m "feat: add /compte server page skeleton"
```

---

## Task 5: AccountWelcome component

**Files:**

- Create: `src/components/account/account-welcome.tsx`

- [ ] **Step 1: Write the component**

```typescript
interface AccountWelcomeProps {
  prenom: string
  memberSince: string
  canBook: boolean
}

export function AccountWelcome({ prenom, memberSince, canBook }: AccountWelcomeProps) {
  return (
    <div
      className="rounded-[20px] p-7 mb-5 relative overflow-hidden"
      style={{ backgroundColor: '#B5A89A' }}
    >
      <p
        className="text-[10px] font-semibold tracking-[0.18em] uppercase mb-1.5"
        style={{ color: '#8B5A3A' }}
      >
        Mon espace
      </p>
      <h1 className="font-display text-[26px] font-bold leading-tight mb-1">
        Bonjour, {prenom} 👋
      </h1>
      <p className="text-sm" style={{ color: 'rgba(26,26,26,0.6)' }}>
        membre depuis {memberSince}
      </p>
      {canBook && (
        <div
          className="inline-flex items-center gap-1.5 text-white text-[11px] font-semibold px-3 py-1.5 rounded-full mt-3.5"
          style={{ backgroundColor: '#8B5A3A' }}
        >
          <span>✓</span> Réservation en ligne activée
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/account/account-welcome.tsx
git commit -m "feat: add AccountWelcome component"
```

---

## Task 6: ProfileCard component

**Files:**

- Create: `src/components/account/profile-card.tsx`

- [ ] **Step 1: Write the component**

```typescript
'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { updateProfile } from '@/lib/auth-actions'
import type { Profile } from '@/lib/auth-actions'

interface ProfileCardProps {
  profile: Profile
  email: string
}

export function ProfileCard({ profile, email }: ProfileCardProps) {
  const [editing, setEditing] = useState(false)
  const [nom, setNom] = useState(profile.nom)
  const [telephone, setTelephone] = useState(profile.telephone)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    setLoading(true)
    setError(null)
    const result = await updateProfile({ nom, telephone })
    setLoading(false)
    if (result.success) {
      setEditing(false)
    } else {
      setError(result.error ?? 'Erreur lors de la mise à jour.')
    }
  }

  return (
    <div className="bg-white rounded-[18px] p-5 mb-3.5 border border-[#f0ebe3]">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[13px] font-bold uppercase tracking-[0.1em] text-[#888]">
          Mon profil
        </span>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="text-[13px] font-semibold"
            style={{ color: '#8B5A3A' }}
          >
            Modifier
          </button>
        )}
      </div>

      {editing ? (
        <div className="space-y-3">
          <div>
            <label className="block text-[13px] text-[#888] mb-1">Nom</label>
            <Input value={nom} onChange={(e) => setNom(e.target.value)} />
          </div>
          <div>
            <label className="block text-[13px] text-[#888] mb-1">Téléphone</label>
            <Input value={telephone} onChange={(e) => setTelephone(e.target.value)} />
          </div>
          <div>
            <label className="block text-[13px] text-[#888] mb-1">Email</label>
            <Input value={email} disabled className="opacity-50" />
            <p className="text-[11px] text-[#aaa] mt-1">L'email ne peut pas être modifié ici.</p>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex gap-2 pt-1">
            <Button
              variant="outline"
              onClick={() => setEditing(false)}
              className="flex-1"
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading || !nom || !telephone}
              className="flex-1 text-white"
              style={{ backgroundColor: '#8B5A3A' }}
            >
              {loading ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </div>
        </div>
      ) : (
        <>
          <InfoRow label="Nom" value={profile.nom} />
          <InfoRow label="Téléphone" value={profile.telephone} />
          <InfoRow label="Email" value={email} />
        </>
      )}
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-[#f5f0eb] last:border-0">
      <span className="text-[13px] text-[#888]">{label}</span>
      <span className="text-[14px] font-medium text-[#1a1a1a]">{value}</span>
    </div>
  )
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/account/profile-card.tsx
git commit -m "feat: add ProfileCard component with inline edit"
```

---

## Task 7: DogPhotoUpload component (Cloudinary)

**Files:**

- Create: `src/components/account/dog-photo-upload.tsx`

- [ ] **Step 1: Add Cloudinary env vars**

Add to `.env.local`:

```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=merci_murphy_dogs
```

Note: create the upload preset in the Cloudinary dashboard → Settings → Upload → Add upload preset. Set it to "Unsigned", folder: `dogs`, allowed formats: `jpg,png,webp`.

- [ ] **Step 2: Write the component**

```typescript
'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'

interface DogPhotoUploadProps {
  currentUrl: string | null
  dogName: string
  onUpload: (url: string) => void
}

export function DogPhotoUpload({ currentUrl, dogName, onUpload }: DogPhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!)
      formData.append('folder', 'dogs')

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      )
      const data = await res.json()
      if (data.secure_url) {
        onUpload(data.secure_url)
      }
    } finally {
      setUploading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      className="relative w-[60px] h-[60px] rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center text-2xl"
      style={{ backgroundColor: '#e8dece' }}
      disabled={uploading}
      title="Changer la photo"
    >
      {currentUrl ? (
        <Image
          src={currentUrl}
          alt={dogName}
          fill
          className="object-cover"
          sizes="60px"
        />
      ) : (
        <span>{uploading ? '⏳' : '🐶'}</span>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </button>
  )
}
```

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/account/dog-photo-upload.tsx
git commit -m "feat: add DogPhotoUpload component with Cloudinary"
```

---

## Task 8: DogForm component

**Files:**

- Create: `src/components/account/dog-form.tsx`

- [ ] **Step 1: Write the component**

```typescript
'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { BreedCombobox } from '@/components/ui/breed-combobox'
import { DogPhotoUpload } from '@/components/account/dog-photo-upload'
import { addDog, updateDog } from '@/lib/dog-actions'
import type { Dog } from '@/lib/auth-actions'

const POIDS = [
  { value: '0-5kg', label: 'Moins de 5 kg' },
  { value: '5-10kg', label: '5 – 10 kg' },
  { value: '10-20kg', label: '10 – 20 kg' },
  { value: '20-40kg', label: '20 – 40 kg' },
  { value: '+40kg', label: 'Plus de 40 kg' },
]

const ETAT_POIL = [
  { value: 'normal', label: 'Normal' },
  { value: 'emmele', label: 'Emmêlé / Nœuds' },
  { value: 'long', label: 'Long' },
  { value: 'court', label: 'Court' },
]

interface DogFormProps {
  dog?: Dog
  onClose: () => void
}

export function DogForm({ dog, onClose }: DogFormProps) {
  const [name, setName] = useState(dog?.name ?? '')
  const [breed, setBreed] = useState(dog?.breed ?? '')
  const [age, setAge] = useState(dog?.age ?? '')
  const [poids, setPoids] = useState(dog?.poids ?? '')
  const [etatPoil, setEtatPoil] = useState(dog?.etat_poil ?? '')
  const [photoUrl, setPhotoUrl] = useState(dog?.photo_url ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    const payload = { name, breed, age, poids, etat_poil: etatPoil, photo_url: photoUrl }
    const result = dog ? await updateDog(dog.id, payload) : await addDog(payload)
    setLoading(false)
    if (result.success) {
      onClose()
    } else {
      setError(result.error ?? 'Une erreur est survenue.')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <DogPhotoUpload
          currentUrl={photoUrl || null}
          dogName={name || 'Chien'}
          onUpload={setPhotoUrl}
        />
      </div>
      <div>
        <label className="block text-[13px] text-[#888] mb-1">Prénom *</label>
        <Input
          placeholder="Ex: Rocky, Bella…"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-[13px] text-[#888] mb-1">Race</label>
        <BreedCombobox value={breed} onChange={setBreed} />
      </div>
      <div>
        <label className="block text-[13px] text-[#888] mb-1">Âge</label>
        <Select value={age} onValueChange={setAge}>
          <SelectTrigger>
            <SelectValue placeholder="Âge" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="moins-de-1-an">Moins d&apos;1 an</SelectItem>
            <SelectItem value="1-an">1 an</SelectItem>
            <SelectItem value="2-ans">2 ans</SelectItem>
            <SelectItem value="3-ans">3 ans</SelectItem>
            <SelectItem value="4-ans">4 ans</SelectItem>
            <SelectItem value="5-ans">5 ans</SelectItem>
            <SelectItem value="6-ans">6 ans</SelectItem>
            <SelectItem value="7-ans">7 ans</SelectItem>
            <SelectItem value="8-ans">8 ans</SelectItem>
            <SelectItem value="9-ans">9 ans</SelectItem>
            <SelectItem value="10-ans">10 ans</SelectItem>
            <SelectItem value="plus-de-10-ans">Plus de 10 ans</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="block text-[13px] text-[#888] mb-1">Poids</label>
        <Select value={poids} onValueChange={setPoids}>
          <SelectTrigger>
            <SelectValue placeholder="Poids approximatif" />
          </SelectTrigger>
          <SelectContent>
            {POIDS.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="block text-[13px] text-[#888] mb-1">État du pelage</label>
        <Select value={etatPoil} onValueChange={setEtatPoil}>
          <SelectTrigger>
            <SelectValue placeholder="État du pelage" />
          </SelectTrigger>
          <SelectContent>
            {ETAT_POIL.map((e) => (
              <SelectItem key={e.value} value={e.value}>
                {e.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex gap-2 pt-1">
        <Button variant="outline" onClick={onClose} className="flex-1" disabled={loading}>
          Annuler
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={loading || !name}
          className="flex-1 text-white"
          style={{ backgroundColor: '#8B5A3A' }}
        >
          {loading ? 'Enregistrement…' : dog ? 'Enregistrer' : 'Ajouter'}
        </Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/account/dog-form.tsx
git commit -m "feat: add DogForm component"
```

---

## Task 9: DogsCard component

**Files:**

- Create: `src/components/account/dogs-card.tsx`

- [ ] **Step 1: Write the component**

```typescript
'use client'

import { useState } from 'react'
import Image from 'next/image'
import { DogForm } from '@/components/account/dog-form'
import type { Dog } from '@/lib/auth-actions'

interface DogsCardProps {
  dogs: Dog[]
}

export function DogsCard({ dogs }: DogsCardProps) {
  const [addingNew, setAddingNew] = useState(false)
  const [editingDog, setEditingDog] = useState<Dog | null>(null)

  return (
    <div className="bg-white rounded-[18px] p-5 mb-3.5 border border-[#f0ebe3]">
      <div className="mb-4">
        <span className="text-[13px] font-bold uppercase tracking-[0.1em] text-[#888]">
          Mes chiens
        </span>
      </div>

      {dogs.map((dog) => (
        <div key={dog.id}>
          {editingDog?.id === dog.id ? (
            <div className="mb-3 p-4 rounded-[14px]" style={{ backgroundColor: '#fdf9f5' }}>
              <p className="text-[13px] font-semibold mb-3">Modifier {dog.name}</p>
              <DogForm dog={dog} onClose={() => setEditingDog(null)} />
            </div>
          ) : (
            <DogSubCard dog={dog} onEdit={() => setEditingDog(dog)} />
          )}
        </div>
      ))}

      {addingNew ? (
        <div className="p-4 rounded-[14px] mb-2.5" style={{ backgroundColor: '#fdf9f5' }}>
          <p className="text-[13px] font-semibold mb-3">Ajouter un chien</p>
          <DogForm onClose={() => setAddingNew(false)} />
        </div>
      ) : (
        <button
          onClick={() => setAddingNew(true)}
          className="w-full flex items-center justify-center gap-2 py-3.5 border-2 border-dashed rounded-[14px] text-[14px] font-medium text-[#888] transition-colors hover:border-[#C4845A] hover:text-[#8B5A3A]"
          style={{ borderColor: '#e8dece' }}
        >
          + Ajouter un chien
        </button>
      )}
    </div>
  )
}

function DogSubCard({ dog, onEdit }: { dog: Dog; onEdit: () => void }) {
  return (
    <div
      className="flex items-center gap-3.5 p-3.5 rounded-[14px] mb-2.5 border border-[#f0ebe3]"
      style={{ backgroundColor: '#fdf9f5' }}
    >
      <div
        className="w-[60px] h-[60px] rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center text-2xl relative"
        style={{ backgroundColor: '#e8dece' }}
      >
        {dog.photo_url ? (
          <Image
            src={dog.photo_url}
            alt={dog.name}
            fill
            className="object-cover"
            sizes="60px"
          />
        ) : (
          <span>🐶</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-bold text-[#1a1a1a] mb-0.5">{dog.name}</p>
        {(dog.breed || dog.age) && (
          <p className="text-[12px] text-[#888]">
            {[dog.breed, dog.age].filter(Boolean).join(' · ')}
          </p>
        )}
        <div className="flex flex-wrap gap-1 mt-1">
          {dog.poids && <DogTag>{dog.poids}</DogTag>}
          {dog.etat_poil && <DogTag>{dog.etat_poil}</DogTag>}
        </div>
      </div>
      <button
        onClick={onEdit}
        className="text-[#ccc] text-[18px] hover:text-[#8B5A3A] transition-colors flex-shrink-0"
        aria-label={`Modifier ${dog.name}`}
      >
        ›
      </button>
    </div>
  )
}

function DogTag({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full"
      style={{ backgroundColor: '#f0ebe3', color: '#8B5A3A' }}
    >
      {children}
    </span>
  )
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/account/dogs-card.tsx
git commit -m "feat: add DogsCard component"
```

---

## Task 10: BookingCta component

**Files:**

- Create: `src/components/account/booking-cta.tsx`

- [ ] **Step 1: Write the component**

```typescript
export function BookingCta() {
  const calendlyUrl = process.env.NEXT_PUBLIC_CALENDLY_URL ?? '#'

  return (
    <div className="rounded-[18px] p-5 px-6 mb-3.5 text-white" style={{ backgroundColor: '#8B5A3A' }}>
      <h3 className="font-display text-[18px] mb-1.5">Prendre rendez-vous</h3>
      <p className="text-[13px] mb-4" style={{ opacity: 0.8 }}>
        Réservez directement en ligne pour votre chien.
      </p>
      <a
        href={calendlyUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block bg-white text-[13px] font-bold px-5 py-2.5 rounded-full"
        style={{ color: '#8B5A3A' }}
      >
        Réserver en ligne
      </a>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/account/booking-cta.tsx
git commit -m "feat: add BookingCta component"
```

---

## Task 11: VisitTimeline component

**Files:**

- Create: `src/components/account/visit-timeline.tsx`

- [ ] **Step 1: Write the component**

```typescript
import type { Visit, Dog } from '@/lib/auth-actions'

const SERVICE_LABELS: Record<string, string> = {
  toilettage: 'Toilettage complet',
  bains: 'Bain en libre-service',
  creche: 'Crèche canine',
  education: 'Éducation canine',
  osteo: 'Ostéopathie',
  autre: 'Autre',
}

const SERVICE_EMOJI: Record<string, string> = {
  toilettage: '✂️',
  bains: '🛁',
  creche: '🐾',
  education: '🎓',
  osteo: '🤲',
  autre: '📋',
}

interface VisitTimelineProps {
  visits: Visit[]
  dogs: Dog[]
}

export function VisitTimeline({ visits, dogs }: VisitTimelineProps) {
  const dogMap = new Map(dogs.map((d) => [d.id, d.name]))

  return (
    <div className="bg-white rounded-[18px] p-5 border border-[#f0ebe3]">
      <div className="mb-4">
        <span className="text-[13px] font-bold uppercase tracking-[0.1em] text-[#888]">
          Historique des visites
        </span>
      </div>

      {visits.length === 0 ? (
        <p className="text-[13px] text-[#aaa] text-center py-4">Aucune visite enregistrée.</p>
      ) : (
        <>
          {visits.map((visit, i) => (
            <div
              key={visit.id}
              className="flex gap-3.5 items-start py-3"
              style={{
                borderBottom: i < visits.length - 1 ? '1px solid #f5f0eb' : undefined,
              }}
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0 mt-0.5"
                style={{ backgroundColor: '#f0ebe3' }}
              >
                {SERVICE_EMOJI[visit.service] ?? '📋'}
              </div>
              <div>
                <p className="text-[14px] font-semibold text-[#1a1a1a]">
                  {SERVICE_LABELS[visit.service] ?? visit.service}
                </p>
                <p className="text-[12px] text-[#888] mt-0.5">
                  {new Date(visit.date).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
                {visit.dog_id && dogMap.has(visit.dog_id) && (
                  <span
                    className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full mt-1"
                    style={{ backgroundColor: '#f0ebe3', color: '#8B5A3A' }}
                  >
                    🐶 {dogMap.get(visit.dog_id)}
                  </span>
                )}
              </div>
            </div>
          ))}
          <p className="text-[11px] text-[#aaa] text-center mt-2">
            {visits.length} {visits.length === 1 ? 'visite' : 'visites'} au total
          </p>
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/account/visit-timeline.tsx
git commit -m "feat: add VisitTimeline component"
```

---

## Task 12: Update AuthButton — add "Mon compte" link

**Files:**

- Modify: `src/components/layout/auth-button.tsx`

- [ ] **Step 1: Add Mon compte link to dropdown**

Find the dropdown block inside `AuthButton` (when `isLoggedIn` is true). Add a link to `/compte` before the sign-out button:

```typescript
// Replace the dropdown content (the div with className "absolute right-0 top-8 z-20 w-44 ...")
<div className="absolute right-0 top-8 z-20 w-44 rounded-xl border border-charcoal/10 bg-cream shadow-lg">
  <Link
    href="/compte"
    onClick={() => setOpen(false)}
    className="flex w-full items-center gap-2 px-4 py-3 text-sm text-charcoal/70 hover:text-terracotta transition-colors"
  >
    <User className="h-4 w-4" />
    Mon compte
  </Link>
  <form action={signOut}>
    <button
      type="submit"
      className="flex w-full items-center gap-2 px-4 py-3 text-sm text-charcoal/70 hover:text-red-500 transition-colors border-t border-charcoal/5"
    >
      <LogOut className="h-4 w-4" />
      Se déconnecter
    </button>
  </form>
</div>
```

Also add `Link` to the existing imports at the top of the file (it is already imported — no change needed).

- [ ] **Step 2: Type-check + lint**

```bash
npx tsc --noEmit && npm run lint
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/auth-button.tsx
git commit -m "feat: add Mon compte link to AuthButton dropdown"
```

---

## Task 13: Add Cloudinary domain to next.config.mjs

**Files:**

- Modify: `next.config.mjs`

- [ ] **Step 1: Add res.cloudinary.com to allowed image domains**

In `next.config.mjs`, find the `images` configuration block and add Cloudinary to the `remotePatterns`:

```javascript
// Add inside the remotePatterns array:
{
  protocol: 'https',
  hostname: 'res.cloudinary.com',
},
```

- [ ] **Step 2: Verify dev server starts without warnings**

```bash
npm run build 2>&1 | head -30
```

Expected: no image domain warnings, build succeeds.

- [ ] **Step 3: Commit**

```bash
git add next.config.mjs
git commit -m "feat: allow res.cloudinary.com for Next.js image optimization"
```

---

## Task 14: Final type-check and smoke test

- [ ] **Step 1: Full type-check**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 2: Build check**

```bash
npm run build
```

Expected: build succeeds, `/compte` appears as a dynamic route (it uses `createSupabaseServerClient` which reads cookies).

- [ ] **Step 3: Manual smoke test (dev server)**

```bash
npm run dev
```

Verify:

1. Visit `/compte` while logged out → redirects to `/compte/connexion?redirect=/compte`
2. Log in → redirects to `/compte` → welcome card shows first name + member date
3. Profile card shows name, phone, email — "Modifier" button opens inline edit
4. Dogs card shows add button; clicking opens form; submitting adds a dog
5. Editing a dog (› button) opens the form pre-filled
6. Photo circle is tappable (opens file picker)
7. Visit timeline shows placeholder if no visits
8. AuthButton dropdown shows "Mon compte" link

- [ ] **Step 4: Commit if any fixes needed, then push**

```bash
git push
```
