# Cal.com Dashboard Integration Design

**Date:** 2026-04-07
**Scope:** Dashboard reservation page only. Website embed is a separate spec.

---

## 1. Overview

Replace the current "open Calendly in new tab → manual confirm visit" flow with:

- **Cal.com embed** inline in the dashboard for slot-based services (toilettage, bains, balnéo)
- **Manual log form** for appointment-based services (massage, ostéopathie, éducation)
- **Cal.com webhook** that auto-creates a visit in Supabase when a booking is confirmed on cal.com

The team never leaves the dashboard to book. The visit record is created automatically for cal.com services. Manual services require the team to fill in the details themselves.

---

## 2. Cal.com URLs

- Toilettage: `https://cal.eu/merci-murphy/toilettage`
- Bains: `https://cal.eu/merci-murphy/les-bains`
- Balnéo: `https://cal.eu/merci-murphy/balneo`
- Crèche: `https://cal.eu/merci-murphy/la-creche` (kept for reference, not used in dashboard — crèche uses the leads form)

---

## 3. Service Classification

| Service     | Type    | Flow                                                           |
| ----------- | ------- | -------------------------------------------------------------- |
| Toilettage  | Cal.com | Embed + `?duration={grooming_duration}` + webhook              |
| Bains       | Cal.com | Embed + webhook                                                |
| Balnéo      | Cal.com | Embed + webhook                                                |
| Massage     | Manual  | Date + time + duration (default 60min) + price + staff + notes |
| Ostéopathie | Manual  | Date + time + duration (default 60min) + price + staff + notes |
| Éducation   | Manual  | Date + time + duration (default 60min) + price + staff + notes |

Crèche is excluded — handled via the existing leads/reservation form.

---

## 4. Cal.com Embed

Use the `@calcom/embed-react` npm package. It provides a `Cal` component that renders the booking widget inline.

The embed receives:

- `calLink` — the event slug (e.g. `merci-murphy/toilettage`)
- `config` — prefill object with client name + email, and `duration` for toilettage

```tsx
<Cal
  calLink="merci-murphy/toilettage"
  config={{
    name: profile.nom,
    email: profile.email,
    duration: profile.grooming_duration ?? undefined,
  }}
/>
```

The embed is shown after the client and service are selected. It replaces the "Ouvrir Calendly" button and the manual confirm form for cal.com services.

### Prefill client email

The `Profile` type currently doesn't include `email`. We need to fetch it from `auth.users` via the admin API when loading the customer page, and pass it to the reservation form.

---

## 5. Webhook — Auto-create Visit

Cal.com sends a POST to a webhook URL when a booking is created.

### Webhook endpoint

`POST /api/webhooks/calcom`

- Validates the cal.com webhook secret (`CAL_WEBHOOK_SECRET` env var)
- Extracts: `attendee name`, `attendee email`, `event type title`, `start_time`, `end_time`
- Looks up the profile by email in Supabase
- Inserts a visit row:
  - `profile_id` — from the profile lookup
  - `service` — derived from the event type slug (e.g. `toilettage`)
  - `date` — from `start_time`
  - `notes` — null (team can add later on the profile page)
  - `staff` — null
  - `price` — null (team fills in after)

### Visit record is partial

The webhook creates a minimal visit (date + service). The team can open the client profile and fill in price/staff/notes after the appointment. This is intentional — the team shouldn't need to do anything in the dashboard after booking via the embed.

### Webhook secret validation

Cal.com signs webhook payloads with a secret. Validate using:

```typescript
const signature = req.headers.get('x-cal-signature-256')
// HMAC-SHA256 of the raw body using CAL_WEBHOOK_SECRET
```

---

## 6. Dashboard Reservation Page Changes

### `NewReservationForm` updated flow

**Step 1: Client** — unchanged (search existing or create new)

**Step 2: Service** — dropdown now split into two groups visually:

- Cal.com services (toilettage, bains, balnéo)
- Manual services (massage, ostéopathie, éducation)

**Step 3a: Cal.com embed** (if cal.com service selected)

- Inline `Cal` component with client prefill
- No "confirm" step needed — webhook handles visit creation
- Show a "La réservation sera enregistrée automatiquement" message below the embed

**Step 3b: Manual form** (if manual service selected)

- Date (date picker)
- Time (time input, e.g. `14:30`)
- Duration (number input, default 60, step 15, min 15)
- Prix (€)
- Staff
- Notes
- "Enregistrer la visite" → POST to `/api/dashboard/customers/{id}/visits` → redirect to client profile

### Remove old flow

Remove: "Ouvrir Calendly" button, `?redirect_uri` param, confirm step for cal.com services, `saveVisit` for cal.com path. Keep `saveVisit` only for manual services.

---

## 7. Visits Table — Add `time` and `duration` columns

The current `visits` table has `date` (date only) but no time or duration. Manual services need both.

```sql
ALTER TABLE visits ADD COLUMN time time null;
ALTER TABLE visits ADD COLUMN duration integer null; -- minutes
```

Update the `Visit` interface in `supabase-admin.ts` accordingly.

---

## 8. Toilettage Deposit Flow (client online booking only)

When a client books toilettage online via the website embed, a 60€ deposit is required before the booking is confirmed. This flow only applies to client-side bookings — team bookings from the dashboard skip the deposit.

### Flow

1. **Cal.com webhook fires** (booking created) → visit created with `status = 'pending_deposit'`
2. **Create SumUp checkout** (60€) via SumUp API → store `sumup_checkout_id` on the visit
3. **Send deposit email** via Resend → client receives payment link, valid until they pay
4. **SumUp webhook fires** (payment completed) → visit `status` updated to `'confirmed'`, `deposit_paid_at` set
5. **Send confirmation email** via Resend → client receives booking confirmed with date/time

### Visit status values

Add `status` column to `visits` table:

```sql
ALTER TABLE visits ADD COLUMN status text not null default 'confirmed';
-- Values: 'pending_deposit' | 'confirmed' | 'cancelled'
```

Team dashboard bookings always insert with `status = 'confirmed'` directly.

### Deposit amount

Fixed at **60€** for all toilettage bookings. Stored as `deposit_amount = 60.00` on the visit row (column already exists in the leads table schema, add to visits).

### Cancellation

Automatic cancellation for unpaid deposits is **deferred** — the team handles it manually for now. The booking window policy (how far in advance clients can book) will be defined later, at which point an automatic expiry job will be added.

### Distinguish client vs team booking

The cal.com webhook payload includes the attendee email. If the booking was made from the dashboard (team flow), we skip the deposit step. Detection: if the booking was initiated from `/dashboard/*` origin or if the attendee email matches a team account — use a cal.com "notes" prefill field set to `source=dashboard` to distinguish.

---

## 9. Environment Variables

```env
CAL_WEBHOOK_SECRET=        # set in Vercel + cal.com webhook config
SUMUP_API_KEY=             # already exists (used for leads deposits)
RESEND_API_KEY=            # already exists
```

---

## 10. Sanity — Update Service URLs

Replace `calendlyUrl` field values in Sanity with cal.com URLs for toilettage, bains, balnéo. The field name stays `calendlyUrl` (no rename needed — it's just a URL field).

---

## 11. Out of Scope

- Website embed (separate spec)
- Cal.com embed for crèche (uses leads form)
- Ostéo/massage/éducation scheduling logic (team decides externally)
- Automatic cancellation for unpaid deposits (deferred — booking window policy TBD)
- Automatic price/staff population from cal.com
- Cal.com OAuth (personal access token is sufficient for webhook validation)
