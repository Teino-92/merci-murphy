# Dashboard — Nouvelle Réservation & Durée Toilettage

**Date:** 2026-04-07
**Scope:** Dashboard team only (no client-facing changes except read-only `grooming_duration` in account page)

---

## 1. Overview

A dedicated page `/dashboard/reservations/new` lets the team create a booking for any client — existing or new. It replaces the idea of embedding a booking flow inside the client detail page, keeping the UI clean and focused.

The page also introduces `grooming_duration` on dog profiles, which drives the Calendly slot length for toilettage bookings via the `?duration=X` query param (free Calendly plan supports this).

---

## 2. Database Change

One new column on the `profiles` table:

```sql
ALTER TABLE profiles ADD COLUMN grooming_duration integer null;
```

Run manually in the Supabase SQL editor. No migration file needed.

---

## 3. Data Model Updates

**`Profile` interface** in `src/lib/supabase-admin.ts`:

- Add `grooming_duration: number | null`

No other interface changes. The existing `PATCH /api/dashboard/customers/[id]/profile` endpoint already handles partial updates — `grooming_duration` flows through automatically.

---

## 4. `/dashboard/reservations/new` Page

### 4.1 Route

`src/app/(dashboard)/dashboard/reservations/new/page.tsx` — server component that fetches all service Calendly URLs from Sanity and passes them to the client component.

### 4.2 Flow

```
Step 1: Client
  ├── Search existing client (live search by name/phone)
  │     └── Select → auto-fills dog info + grooming_duration
  └── "Nouveau client" → inline creation form

Step 2: Service
  └── Dropdown of all services (SERVICE_LABELS)

Step 3: Redirect
  └── Button "Ouvrir Calendly" → opens new tab
        ├── toilettage + grooming_duration set → {calendlyUrl}?duration={grooming_duration}
        ├── toilettage + grooming_duration null → inline warning "Définir la durée toilettage sur le profil d'abord"
        └── other service → {calendlyUrl} (no param)

Step 4: Confirm visit (manual, team comes back after booking on Calendly)
  └── Form appears after "Ouvrir Calendly" is clicked
        ├── Date (pre-filled with today)
        ├── Prix (€)
        ├── Staff
        └── Notes
  └── Button "Enregistrer la visite" → POST to visits table in Supabase
  └── Success → redirect to client profile page
```

### 4.3 Existing Client Search

- Text input, searches `profiles` table by `nom` or `telephone` (server action or API route, debounced)
- Dropdown results show: name, phone, dog name
- On select: auto-fills a read-only summary card showing client info + dog info + `grooming_duration`

### 4.4 New Client Form

Triggered by "Nouveau client" button. Fields:

| Field                  | Notes                                  |
| ---------------------- | -------------------------------------- |
| Nom                    | required                               |
| Email                  | required — used to create auth account |
| Téléphone              | required                               |
| Nom du chien           | required                               |
| Race                   | optional                               |
| Âge                    | optional                               |
| Poids                  | optional                               |
| État du poil           | optional                               |
| Durée toilettage (min) | optional, number, team-only            |
| Notes internes         | optional, textarea                     |

On submit:

1. `supabaseAdmin.auth.admin.createUser({ email, email_confirm: false })` — creates auth account, triggers Supabase's built-in confirmation email (the client receives a magic link to set their password)
2. Insert row into `profiles` with all fields + `owner_id = new user's id`
3. Auto-selects the newly created client and moves to Step 2

### 4.5 Service Calendly URLs

Fetched server-side from Sanity (`getAllServices()` already returns `calendlyUrl` per service). Passed as a `Record<string, string>` prop (slug → URL) to the client component.

---

## 5. Dashboard — Customer Detail Updates

### 5.1 Edit Form (team)

Add "Durée toilettage (min)" number input to the existing edit form, shown only when `nom_chien` is set. Saves via the existing `saveProfile()` flow.

### 5.2 Display (view mode)

Show `grooming_duration` in the dog info card when set:

> Durée de séance : 90 min

Read-only in view mode. Only the edit form allows changes.

---

## 6. Client Account Page (read-only)

In the dog info section of the client-facing account page (`src/app/(marketing)/compte/page.tsx` + `src/components/account/dogs-card.tsx`), show `grooming_duration` as read-only if set:

> Durée de séance : 90 min

No edit capability for the client.

---

## 7. Nav

Add "Réservations" entry to the dashboard nav (`src/components/dashboard/nav.tsx`) pointing to `/dashboard/reservations/new`. Icon: `CalendarPlus` from lucide-react.

---

## 8. Out of Scope (V1 — to be added after Calendly plan upgrade)

- Calendly embed in the dashboard (team uses the external Calendly page in a new tab)
- Calendly webhook → automatic visit creation in Supabase on booking confirmation
- Calendly embed on client-facing service pages (replaces manual redirect)
- Multi-dog profiles (one dog per profile for now)
- Deposit / SumUp payment from this flow
