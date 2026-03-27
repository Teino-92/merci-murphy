# PAYMENTS — Deposit & Custom Booking Flow

## Scope

- **V1 service**: Toilettage (Maison Poilus) only
- **Deposit amount**: 60€ flat — regardless of service type or dog size
- **Payment provider**: SumUp Checkouts API
- **Booking provider**: Calendly Scheduling API (fully headless — no Calendly widget)
- **UX**: fully custom booking UI built with merci murphy design system

---

## Architecture

The entire booking experience lives on the merci murphy site.
No Calendly iframe, no redirect to Calendly. Calendly is used as a backend engine only —
for availability, calendar sync, reminders, and notifications.

```
merci murphy site (custom UI)
  ├── reads dog profile         → Supabase (grooming_duration, can_book_online)
  ├── fetches available slots   → Calendly API (filtered by dog's duration)
  ├── takes deposit payment     → SumUp Checkouts API
  └── creates booking           → Calendly Scheduling API (after payment confirmed)
```

### Client gate — new vs. returning dog

```
Client logs in
         ↓
Server reads dog profile from Supabase
         ↓
can_book_online = false  →  "Contactez-nous pour votre première visite" → /contact
can_book_online = true   →  Booking flow opens, grooming_duration pre-loaded
```

No manual question needed. The system knows.
The team controls `can_book_online` and `grooming_duration` from the admin dashboard.

---

## Flow

### Happy path

```
1. Client visits /reserver/toilettage (custom booking page)
         ↓
2. Page fetches available slots via Calendly API
   GET /event_type_available_times?event_type={uuid}&start_time=...&end_time=...
         ↓
3. Client picks a date and time slot (fully styled calendar UI)
         ↓
4. Client fills in dog info form (name, breed, size, notes)
         ↓
5. Client sees deposit summary:
   "Pour confirmer votre rendez-vous, un acompte de 60€ est requis."
         ↓
6. Server creates SumUp Checkout (60€)
   → Client is redirected to SumUp hosted payment page
         ↓
7. Client pays
         ↓
8. SumUp redirects to /reserver/merci?checkout_id=...
   + SumUp fires `checkout.completed` webhook
         ↓
9. Server confirms payment via webhook
   → Creates booking via Calendly Scheduling API (slot is now booked)
   → Creates lead in Supabase (status: confirmed)
   → Creates visit row in Supabase (service, date, dog_id — price left null)
   → Sends confirmation email via Resend
```

> The slot is only booked after payment is confirmed.
> No ghost bookings, no unpaid slots in Calendly.

### Payment abandoned

```
Client reaches SumUp payment page → closes tab / abandons
→ No slot is booked in Calendly (never was)
→ No lead created
→ Client can restart the flow at any time
```

No cron job needed. No cleanup. The slot remains available for others.

### Cancellation (>48h before appointment)

```
Client requests cancellation (via email link or account page)
         ↓
Server calls Calendly API → cancels the event
Server calls SumUp Refunds API → full refund (60€)
Lead status → cancelled
Resend sends refund confirmation email
  — "Votre remboursement de 60€ sera crédité sous 3 à 5 jours ouvrés."
```

### Cancellation (<48h before appointment)

```
Client requests cancellation
         ↓
Server calls Calendly API → cancels the event
No refund issued — deposit kept
Lead status → cancelled
Resend sends cancellation email
  — deposit retained, policy reminder, invite to rebook
```

---

## Booking page — UI components to build

### `/reserver/toilettage`

1. **Auth gate** — must be logged in to access
2. **Dog gate** — reads `can_book_online` from Supabase dog profile; redirects to /contact if false
3. **Slot picker** — month/week view, available slots filtered by `grooming_duration` from dog profile
4. **Booking summary card** — dog name, duration, date/time selected, 60€ acompte, cancellation policy
5. **Pay button** → triggers SumUp Checkout creation + redirect

### `/reserver/merci` (post-payment confirmation page)

- Booking confirmed message
- Date, time, service recap
- "Ajoutez à votre calendrier" button
- What to bring / how to prepare your dog

---

## Database changes

See `DISCOVERY/DATA_MODEL.md` for full schema.

### Summary of new/updated tables

- **`dogs`** — new table, linked to `auth.users`, team-controlled `grooming_duration` and `can_book_online`
- **`leads`** — new columns: `dog_id`, `calendly_event_uuid`, `calendly_invitee_uuid`, `sumup_checkout_id`, `deposit_amount`, `deposit_paid_at`, `scheduled_at`

### `leads.status` — lifecycle for online bookings

```
confirmed → cancelled
```

> No `pending_payment` state — lead is only created after payment is confirmed.

---

## API integrations to build

### Calendly (read + write)

| Operation             | Endpoint                                  | When                          |
| --------------------- | ----------------------------------------- | ----------------------------- |
| Fetch available slots | `GET /event_type_available_times`         | On booking page load          |
| Create booking        | `POST /scheduled_events` (Scheduling API) | After SumUp payment confirmed |
| Cancel event          | `DELETE /scheduled_events/{uuid}`         | On cancellation request       |

Auth: OAuth app (required for Scheduling API).

### SumUp

| Operation       | Endpoint                                  | When                                 |
| --------------- | ----------------------------------------- | ------------------------------------ |
| Create checkout | `POST /v0.1/checkouts`                    | When client clicks "Payer l'acompte" |
| Verify payment  | `GET /v0.1/checkouts/{id}`                | On return to /reserver/merci         |
| Issue refund    | `POST /v0.1/me/refund/{transaction_code}` | On cancellation >48h                 |

Auth: Secret API key.

---

## Webhooks to build

### POST /api/webhooks/sumup

| Event                | Action                                                                                                    |
| -------------------- | --------------------------------------------------------------------------------------------------------- |
| `checkout.completed` | Create Calendly booking, create lead (confirmed), create visit row (price: null), send confirmation email |
| `checkout.failed`    | Log — client already sees failure on SumUp redirect                                                       |

Security: validate SumUp webhook signature header.

> No Calendly webhook needed — we control the booking creation ourselves.
> Cancellations are initiated from our UI, not from Calendly's side.

---

## Email templates (Resend)

| Template                      | Trigger                                | Key content                                                                |
| ----------------------------- | -------------------------------------- | -------------------------------------------------------------------------- |
| `booking-confirmed`           | After SumUp payment + Calendly booking | Date, time, dog name, 60€ paid, balance due at visit, address, cancel link |
| `booking-cancelled-refund`    | Cancellation >48h                      | Refund confirmed, 3–5 business days, rebook invite                         |
| `booking-cancelled-no-refund` | Cancellation <48h                      | Deposit retained, policy reminder, rebook invite                           |

---

## Environment variables needed

```env
SUMUP_API_KEY=                  # Secret key — payments + transactions scopes
SUMUP_WEBHOOK_SECRET=           # For validating SumUp webhook signatures
SUMUP_CHECKOUT_REDIRECT_URL=    # https://mercimurphy.com/reserver/merci

CALENDLY_CLIENT_ID=             # OAuth app client ID
CALENDLY_CLIENT_SECRET=         # OAuth app client secret
CALENDLY_REFRESH_TOKEN=         # Long-lived token for server-side calls
CALENDLY_EVENT_TYPE_TOILETTAGE= # UUID of the Toilettage event type
```

---

## Admin dashboard — Chiens section

### `/admin/chiens`

Table of all dog profiles across all client accounts.

**Columns:** dog name, breed, owner name, grooming duration, can book online, actions

**Edit modal per dog:**

- `grooming_duration` — dropdown: 30min / 45min / 1h / 1h15 / 1h30 / 2h / 2h30
- `can_book_online` — toggle (off by default for new dogs)
- `notes` — internal free text (not visible to client)

**RLS:** all reads and writes via service role (admin only — never exposed to clients).

---

## Visit row — auto-created on payment

When `checkout.completed` fires, the webhook handler inserts a visit row immediately:

```
visits.service    = 'toilettage'
visits.date       = scheduled_at (from Calendly booking response)
visits.profile_id = client's auth user id
visits.dog_id     = dog_id passed through the booking flow
visits.price      = null  ← team fills this in after the service
```

The visit appears in the client's Mon Compte history from the day of the appointment.
The team enters the final price in the dashboard after checkout.

---

## Out of scope for V1

- Deposits for other services (crèche, éducation, massage, balnéo)
- Embedded SumUp payment form (redirect to SumUp hosted page for now)
- Partial refunds
- Customer account with booking history
- SMS reminders
- Rescheduling flow (cancel + rebook for now)

---

## Open questions before implementation

- [ ] Get Calendly event type UUID for Toilettage (Calendly → Event Types → copy UUID from URL)
- [ ] Create Calendly OAuth app in developer portal
- [ ] Generate SumUp secret API key with payments scope
- [ ] Confirm cancellation is handled via email link (no login required in V1)
- [ ] Confirm team workflow for setting `grooming_duration` and `can_book_online` — via admin dashboard or directly in Supabase for V1?
