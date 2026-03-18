# SUMUP ANALYTICS — Dashboard Plan

## Purpose

Add a dedicated financial analytics page to the admin dashboard sourced from the SumUp API.
This tracks **in-store revenue** (services, toilettage, crèche, éducation, spa, boutique physique).
It is separate from the existing Shopify analytics which tracks **online shop** revenue only.

---

## Source of truth

| Channel                                 | Dashboard page               | Data source       |
| --------------------------------------- | ---------------------------- | ----------------- |
| Online shop (candles, bags, mugs)       | `/dashboard` (existing)      | Shopify Admin API |
| In-store (services + physical boutique) | `/dashboard/ventes` (new)    | SumUp API         |
| Combined total                          | `/dashboard` home (addition) | Both              |

---

## New page: `/dashboard/ventes`

### Row 1 — KPI stat cards (reuse `StatCard` component)

| Card                   | Calculation                               | API source       |
| ---------------------- | ----------------------------------------- | ---------------- |
| Chiffre d'affaires     | Sum of all transaction amounts for period | Transaction list |
| Ticket moyen           | Total revenue ÷ transaction count         | Transaction list |
| Nombre de transactions | Count of transactions for period          | Transaction list |
| Taux de remboursement  | Sum of `refunded_amount` ÷ total revenue  | Transaction list |

### Row 2 — Revenue chart (reuse `RevenueChart` pattern)

- Daily revenue over selected period
- Toggle: revenue amount vs. transaction count
- Preset periods: mois en cours / 30 jours / 90 jours
- Same visual language as Shopify chart

### Row 3 — Top services

- Horizontal bar chart
- Top 10 product names ranked by total revenue for the period
- Data from `products` array on individual transaction fetches
- Most valuable widget — shows which services drive the most revenue

### Row 4 — Payment method breakdown

- Donut chart: Carte / Espèces / Autre
- From `payment_type` on transaction list — no individual fetches needed
- Quick read on how clients prefer to pay

### Row 5 — Derniers virements (payouts)

- Table: last 5 payouts
- Columns: date, montant brut, frais SumUp, montant net, statut
- Answers: "when does money hit the bank and how much was deducted in fees"

---

## Addition to `/dashboard` home page

New "Revenus combinés" row at the top — above existing Shopify stats:

```
Shopify (en ligne)    SumUp (boutique)    Total
    €1,240               €8,450           €9,690
```

Single source of truth for the business total. Not available anywhere today.

---

## Data architecture

### The N+1 problem

SumUp's transaction list returns `product_summary` (a plain string) but NOT the full
`products` array. Service-level breakdown requires fetching each transaction individually.

**Solution: background aggregation cache**

```
/api/dashboard/sumup/sync (called by cron or manually)
  1. GET /v2.1/merchants/{code}/transactions/history for period  (1 call)
  2. GET /v0.1/me/transactions?id={id} for each transaction      (N calls, batched)
  3. Aggregate: by product name, by day, by payment type
  4. Store result in Supabase `sumup_cache` table with period key + timestamp
```

Dashboard page reads from `sumup_cache` only — loads instantly.
Cache is rebuilt:

- Automatically: daily cron at 02:00
- Manually: "Actualiser" button on the /dashboard/ventes page

### `sumup_cache` Supabase table

| Column              | Type        | Notes                              |
| ------------------- | ----------- | ---------------------------------- |
| `id`                | uuid        | PK                                 |
| `period`            | text        | e.g. `2026-03` — one row per month |
| `transactions`      | jsonb       | raw aggregated transaction data    |
| `by_day`            | jsonb       | `[{ date, revenue, count }]`       |
| `by_product`        | jsonb       | `[{ name, revenue, quantity }]`    |
| `by_payment_type`   | jsonb       | `[{ type, count, revenue }]`       |
| `payouts`           | jsonb       | raw payout list                    |
| `total_revenue`     | numeric     | pre-computed for fast KPI display  |
| `transaction_count` | integer     | pre-computed                       |
| `avg_ticket`        | numeric     | pre-computed                       |
| `refund_rate`       | numeric     | pre-computed (0–1)                 |
| `refreshed_at`      | timestamptz | last sync time                     |

**RLS:** service role only — never exposed to browser directly.

---

## API integration

### Authentication

SumUp secret API key — stored as `SUMUP_API_KEY` env variable.
Bearer token on all requests. Never exposed client-side.

### Endpoints used

| Operation          | Endpoint                                                   | Notes                     |
| ------------------ | ---------------------------------------------------------- | ------------------------- |
| List transactions  | `GET /v2.1/merchants/{merchant_code}/transactions/history` | Paginated, filter by date |
| Single transaction | `GET /v0.1/me/transactions?id={id}`                        | Returns `products` array  |
| List payouts       | `GET /v0.1/me/payouts`                                     | Amount, fee, date, status |
| Merchant info      | `GET /v0.1/me`                                             | To get `merchant_code`    |

### `lib/sumup.ts` — functions to build

```ts
getMerchantCode()                          // cached, called once
getTransactions(from: Date, to: Date)      // paginated list
getTransactionDetail(id: string)           // single with products[]
getPayouts(limit?: number)                 // recent payouts
```

---

## Period selector

Default: **mois en cours**
Options: mois en cours / mois dernier / 3 derniers mois

Stored as query param `?period=2026-03` so the URL is shareable.
Each period = one cache row in `sumup_cache`.

---

## New dashboard nav item

Add **"Ventes"** to `DashboardNav` between home (/) and leads (/leads).

---

## Environment variables needed

```env
SUMUP_API_KEY=           # Secret API key — payments + transactions scopes
SUMUP_MERCHANT_CODE=     # Your SumUp merchant code (from GET /v0.1/me)
```

---

## Out of scope for V1

- Real-time transaction stream (cache + manual refresh is sufficient)
- Per-staff analytics (requires SumUp team features)
- CSV export
- Comparison vs. previous period (nice to have — V2)
- SumUp + Shopify unified product-level analytics

---

## Build order

1. `lib/sumup.ts` — API client + fetch functions
2. Supabase migration — `sumup_cache` table
3. `/api/dashboard/sumup/sync` — aggregation route
4. `/api/dashboard/sumup/data` — read from cache, return to frontend
5. `components/dashboard/sumup-chart.tsx` — revenue chart
6. `components/dashboard/sumup-top-services.tsx` — top services bar chart
7. `components/dashboard/sumup-payouts.tsx` — payouts table
8. `/dashboard/ventes` page — assembles all widgets
9. Update `/dashboard` home — add combined revenue row
10. Update `DashboardNav` — add Ventes link

---

## Open questions before implementation

- [ ] Confirm SumUp merchant code (run `GET /v0.1/me` with API key to retrieve)
- [ ] Confirm SumUp secret API key is created with correct scopes (`payments`, `transactions:history`)
- [ ] Confirm Vercel cron is available on current plan (for daily cache refresh)
