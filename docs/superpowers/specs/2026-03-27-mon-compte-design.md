# Mon Compte — Design Spec

**Date:** 2026-03-27
**Status:** Approved

---

## 1. Purpose

A personal space for authenticated merci murphy® clients. Serves two equal goals:

1. **Profile hub** — owners manage their contact details and their dog(s)' info so the groomer has everything ready before each visit
2. **Loyalty card** — owners see their visit history and feel a sense of belonging to the merci murphy® community

The page is only accessible to authenticated users. Unauthenticated visitors are redirected to `/compte/connexion?redirect=/compte`.

---

## 2. URL & Route

`/compte` — inside the `(marketing)` route group, using the existing marketing layout (Navbar + Footer).

---

## 3. Layout

Card-based overview (single scrollable page, no tabs). Structure top to bottom:

1. **Welcome header card** — warm sand background (`#B5A89A`), greeting with first name, member-since date, booking badge if `can_book`
2. **Mon profil card** — owner name, phone, email + "Modifier" inline edit
3. **Mes chiens card** — one sub-card per dog, dashed "Ajouter un chien" button at bottom
4. **Booking CTA card** — only rendered when at least one dog has `can_book_online: true`
5. **Historique des visites card** — simple timeline (date + service label + dog name chip)

Max width: 480px, centred, consistent with the existing auth pages.

---

## 4. Data Model

### Existing tables used

**`profiles`** (existing):

- `id`, `nom`, `telephone`, `can_book` (profile-level booking flag, legacy — keep for now)
- Email comes from `auth.users`, not `profiles`

**`visits`** (existing, migration 001):

- `id`, `profile_id`, `service`, `date`, `notes`, `staff`
- `notes` and `staff` are internal — never shown to the client
- Linked to `profile_id` (not dog_id) — the timeline shows service + date only; dog attribution uses a new `dog_id` FK added in this feature

**`dogs`** (existing schema, must be created via migration):

- `id`, `owner_id` (FK → auth.users), `name`, `breed`, `can_book_online`, `grooming_duration`, `notes`
- Missing columns to add: `poids` (text), `etat_poil` (text), `photo_url` (text, nullable — Cloudinary URL), `age` (text, nullable)

### Migration needed

```sql
-- 1. Create dogs table (may already exist in prod — use if not exists)
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
  for select to authenticated using (owner_id = auth.uid());

create policy "dogs_insert_own" on public.dogs
  for insert to authenticated with check (owner_id = auth.uid());

create policy "dogs_update_own_safe" on public.dogs
  for update to authenticated using (owner_id = auth.uid())
  with check (owner_id = auth.uid());
-- grooming_duration, notes, can_book_online are only updated via service role (dashboard)

-- 2. Add dog_id to visits (optional attribution — nullable)
alter table public.visits
  add column if not exists dog_id uuid references public.dogs(id) on delete set null;
```

### Cloudinary

Dog photo uploads use the Cloudinary Upload API (unsigned upload preset). The client uploads directly to Cloudinary; only the resulting URL is stored in `dogs.photo_url`.

New env vars required:

```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=
```

---

## 5. Page Architecture

`/compte/page.tsx` — **Server Component** (protected). Fetches profile + dogs + visits via `createSupabaseServerClient()`. Redirects to `/compte/connexion?redirect=/compte` if no session.

Passes data down to:

- `<AccountWelcome profile email memberSince />` — pure display, no interactivity
- `<ProfileCard profile />` — Client Component (inline edit with Server Action)
- `<DogsCard dogs />` — Client Component (add/edit dog, photo upload)
- `<BookingCta dogs />` — rendered only if any dog has `can_book_online: true`; links to Calendly URL from env
- `<VisitTimeline visits dogs />` — pure display, Server Component

---

## 6. Dog Management

### Viewing dogs

Each dog shows: photo circle (Cloudinary image or placeholder emoji), name, breed, age, weight tag, coat tag. Tapping the `›` arrow opens an edit sheet.

### Adding a dog

Dashed "Ajouter un chien" button at bottom of `<DogsCard>`. Opens a modal/sheet with fields: name (required), breed, age, poids, etat_poil. Photo upload is optional and can be done after creation.

### Editing a dog

Same fields as adding. Photo: tapping the circle opens a file picker → uploads to Cloudinary → saves URL via Server Action.

### Dog limits

No hard limit in V1. The UI can reasonably display 2–3 dogs before getting tall — no concern for now.

### Fields client can edit

- name, breed, age, poids, etat_poil, photo_url

### Fields client cannot edit (team-only)

- grooming_duration, notes, can_book_online

---

## 7. Profile Edit

Inline edit on the Mon profil card. "Modifier" button reveals editable inputs for `nom` and `telephone`. Email is read-only (Supabase auth — changing email requires verification flow, out of scope). Saved via existing `updateProfile` Server Action.

---

## 8. Visit Timeline

Simple list, descending by date. Each row:

- Emoji icon mapped to service type (✂️ toilettage, 🛁 bains, 🐾 crèche, etc.)
- Service name (human-readable French label)
- Date (formatted: "12 mars 2026")
- Dog chip (dog name, shown only if `dog_id` is set on the visit)

No pagination in V1. Show all visits. Footer note: "N visites au total".

---

## 9. Booking CTA

Only rendered when at least one of the owner's dogs has `can_book_online: true`. Shows a terracotta-dark card with a "Réserver en ligne" button that links to the Calendly URL (`process.env.NEXT_PUBLIC_CALENDLY_URL`).

---

## 10. Auth & Security

- Page protected server-side: `getUser()` before any render, redirect if unauthenticated
- All dog mutations use Server Actions with `getUser()` guard — no client-side auth assumption
- Cloudinary upload is direct-to-cloud (unsigned preset scoped to image uploads only); the URL is then saved server-side after validation
- RLS ensures users can only read/write their own dogs and visits

---

## 11. Out of Scope (V1)

- Groomer notes visible to client (kept internal)
- Appointment booking within the page (Calendly link only)
- Email change
- Account deletion
- Push notifications / next appointment display
- Dog deletion (team manages dog lifecycle)
