# Dog Schema Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move all dog-related fields out of `profiles` and into `dogs`, add `dog_id` to visits, and add dog selection to the toilettage booking flow.

**Architecture:** The `profiles` table becomes human-only (nom, telephone, can_book, admission_passed, newsletter_subscribed). All dog data lives in `dogs` (name, breed, age, poids, etat_poil, grooming_duration, numero_puce, photo_url, notes). A Supabase migration handles data copy + column drop. Code is updated layer by layer: types → server actions/API routes → components.

**Tech Stack:** Next.js 14 App Router, TypeScript strict, Supabase (supabaseAdmin service role), Zod, Resend emails, React client components.

---

## Current state (read before starting)

**`profiles` table columns to REMOVE after migration:**
`nom_chien`, `race_chien`, `age_chien`, `poids_chien`, `etat_poil`, `grooming_duration`, `numero_puce`

**`dogs` table — columns ALREADY there:**
`id`, `created_at`, `owner_id`, `name`, `breed`, `age`, `poids`, `etat_poil`, `photo_url`, `grooming_duration`, `notes`, `can_book_online`

**`dogs` table — columns MISSING (need adding):**
`numero_puce`

**`visits` table — already has `dog_id uuid` (nullable, references dogs)**

---

## File Map

| File                                                              | What changes                                                                                                                                       |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `supabase/migrations/20260413000001_drop_profile_dog_columns.sql` | CREATE: add numero_puce to dogs, copy grooming_duration + age_chien + numero_puce from profiles to dogs, drop all dog columns from profiles        |
| `src/lib/supabase-admin.ts`                                       | Remove dog fields from Profile interface; remove from CreateProfileInput; update createProfileWithAuth, updateProfile, getProfiles, searchProfiles |
| `src/lib/auth-actions.ts`                                         | Remove dog fields from Profile interface + SignUpSchema; update signUp to not write dog fields to profiles                                         |
| `src/app/api/dashboard/customers/[id]/profile/route.ts`           | PATCH now only updates human fields on profiles; dog updates go to dogs table via separate endpoint                                                |
| `src/app/api/dashboard/customers/[id]/dogs/route.ts`              | CREATE: GET (list dogs for customer), POST (add dog for customer)                                                                                  |
| `src/app/api/dashboard/customers/[id]/dogs/[dogId]/route.ts`      | CREATE: PATCH (update dog), DELETE (remove dog)                                                                                                    |
| `src/app/api/dashboard/customers/create/route.ts`                 | Remove dog fields from profile insert; dog data goes only to dogs table                                                                            |
| `src/app/api/booking/confirm/route.ts`                            | Accept `dogId` in request body; read grooming_duration from dogs instead of profiles                                                               |
| `src/app/api/dashboard/calendar/route.ts`                         | Read dog name from dogs table (via dog_id on visit or via profile_id)                                                                              |
| `src/app/api/cron/booking-reminder/route.ts`                      | Read dog name from dogs table                                                                                                                      |
| `src/app/api/cron/thank-you/route.ts`                             | Read dog name from dogs table                                                                                                                      |
| `src/app/api/dashboard/visits/[id]/reschedule/route.ts`           | Read dog name from dogs table                                                                                                                      |
| `src/app/api/dashboard/visits/[id]/confirm-deposit/route.ts`      | Read dog name from dogs table                                                                                                                      |
| `src/components/dashboard/customer-detail.tsx`                    | Remove profile dog fields from editData; dog editing goes through dogs API; display multiple dogs via dogs prop                                    |
| `src/components/dashboard/customers-table.tsx`                    | Remove nom_chien/race_chien from Profile type usage (pass dogs separately or denormalize)                                                          |
| `src/components/dashboard/new-reservation-form.tsx`               | Remove profile dog fields; new client form writes dog data only to dogs table                                                                      |
| `src/components/dashboard/calendar-view.tsx`                      | nom_chien comes from dog join, not profile                                                                                                         |
| `src/components/dashboard/notification-bell.tsx`                  | profiles join no longer has nom_chien; use dogs join                                                                                               |
| `src/components/forms/slot-picker.tsx`                            | Accept `dogs` prop instead of relying on `profile.grooming_duration`; add dog selection step for toilettage                                        |
| `src/app/(marketing)/reservation/page.tsx`                        | Fetch dogs and pass to SlotPicker; pass first dog's fields to ReservationForm                                                                      |
| `src/lib/auth-actions.ts` (updateProfile)                         | Remove dog fields from UpdateProfileSchema                                                                                                         |

---

## Task 1: DB migration — add numero_puce to dogs, copy data, drop profile dog columns

**Files:**

- Create: `supabase/migrations/20260413000001_drop_profile_dog_columns.sql`

- [ ] **Step 1: Write the migration**

```sql
-- 1. Add missing column to dogs
alter table public.dogs
  add column if not exists numero_puce text;

-- 2. Copy grooming_duration from profiles → dogs (for existing rows)
update public.dogs d
set grooming_duration = p.grooming_duration
from public.profiles p
where d.owner_id = p.id
  and p.grooming_duration is not null
  and d.grooming_duration is null;

-- 3. Copy age_chien from profiles → dogs
update public.dogs d
set age = p.age_chien
from public.profiles p
where d.owner_id = p.id
  and p.age_chien is not null
  and d.age is null;

-- 4. Copy numero_puce from profiles → dogs
update public.dogs d
set numero_puce = p.numero_puce
from public.profiles p
where d.owner_id = p.id
  and p.numero_puce is not null
  and d.numero_puce is null;

-- 5. Drop dog columns from profiles
alter table public.profiles
  drop column if exists nom_chien,
  drop column if exists race_chien,
  drop column if exists age_chien,
  drop column if exists poids_chien,
  drop column if exists etat_poil,
  drop column if exists grooming_duration,
  drop column if exists numero_puce;
```

- [ ] **Step 2: Run this migration in Supabase**

Go to Supabase Dashboard → SQL Editor → paste and run.

Verify with:

```sql
select column_name from information_schema.columns
where table_name = 'profiles' and table_schema = 'public'
order by column_name;
```

Expected: no nom_chien, race_chien, age_chien, poids_chien, etat_poil, grooming_duration, numero_puce.

```sql
select column_name from information_schema.columns
where table_name = 'dogs' and table_schema = 'public'
order by column_name;
```

Expected: numero_puce present.

- [ ] **Step 3: Commit the migration file**

```bash
git add supabase/migrations/20260413000001_drop_profile_dog_columns.sql
git commit -m "feat(db): drop dog columns from profiles, add numero_puce to dogs"
```

---

## Task 2: Update TypeScript interfaces — Profile and Dog

**Files:**

- Modify: `src/lib/supabase-admin.ts`
- Modify: `src/lib/auth-actions.ts`

- [ ] **Step 1: Update Profile interface in `src/lib/supabase-admin.ts`**

Replace the existing `Profile` interface (around line 15):

```typescript
export interface Profile {
  id: string
  created_at: string
  nom: string
  telephone: string
  notes: string | null
  can_book: boolean
  admission_passed: boolean
  newsletter_subscribed: boolean
}
```

Add `numero_puce` to the `Dog` interface (or create if not present):

```typescript
export interface Dog {
  id: string
  created_at: string
  owner_id: string
  name: string
  breed: string | null
  age: string | null
  poids: string | null
  etat_poil: string | null
  photo_url: string | null
  grooming_duration: number | null
  numero_puce: string | null
  notes: string | null
  can_book_online: boolean
}
```

- [ ] **Step 2: Update Profile interface in `src/lib/auth-actions.ts`**

Replace around line 15:

```typescript
export interface Profile {
  id: string
  nom: string
  telephone: string
  can_book: boolean
  admission_passed: boolean
  newsletter_subscribed: boolean
}
```

- [ ] **Step 3: Update SignUpSchema in `src/lib/auth-actions.ts`**

Remove the dog fields from SignUpSchema (lines 47–51). Keep only:

```typescript
const SignUpSchema = z.object({
  email: z
    .string()
    .email('Email invalide')
    .regex(/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/, 'Email invalide'),
  password: z
    .string()
    .min(8, 'Le mot de passe doit faire au moins 8 caractères')
    .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre'),
  prenom: z.string().min(1),
  nom: z.string().min(1),
  telephone: z.string().regex(/^\+\d+\s[\d\s]{6,}$/, 'Numéro de téléphone invalide'),
  newsletter_subscribed: z.boolean().optional(),
})
```

- [ ] **Step 4: Update signUp() in `src/lib/auth-actions.ts`**

Remove dog fields from the profiles insert (lines 82–92). New insert:

```typescript
const { error: profileError } = await supabaseAdmin.from('profiles').insert({
  id: authData.user.id,
  nom: fullNom,
  telephone: parsed.data.telephone,
  newsletter_subscribed: newsletterSubscribed,
})
```

Also remove the `if (parsed.data.nom_chien)` block — no dog insert at signup (gate handles it post-login).

Also update the welcome email call — `nom_chien` is no longer available at this point:

```typescript
html: accountWelcomeHtml(prenom, null),
```

- [ ] **Step 5: Update UpdateProfileSchema in `src/lib/auth-actions.ts`**

Remove dog fields. Keep only:

```typescript
const UpdateProfileSchema = z.object({
  nom: z.string().min(2),
  telephone: z.string().min(8),
})
```

- [ ] **Step 6: Update CreateProfileInput and createProfileWithAuth in `src/lib/supabase-admin.ts`**

New `CreateProfileInput`:

```typescript
export interface CreateProfileInput {
  email: string
  nom: string
  telephone: string
  notes?: string | null
  // Dog data — written to dogs table only
  nom_chien: string
  race_chien?: string
  age_chien?: string
  poids_chien?: string
  etat_poil?: string
  grooming_duration?: number | null
}
```

Update `createProfileWithAuth` — profile insert has no dog fields:

```typescript
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
      notes: input.notes ?? null,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  // Insert dog row
  await supabaseAdmin.from('dogs').insert({
    owner_id: authData.user.id,
    name: input.nom_chien,
    breed: input.race_chien ?? null,
    age: input.age_chien ?? null,
    poids: input.poids_chien ?? null,
    etat_poil: input.etat_poil ?? null,
    grooming_duration: input.grooming_duration ?? null,
  })

  return data
}
```

Also update `updateProfile` in `src/lib/supabase-admin.ts` to only accept Profile fields (nom, telephone, notes, can_book, admission_passed, grooming_duration removed):

```typescript
export async function updateProfile(
  id: string,
  data: Partial<Omit<Profile, 'id' | 'created_at'>>
): Promise<void> {
  const { error } = await supabaseAdmin.from('profiles').update(data).eq('id', id)
  if (error) throw error
}
```

- [ ] **Step 7: Check TypeScript compiles (expect many errors still — that's normal)**

```bash
npx tsc --noEmit 2>&1 | head -60
```

- [ ] **Step 8: Commit**

```bash
git add src/lib/supabase-admin.ts src/lib/auth-actions.ts
git commit -m "feat: strip dog fields from Profile interface and SignUpSchema"
```

---

## Task 3: Dog CRUD API routes for dashboard

**Files:**

- Create: `src/app/api/dashboard/customers/[id]/dogs/route.ts`
- Create: `src/app/api/dashboard/customers/[id]/dogs/[dogId]/route.ts`

These routes let the dashboard add/edit/delete dogs for a customer.

- [ ] **Step 1: Create `src/app/api/dashboard/customers/[id]/dogs/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { hasDashboardAccess } from '@/lib/auth-role'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!hasDashboardAccess(user.email))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data, error } = await supabaseAdmin
    .from('dogs')
    .select('*')
    .eq('owner_id', params.id)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!hasDashboardAccess(user.email))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { data, error } = await supabaseAdmin
    .from('dogs')
    .insert({
      owner_id: params.id,
      name: body.name,
      breed: body.breed ?? null,
      age: body.age ?? null,
      poids: body.poids ?? null,
      etat_poil: body.etat_poil ?? null,
      grooming_duration: body.grooming_duration ? Number(body.grooming_duration) : null,
      numero_puce: body.numero_puce ?? null,
      notes: body.notes ?? null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
```

- [ ] **Step 2: Create `src/app/api/dashboard/customers/[id]/dogs/[dogId]/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { hasDashboardAccess } from '@/lib/auth-role'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; dogId: string } }
) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!hasDashboardAccess(user.email))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { error } = await supabaseAdmin
    .from('dogs')
    .update({
      name: body.name,
      breed: body.breed ?? null,
      age: body.age ?? null,
      poids: body.poids ?? null,
      etat_poil: body.etat_poil ?? null,
      grooming_duration: body.grooming_duration ? Number(body.grooming_duration) : null,
      numero_puce: body.numero_puce ?? null,
      notes: body.notes ?? null,
    })
    .eq('id', params.dogId)
    .eq('owner_id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string; dogId: string } }
) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!hasDashboardAccess(user.email))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { error } = await supabaseAdmin
    .from('dogs')
    .delete()
    .eq('id', params.dogId)
    .eq('owner_id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 3: Commit**

```bash
git add "src/app/api/dashboard/customers/[id]/dogs/route.ts" \
        "src/app/api/dashboard/customers/[id]/dogs/[dogId]/route.ts"
git commit -m "feat: add dog CRUD API routes for dashboard"
```

---

## Task 4: Fix email-sending routes — read dog name from dogs table

The crons and visit routes currently read `nom_chien` from profiles. After migration that column is gone. They need to read from dogs instead. Since a client may have multiple dogs, we take the first dog's name as default (visits will eventually have `dog_id` — for now this is good enough).

**Files:**

- Modify: `src/app/api/cron/booking-reminder/route.ts`
- Modify: `src/app/api/cron/thank-you/route.ts`
- Modify: `src/app/api/dashboard/visits/[id]/reschedule/route.ts`
- Modify: `src/app/api/dashboard/visits/[id]/confirm-deposit/route.ts`
- Modify: `src/app/api/booking/confirm/route.ts`

- [ ] **Step 1: Fix `booking-reminder/route.ts`**

Replace the profile query inside the loop (around line 58):

```typescript
// Get first dog name for this visit's owner
const { data: firstDog } = await supabaseAdmin
  .from('dogs')
  .select('name')
  .eq('owner_id', visit.profile_id)
  .order('created_at', { ascending: true })
  .limit(1)
  .single()
```

Replace `profile?.nom_chien` with `firstDog?.name ?? null` in the email call.

- [ ] **Step 2: Fix `thank-you/route.ts`**

Same pattern — replace `profile` query + `profile?.nom_chien` with:

```typescript
const { data: firstDog } = await supabaseAdmin
  .from('dogs')
  .select('name')
  .eq('owner_id', visit.profile_id)
  .order('created_at', { ascending: true })
  .limit(1)
  .single()
```

Use `firstDog?.name ?? null` in the email call.

- [ ] **Step 3: Fix `reschedule/route.ts`**

Replace:

```typescript
const { data: profile } = await supabaseAdmin
  .from('profiles')
  .select('nom_chien')
  .eq('id', visit.profile_id)
  .single()
```

With:

```typescript
const { data: firstDog } = await supabaseAdmin
  .from('dogs')
  .select('name')
  .eq('owner_id', visit.profile_id)
  .order('created_at', { ascending: true })
  .limit(1)
  .single()
```

Replace `profile?.nom_chien` with `firstDog?.name ?? null`.

- [ ] **Step 4: Fix `confirm-deposit/route.ts`**

Current query (line 51):

```typescript
supabaseAdmin.from('profiles').select('nom, nom_chien').eq('id', visit.profile_id).single(),
```

Change to:

```typescript
supabaseAdmin.from('profiles').select('nom').eq('id', visit.profile_id).single(),
supabaseAdmin.from('dogs').select('name').eq('owner_id', visit.profile_id)
  .order('created_at', { ascending: true }).limit(1).single(),
```

Then use `profileRes.data?.nom` and `dogRes.data?.name ?? null` in the email.

- [ ] **Step 5: Fix `booking/confirm/route.ts`**

Currently reads `grooming_duration` from profiles (line 51). Now must read from the specific dog.

The request body now includes `dogId` (will be wired in Task 6). For now, handle gracefully:

Replace:

```typescript
const { data: profile } = await supabaseAdmin
  .from('profiles')
  .select('nom, nom_chien, grooming_duration')
  .eq('id', user.id)
  .single()

if (slugBase === 'toilettage' && profile?.grooming_duration && !durationOverride) {
  duration = profile.grooming_duration
}
```

With:

```typescript
const { data: profile } = await supabaseAdmin
  .from('profiles')
  .select('nom')
  .eq('id', user.id)
  .single()

// For toilettage: read grooming_duration from the specific dog (dogId in request)
const { dogId } = body // destructure from req.json() result above
let dogName: string | null = null
if (slugBase === 'toilettage' && dogId) {
  const { data: dog } = await supabaseAdmin
    .from('dogs')
    .select('name, grooming_duration')
    .eq('id', dogId)
    .eq('owner_id', user.id)
    .single()
  if (dog) {
    dogName = dog.name
    if (dog.grooming_duration && !durationOverride) duration = dog.grooming_duration
  }
} else {
  // Non-toilettage: get first dog name for email
  const { data: firstDog } = await supabaseAdmin
    .from('dogs')
    .select('name')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .single()
  dogName = firstDog?.name ?? null
}
```

Also update the insert to include `dog_id` when available:

```typescript
const { data: visit, error: visitError } = await supabaseAdmin
  .from('visits')
  .insert({
    profile_id: user.id,
    dog_id: dogId ?? null,
    service: serviceSlug,
    date,
    time: `${timeUtc}:00`,
    duration: duration + (SERVICE_BUFFER[slugBase] ?? 0),
    staff: staffName,
    status,
    price: null,
    final_price: null,
  })
  .select()
  .single()
```

Also update the internal email for pending_deposit to use `dogName` instead of `profile?.nom_chien`.

- [ ] **Step 6: Commit**

```bash
git add src/app/api/cron/booking-reminder/route.ts \
        src/app/api/cron/thank-you/route.ts \
        "src/app/api/dashboard/visits/[id]/reschedule/route.ts" \
        "src/app/api/dashboard/visits/[id]/confirm-deposit/route.ts" \
        src/app/api/booking/confirm/route.ts
git commit -m "fix: read dog name/grooming_duration from dogs table, not profiles"
```

---

## Task 5: Fix dashboard calendar and notification bell

**Files:**

- Modify: `src/app/api/dashboard/calendar/route.ts`
- Modify: `src/components/dashboard/notification-bell.tsx`

- [ ] **Step 1: Fix `calendar/route.ts`**

Currently fetches `nom_chien` from profiles. Replace the profile select:

```typescript
// Old:
const { data: profiles } = await supabaseAdmin
  .from('profiles')
  .select('id, nom, nom_chien')
  .in('id', profileIds)

const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]))

// New:
const [profilesRes, dogsRes] = await Promise.all([
  supabaseAdmin.from('profiles').select('id, nom').in('id', profileIds),
  supabaseAdmin
    .from('dogs')
    .select('owner_id, name')
    .in('owner_id', profileIds)
    .order('created_at', { ascending: true }),
])

const profileMap = Object.fromEntries((profilesRes.data ?? []).map((p) => [p.id, p]))
// First dog per owner
const dogMap: Record<string, string> = {}
for (const dog of dogsRes.data ?? []) {
  if (!dogMap[dog.owner_id]) dogMap[dog.owner_id] = dog.name
}
```

Then in the visits map:

```typescript
const visits = (data ?? []).map((v) => ({
  ...v,
  client_nom: profileMap[v.profile_id]?.nom ?? '—',
  nom_chien: dogMap[v.profile_id] ?? null,
  staff_color: v.staff ? (staffColorMap[v.staff] ?? '#4F6072') : '#4F6072',
}))
```

- [ ] **Step 2: Fix `notification-bell.tsx`**

The supabase query joins profiles:

```typescript
.select('id, profile_id, service, status, created_at, profiles(nom, nom_chien)')
```

Remove `nom_chien` from the join — profiles no longer has it:

```typescript
.select('id, profile_id, service, status, created_at, profiles(nom)')
```

Then the name shown in notifications should use the profile nom (not nom_chien which was already a fallback):

```typescript
const name = (profile as { nom?: string } | null)?.nom ?? '—'
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/dashboard/calendar/route.ts \
        src/components/dashboard/notification-bell.tsx
git commit -m "fix: remove nom_chien from profiles join in calendar and notification bell"
```

---

## Task 6: Fix customer detail component (dashboard)

The `CustomerDetail` component currently has `editData` with all dog fields, and `saveProfile` sends them to `/api/dashboard/customers/[id]/profile`. After the migration, dog fields must go to the dog API routes.

**Files:**

- Modify: `src/components/dashboard/customer-detail.tsx`
- Modify: `src/app/(dashboard)/dashboard/customers/[id]/page.tsx` (already passes `dogs` prop — verify it's correct)

- [ ] **Step 1: Simplify editData in `customer-detail.tsx`**

Replace the current `editData` state (line 41–51) with only profile fields:

```typescript
const [editData, setEditData] = useState({
  nom: initial.nom,
  telephone: initial.telephone,
})
```

- [ ] **Step 2: Update saveProfile() to only PATCH profile fields**

The fetch already calls `/api/dashboard/customers/${profile.id}/profile`. Just send `{ nom, telephone }`:

```typescript
async function saveProfile() {
  setEditSaving(true)
  await fetch(`/api/dashboard/customers/${profile.id}/profile`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nom: editData.nom, telephone: editData.telephone }),
  })
  setProfile((p) => ({ ...p, nom: editData.nom, telephone: editData.telephone }))
  setEditSaving(false)
  setEditing(false)
}
```

- [ ] **Step 3: Replace dog editing section with per-dog forms**

In the edit panel (currently lines 415–491), replace the dog fields with a section per dog using the `dogs` prop. Each dog gets its own inline edit form that PATCHes `/api/dashboard/customers/[id]/dogs/[dogId]`:

```typescript
// Dog editing state — one entry per dog id
const [editingDogId, setEditingDogId] = useState<string | null>(null)
const [dogEdits, setDogEdits] = useState<
  Record<
    string,
    {
      name: string
      breed: string
      age: string
      poids: string
      etat_poil: string
      grooming_duration: string
      numero_puce: string
      notes: string
    }
  >
>({})

function startEditDog(dog: DogRow) {
  setEditingDogId(dog.id)
  setDogEdits((prev) => ({
    ...prev,
    [dog.id]: {
      name: dog.name,
      breed: dog.breed ?? '',
      age: dog.age ?? '',
      poids: dog.poids ?? '',
      etat_poil: dog.etat_poil ?? '',
      grooming_duration: dog.grooming_duration?.toString() ?? '',
      numero_puce: dog.numero_puce ?? '',
      notes: dog.notes ?? '',
    },
  }))
}

async function saveDog(dogId: string) {
  const d = dogEdits[dogId]
  if (!d) return
  await fetch(`/api/dashboard/customers/${profile.id}/dogs/${dogId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...d,
      grooming_duration: d.grooming_duration ? Number(d.grooming_duration) : null,
    }),
  })
  setEditingDogId(null)
  router.refresh()
}

async function addDogForCustomer() {
  const res = await fetch(`/api/dashboard/customers/${profile.id}/dogs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Nouveau chien' }),
  })
  if (res.ok) router.refresh()
}

async function deleteDogForCustomer(dogId: string) {
  if (!confirm('Supprimer ce chien ?')) return
  await fetch(`/api/dashboard/customers/${profile.id}/dogs/${dogId}`, { method: 'DELETE' })
  router.refresh()
}
```

In the JSX, replace the dog section in the non-editing view to use `dogs` prop. In the editing view, show dog forms per dog:

```tsx
{
  /* Dogs section */
}
;<div className="mt-5 pt-5 border-t border-gray-100">
  <div className="flex items-center justify-between mb-3">
    <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
      {dogs.length > 1 ? 'Chiens' : 'Chien'}
    </p>
    {editing && (
      <button onClick={addDogForCustomer} className="text-xs text-[#1D164E] underline">
        + Ajouter
      </button>
    )}
  </div>
  {dogs.map((dog) => (
    <div key={dog.id} className="mb-4 p-3 rounded-xl bg-gray-50">
      {editingDogId === dog.id ? (
        <div className="space-y-2">
          {[
            { key: 'name', label: 'Nom' },
            { key: 'breed', label: 'Race' },
            { key: 'age', label: 'Âge' },
            { key: 'poids', label: 'Poids' },
            { key: 'etat_poil', label: 'État du poil' },
            { key: 'numero_puce', label: 'N° puce' },
            { key: 'grooming_duration', label: 'Durée toilettage (min)' },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
              <input
                className={inputCls}
                value={dogEdits[dog.id]?.[key as keyof (typeof dogEdits)[string]] ?? ''}
                onChange={(e) =>
                  setDogEdits((prev) => ({
                    ...prev,
                    [dog.id]: { ...prev[dog.id], [key]: e.target.value },
                  }))
                }
              />
            </div>
          ))}
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => saveDog(dog.id)}
              className="flex-1 bg-[#1D164E] text-white rounded-lg py-1.5 text-xs font-medium"
            >
              Sauvegarder
            </button>
            <button
              onClick={() => setEditingDogId(null)}
              className="px-3 rounded-lg border border-gray-200 text-xs text-gray-500"
            >
              Annuler
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-1 text-sm">
          <div className="flex justify-between items-start">
            <p className="font-medium text-[#1D164E]">{dog.name}</p>
            {editing && (
              <div className="flex gap-2">
                <button
                  onClick={() => startEditDog(dog)}
                  className="text-xs text-gray-400 hover:text-[#1D164E]"
                >
                  Modifier
                </button>
                <button
                  onClick={() => deleteDogForCustomer(dog.id)}
                  className="text-xs text-red-400"
                >
                  Supprimer
                </button>
              </div>
            )}
          </div>
          {dog.breed && (
            <p>
              <span className="text-gray-400">Race :</span> {dog.breed}
            </p>
          )}
          {dog.age && (
            <p>
              <span className="text-gray-400">Âge :</span> {dog.age}
            </p>
          )}
          {dog.poids && (
            <p>
              <span className="text-gray-400">Poids :</span> {dog.poids}
            </p>
          )}
          {dog.etat_poil && (
            <p>
              <span className="text-gray-400">Poil :</span> {dog.etat_poil}
            </p>
          )}
          {dog.numero_puce && (
            <p>
              <span className="text-gray-400">N° puce :</span>{' '}
              <span className="font-mono text-xs">{dog.numero_puce}</span>
            </p>
          )}
          {dog.grooming_duration && (
            <p>
              <span className="text-gray-400">Durée séance :</span>{' '}
              <span className="font-medium text-[#1D164E]">{dog.grooming_duration} min</span>
            </p>
          )}
        </div>
      )}
    </div>
  ))}
  {dogs.length === 0 && <p className="text-sm text-gray-400">Aucun chien enregistré.</p>}
</div>
```

Also remove `grooming_duration` and `numero_puce` from `setProfile` call in saveProfile — those no longer exist on Profile type.

- [ ] **Step 4: Commit**

```bash
git add src/components/dashboard/customer-detail.tsx
git commit -m "feat: per-dog editing in customer detail, profile form is human-only"
```

---

## Task 7: Fix customers table and new-reservation-form

**Files:**

- Modify: `src/components/dashboard/customers-table.tsx`
- Modify: `src/app/(dashboard)/dashboard/customers/page.tsx`
- Modify: `src/components/dashboard/new-reservation-form.tsx`
- Modify: `src/app/api/dashboard/customers/search/route.ts`

- [ ] **Step 1: Update customers page to pass dogs data**

In `src/app/(dashboard)/dashboard/customers/page.tsx`, fetch dogs alongside profiles:

```typescript
import { getProfiles, supabaseAdmin } from '@/lib/supabase-admin'
import { CustomersTable } from '@/components/dashboard/customers-table'

export const dynamic = 'force-dynamic'

export default async function CustomersPage() {
  const profiles = await getProfiles()
  const profileIds = profiles.map((p) => p.id)

  // Fetch first dog per owner for table display
  const { data: dogsRows } = await supabaseAdmin
    .from('dogs')
    .select('owner_id, name, breed')
    .in('owner_id', profileIds)
    .order('created_at', { ascending: true })

  // Build map: owner_id → first dog
  const dogMap: Record<string, { name: string; breed: string | null }> = {}
  for (const dog of dogsRows ?? []) {
    if (!dogMap[dog.owner_id]) dogMap[dog.owner_id] = { name: dog.name, breed: dog.breed }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1D164E] mb-8">
        Clients{' '}
        <span className="text-sm font-normal text-gray-400 ml-1">{profiles.length} inscrits</span>
      </h1>
      {profiles.length === 0 ? (
        <p className="text-gray-400">Aucun profil client enregistré.</p>
      ) : (
        <CustomersTable profiles={profiles} dogMap={dogMap} />
      )}
    </div>
  )
}
```

- [ ] **Step 2: Update `CustomersTable` to use dogMap**

```typescript
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'
import type { Profile } from '@/lib/supabase-admin'

interface DogSummary {
  name: string
  breed: string | null
}

export function CustomersTable({
  profiles,
  dogMap,
}: {
  profiles: Profile[]
  dogMap: Record<string, DogSummary>
}) {
  const [query, setQuery] = useState('')

  const filtered = profiles.filter((p) => {
    const q = query.toLowerCase()
    const dog = dogMap[p.id]
    return (
      p.nom.toLowerCase().includes(q) ||
      (dog?.name ?? '').toLowerCase().includes(q) ||
      (dog?.breed ?? '').toLowerCase().includes(q) ||
      p.telephone.toLowerCase().includes(q)
    )
  })

  return (
    <div>
      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher par nom, chien, race, téléphone…"
          className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1D164E]"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-gray-400">Aucun résultat.</p>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3 font-medium text-gray-500">Client</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Chien</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500 hidden sm:table-cell">Race</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500 hidden md:table-cell">Téléphone</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500 hidden lg:table-cell">Inscrit le</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const dog = dogMap[p.id]
                return (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 font-medium text-[#1D164E]">{p.nom}</td>
                    <td className="px-5 py-4 text-gray-700">{dog?.name ?? '—'}</td>
                    <td className="px-5 py-4 text-gray-500 hidden sm:table-cell">{dog?.breed ?? '—'}</td>
                    <td className="px-5 py-4 text-gray-500 hidden md:table-cell">{p.telephone}</td>
                    <td className="px-5 py-4 text-gray-400 hidden lg:table-cell">
                      {new Date(p.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link href={`/dashboard/customers/${p.id}`} className="text-xs font-medium text-[#1D164E] hover:underline">
                        Voir →
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Fix new-reservation-form**

In `src/components/dashboard/new-reservation-form.tsx`:

Remove `nom_chien`, `race_chien`, `age_chien`, `poids_chien`, `etat_poil`, `grooming_duration` from `newClient` state and from the `selectedProfile` display (profile no longer has these).

New `newClient` state:

```typescript
const [newClient, setNewClient] = useState({
  email: '',
  nom: '',
  telephone: '',
  // Dog info — goes to dogs table
  nom_chien: '',
  race_chien: '',
  age_chien: '',
  poids_chien: '',
  etat_poil: '',
  grooming_duration: '',
  notes: '',
})
```

The `handleCreateClient` call and the API route still accept dog fields as before — they're routed to the dogs table by `createProfileWithAuth`. No changes needed to the API call itself.

For the `selectedProfile` display, remove the `nom_chien` + `grooming_duration` line. Show `{selectedProfile.nom}` and `{selectedProfile.telephone}` only. Dog info will be visible in the customer detail page.

- [ ] **Step 4: Check TypeScript**

```bash
npx tsc --noEmit 2>&1 | grep "error TS" | head -30
```

Fix any remaining type errors (primarily Profile type references that still expect dog fields).

- [ ] **Step 5: Commit**

```bash
git add src/components/dashboard/customers-table.tsx \
        "src/app/(dashboard)/dashboard/customers/page.tsx" \
        src/components/dashboard/new-reservation-form.tsx
git commit -m "fix: customers table and new-reservation-form use dogs table instead of profile"
```

---

## Task 8: Fix client-facing reservation page and slot picker — dog selection for toilettage

Currently `SlotPicker` reads `profile.grooming_duration` directly. After the migration, the profile has no `grooming_duration`. We need to:

1. Fetch the client's dogs and pass them to `SlotPicker`
2. Add a dog-selection step before the date/time picker for toilettage (if the client has multiple dogs)
3. Send `dogId` when confirming the booking

**Files:**

- Modify: `src/app/(marketing)/reservation/page.tsx`
- Modify: `src/components/forms/slot-picker.tsx`

- [ ] **Step 1: Update reservation page to fetch dogs**

In `src/app/(marketing)/reservation/page.tsx`:

```typescript
import { getDogs } from '@/lib/auth-actions'

// Inside the component, after getProfile():
const [profile, dogs] = await Promise.all([
  getProfile(),
  getDogs(),
])

const showForm = !profile?.can_book || searchParams.contact === '1'

// Pass dogs to components:
// For ReservationForm — use first dog's data as prefill
const firstDog = dogs[0] ?? null

// defaultValues for ReservationForm:
defaultValues={{
  nom: profile?.nom ?? '',
  email: user.email ?? '',
  telephone: profile?.telephone ?? '',
  race_chien: firstDog?.breed ?? '',
  poids_chien: firstDog?.poids ?? '',
  etat_poil: firstDog?.etat_poil ?? '',
}}

// For SlotPicker:
<SlotPicker profile={profile!} dogs={dogs} />
```

- [ ] **Step 2: Update SlotPicker to accept dogs and add dog-selection step**

Add `Dog` type import and update props:

```typescript
import type { Dog } from '@/lib/auth-actions'

// Add 'dog' to Step type:
type Step = 'service' | 'dog' | 'staff' | 'creche-duration' | 'date' | 'time' | 'confirmed'

export function SlotPicker({ profile, dogs }: { profile: Profile; dogs: Dog[] }) {
```

Add dog selection state:

```typescript
const [selectedDog, setSelectedDog] = useState<Dog | null>(dogs.length === 1 ? dogs[0] : null)
```

In `fetchSlots`, replace `profile.grooming_duration` with `selectedDog?.grooming_duration`:

```typescript
if (slugBase === 'toilettage') {
  if (!selectedDog?.grooming_duration) {
    setSlotsError("La durée de toilettage de votre chien n'est pas encore définie. Contactez-nous.")
    setSlotsLoading(false)
    return
  }
  url += `&duration=${selectedDog.grooming_duration}`
}
```

After service selection, if service is `toilettage` and client has multiple dogs → go to `dog` step before `staff`. If only one dog → skip to `staff`:

```typescript
function handleServiceSelect(slug: string) {
  setSelectedService(slug)
  const slugBase = slug.split('-')[0]
  if (slugBase === 'toilettage' && dogs.length > 1) {
    setStep('dog')
  } else if (slugBase === 'toilettage') {
    // single dog already set via useState default
    setStep('staff')
  } else if (slugBase === 'creche') {
    setStep('creche-duration')
  } else {
    setStep('staff')
  }
}
```

Dog selection step JSX (insert before 'staff' step rendering):

```tsx
{
  step === 'dog' && (
    <div className="space-y-4">
      <h2 className="font-display text-xl font-bold text-charcoal">Pour quel chien ?</h2>
      <div className="space-y-2">
        {dogs.map((dog) => (
          <button
            key={dog.id}
            onClick={() => {
              setSelectedDog(dog)
              setStep('staff')
            }}
            className="w-full text-left p-4 rounded-xl border border-charcoal/10 hover:border-terracotta-dark hover:bg-terracotta-dark/5 transition-colors"
          >
            <p className="font-medium text-charcoal">{dog.name}</p>
            {dog.breed && <p className="text-sm text-charcoal/60">{dog.breed}</p>}
            {!dog.grooming_duration && (
              <p className="text-xs text-red-400 mt-1">Durée de toilettage non définie</p>
            )}
          </button>
        ))}
      </div>
      <button onClick={() => setStep('service')} className="text-sm text-charcoal/50 underline">
        ← Retour
      </button>
    </div>
  )
}
```

Send `dogId` when confirming:

```typescript
const res = await fetch('/api/booking/confirm', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    serviceSlug: selectedService,
    date: selectedDate,
    timeUtc: selectedSlot?.timeUtc ?? selectedCrecheSlot?.timeUtc,
    staffId: selectedSlot?.staffId ?? null,
    duration: crecheDuration ?? undefined,
    dogId: selectedDog?.id ?? null,
  }),
})
```

- [ ] **Step 3: Run lint**

```bash
npm run lint 2>&1 | grep "error" | head -20
```

Fix any errors.

- [ ] **Step 4: Commit**

```bash
git add "src/app/(marketing)/reservation/page.tsx" \
        src/components/forms/slot-picker.tsx
git commit -m "feat: dog selection step in slot picker for toilettage, send dogId on confirm"
```

---

## Task 9: Fix search route and any remaining type errors

**Files:**

- Modify: `src/app/api/dashboard/customers/search/route.ts`
- Modify: `src/lib/supabase-admin.ts` (searchProfiles)

- [ ] **Step 1: Check searchProfiles in supabase-admin.ts**

Current `searchProfiles` searches `nom.ilike` and `telephone.ilike`. The `nom_chien` / `race_chien` search filters in `CustomersTable` are handled client-side via `dogMap` now — no changes needed to the search route.

But `searchProfiles` returns `Profile[]` — verify the returned columns match the new lean Profile interface (no dog fields). If the select is `*`, it should still work since Supabase returns whatever columns exist.

- [ ] **Step 2: Fix new-reservation-form search result display**

The search results in `new-reservation-form.tsx` display `p.nom_chien`. Remove that reference:

```tsx
// Old:
<p className="text-xs text-gray-400">
  {p.telephone}
  {p.nom_chien ? ` · 🐶 ${p.nom_chien}` : ''}
</p>

// New:
<p className="text-xs text-gray-400">{p.telephone}</p>
```

- [ ] **Step 3: Full TypeScript check**

```bash
npx tsc --noEmit 2>&1 | grep "error TS"
```

Fix all remaining errors. Common ones:

- Any component that still destructures `nom_chien`, `race_chien` etc from a `Profile` type
- `getProfile()` return type — update caller expectations

- [ ] **Step 4: Lint**

```bash
npm run lint 2>&1 | grep -E "^\./" | grep -v Warning
```

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "fix: remove all remaining profile dog field references, TypeScript clean"
git push
```

---

## Self-Review

**Spec coverage:**

- ✅ DB migration — drop dog columns from profiles, add numero_puce to dogs
- ✅ Types updated — Profile has no dog fields, Dog interface is complete
- ✅ signUp — no longer writes dog fields to profiles
- ✅ createProfileWithAuth — profile insert is clean, dog data goes to dogs
- ✅ Email routes — read dog name from dogs table
- ✅ booking/confirm — reads grooming_duration from dog, sends dog_id on insert
- ✅ Calendar API — dog name from dogs table
- ✅ Notification bell — removes nom_chien from profiles join
- ✅ customer-detail — per-dog editing panel, profile form is name+phone only
- ✅ customers-table — dog data from dogMap
- ✅ new-reservation-form — profile display is human-only
- ✅ slot-picker — dog selection step for toilettage, uses selectedDog.grooming_duration
- ✅ reservation page — fetches dogs, passes to SlotPicker

**Critical ordering:** Task 1 (DB migration) must run BEFORE deploying any code changes, or the app will break because it tries to read columns that don't exist. Run migration first, deploy code after.
