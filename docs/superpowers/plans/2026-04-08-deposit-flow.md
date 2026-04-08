# Deposit Flow — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the automatic 60€ deposit with a staff-initiated flow: client books → visit created as `pending_deposit` → staff sets final price in dashboard → system sends deposit email with 50% payment link → client pays within 12h → visit confirmed.

**Architecture:** The cal.com webhook no longer triggers SumUp — it just inserts the visit as `pending_deposit`. A new API route `POST /api/dashboard/visits/[id]/request-deposit` accepts `finalPrice`, computes 50%, creates a SumUp checkout, and sends the deposit email. The customer detail page renders a "Valider + envoyer acompte" inline form on any `pending_deposit` visit. The SumUp webhook stays as-is (marks `confirmed`, sends confirmation email).

**Tech Stack:** Next.js 14 App Router, TypeScript strict, Supabase service role, Resend, SumUp Checkout API

---

## File Map

| File                                                         | Action | Purpose                                                                                                                            |
| ------------------------------------------------------------ | ------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/api/webhooks/calcom/route.ts`                       | Modify | Remove SumUp trigger — always insert visit as `pending_deposit` for toilettage client bookings, `confirmed` for everything else    |
| `src/app/api/dashboard/visits/[id]/request-deposit/route.ts` | Create | Accept `finalPrice`, compute 50%, create SumUp checkout, update visit with `final_price` + `sumup_checkout_id`, send deposit email |
| `src/lib/supabase-admin.ts`                                  | Modify | Add `final_price: number \| null` to `Visit` interface                                                                             |
| `src/components/dashboard/customer-detail.tsx`               | Modify | Render deposit action UI on `pending_deposit` visits: price input + "Envoyer l'acompte" button                                     |

---

## Task 1: Add `final_price` column to `visits` and update `Visit` interface

**Files:**

- Modify: `src/lib/supabase-admin.ts`

- [ ] **Step 1: Run migration in Supabase SQL editor**

```sql
ALTER TABLE visits ADD COLUMN final_price numeric null;
```

Expected: no error.

- [ ] **Step 2: Add `final_price` to the `Visit` interface in `src/lib/supabase-admin.ts`**

Current interface (around line 25):

```typescript
export interface Visit {
  id: string
  created_at: string
  profile_id: string
  service: string
  date: string
  time: string | null
  duration: number | null
  notes: string | null
  staff: string | null
  price: number | null
  status: 'confirmed' | 'pending_deposit' | 'cancelled'
  sumup_checkout_id: string | null
  deposit_paid_at: string | null
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
  time: string | null
  duration: number | null
  notes: string | null
  staff: string | null
  price: number | null
  final_price: number | null // set by staff when sending deposit request
  status: 'confirmed' | 'pending_deposit' | 'cancelled'
  sumup_checkout_id: string | null
  deposit_paid_at: string | null
}
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: 0 errors

- [ ] **Step 4: Commit**

```bash
git add src/lib/supabase-admin.ts
git commit -m "feat: add final_price to Visit interface (DB migration applied)"
```

---

## Task 2: Simplify cal.com webhook — remove auto SumUp trigger

**Files:**

- Modify: `src/app/api/webhooks/calcom/route.ts`

The webhook currently tries to auto-create a SumUp checkout on `BOOKING_CREATED`. That logic is removed. Toilettage client bookings get `pending_deposit`; everything else (dashboard bookings + non-toilettage) gets `confirmed`.

- [ ] **Step 1: Replace the file**

Write `src/app/api/webhooks/calcom/route.ts`:

```typescript
// src/app/api/webhooks/calcom/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'
import { supabaseAdmin } from '@/lib/supabase-admin'

// Map cal.com event slug to Supabase visit service value
const EVENT_SLUG_TO_SERVICE: Record<string, string> = {
  toilettage: 'toilettage',
  'les-bains': 'bains',
  balneo: 'balneo',
}

function getServiceFromSlug(eventSlug: string): string | null {
  const slug = eventSlug.split('/').pop() ?? ''
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
      responses?: { notes?: { value?: string } }
    }
  }

  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (payload.triggerEvent !== 'BOOKING_CREATED') {
    return NextResponse.json({ ok: true })
  }

  const attendee = payload.payload.attendees[0]
  if (!attendee) return NextResponse.json({ error: 'No attendee' }, { status: 400 })

  const service = getServiceFromSlug(payload.payload.eventType.slug)
  if (!service) return NextResponse.json({ error: 'Unknown event type' }, { status: 400 })

  const notesValue = payload.payload.responses?.notes?.value ?? ''
  const isDashboardBooking = notesValue.includes('source=dashboard')

  // Look up profile by attendee email
  const { data: users } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 })
  const authUser = (users?.users ?? []).find((u) => u.email === attendee.email)
  if (!authUser) {
    return NextResponse.json({ ok: true, skipped: 'no_profile' })
  }

  const startDate = new Date(payload.payload.startTime)
  const dateStr = startDate.toISOString().slice(0, 10)
  const timeStr = startDate.toISOString().slice(11, 16)

  // Toilettage booked by client (not dashboard) → needs deposit validation by staff
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
      final_price: null,
      status,
    })
    .select()
    .single()

  if (visitError) {
    console.error('Visit insert error:', visitError)
    return NextResponse.json({ error: visitError.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, visitId: visit.id })
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: 0 errors

- [ ] **Step 3: Commit**

```bash
git add src/app/api/webhooks/calcom/route.ts
git commit -m "feat: simplify cal.com webhook — staff initiates deposit instead of auto-trigger"
```

---

## Task 3: Create `POST /api/dashboard/visits/[id]/request-deposit`

**Files:**

- Create: `src/app/api/dashboard/visits/[id]/request-deposit/route.ts`

This route is called by the dashboard when staff validates the final price. It:

1. Stores `final_price` on the visit
2. Creates a SumUp checkout at 50% of final price
3. Stores `sumup_checkout_id` on the visit
4. Sends the deposit email to the client

- [ ] **Step 1: Create the directory and file**

Write `src/app/api/dashboard/visits/[id]/request-deposit/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { createSumUpCheckout, getSumUpCheckoutUrl } from '@/lib/sumup'
import { depositRequestHtml } from '@/lib/emails/deposit-request'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const SERVICE_LABELS: Record<string, string> = {
  toilettage: 'Toilettage',
  bains: 'Bains',
  balneo: 'Balnéo',
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  // Auth check — dashboard only
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { finalPrice } = await req.json()
  if (!finalPrice || isNaN(Number(finalPrice)) || Number(finalPrice) <= 0) {
    return NextResponse.json({ error: 'finalPrice invalide' }, { status: 400 })
  }

  const price = Number(finalPrice)
  const depositAmount = Math.round(price * 0.5 * 100) / 100 // 50%, rounded to cents

  // Fetch visit
  const { data: visit, error: visitError } = await supabaseAdmin
    .from('visits')
    .select('*')
    .eq('id', params.id)
    .single()

  if (visitError || !visit) {
    return NextResponse.json({ error: 'Visite introuvable' }, { status: 404 })
  }

  if (visit.status !== 'pending_deposit') {
    return NextResponse.json({ error: 'Cette visite ne nécessite pas de dépôt' }, { status: 400 })
  }

  // Fetch client email from auth
  const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(
    visit.profile_id
  )
  if (authError || !authUser.user?.email) {
    return NextResponse.json({ error: 'Email client introuvable' }, { status: 404 })
  }

  // Fetch profile for client name
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('nom')
    .eq('id', visit.profile_id)
    .single()

  const clientName = profile?.nom ?? 'Client'
  const clientEmail = authUser.user.email

  // Create SumUp checkout
  let checkout
  try {
    checkout = await createSumUpCheckout({
      amount: depositAmount,
      reference: `deposit_${visit.id}`,
      description: `Acompte ${SERVICE_LABELS[visit.service] ?? visit.service} — ${clientName}`,
      returnUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/booking/confirmed`,
    })
  } catch (err) {
    console.error('SumUp error:', err)
    return NextResponse.json({ error: 'Erreur création lien de paiement' }, { status: 500 })
  }

  // Store final_price + sumup_checkout_id on visit
  await supabaseAdmin
    .from('visits')
    .update({
      final_price: price,
      sumup_checkout_id: checkout.id,
    })
    .eq('id', visit.id)

  const paymentUrl = getSumUpCheckoutUrl(checkout.id)

  // Format appointment date for email
  const startDate = new Date(`${visit.date}T${visit.time ?? '00:00'}`)
  const appointmentDate = startDate.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: visit.time ? '2-digit' : undefined,
    minute: visit.time ? '2-digit' : undefined,
    timeZone: 'Europe/Paris',
  })

  // Send deposit email
  try {
    await resend.emails.send({
      from: `merci murphy® <${process.env.RESEND_FROM_EMAIL}>`,
      to: clientEmail,
      subject: 'Confirmez votre réservation — merci murphy® 🐾',
      html: depositRequestHtml({
        clientName,
        serviceName: SERVICE_LABELS[visit.service] ?? visit.service,
        appointmentDate,
        depositAmount,
        paymentUrl,
      }),
    })
  } catch (err) {
    console.error('Resend error:', err)
    // Don't fail — checkout is created, staff can resend manually
  }

  return NextResponse.json({ ok: true, depositAmount, paymentUrl })
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: 0 errors

- [ ] **Step 3: Commit**

```bash
git add 'src/app/api/dashboard/visits/[id]/request-deposit/route.ts'
git commit -m "feat: add request-deposit API route — staff sets price, sends 50% deposit link"
```

---

## Task 4: Add deposit UI to customer detail page

**Files:**

- Modify: `src/components/dashboard/customer-detail.tsx`

On each `pending_deposit` visit card, show a price input + "Envoyer l'acompte" button. On success, update the visit status locally to `confirmed` and show the deposit amount sent.

- [ ] **Step 1: Add deposit state and handler**

In `src/components/dashboard/customer-detail.tsx`, after the existing state declarations (around line 47), add:

```typescript
// Deposit state — keyed by visit id
const [depositPrices, setDepositPrices] = useState<Record<string, string>>({})
const [sendingDeposit, setSendingDeposit] = useState<Record<string, boolean>>({})
const [depositSent, setDepositSent] = useState<Record<string, number>>({})
```

After the `deleteVisit` function (around line 123), add:

```typescript
async function sendDeposit(visitId: string) {
  const finalPrice = depositPrices[visitId]
  if (!finalPrice || isNaN(Number(finalPrice)) || Number(finalPrice) <= 0) return
  setSendingDeposit((s) => ({ ...s, [visitId]: true }))
  const res = await fetch(`/api/dashboard/visits/${visitId}/request-deposit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ finalPrice: Number(finalPrice) }),
  })
  setSendingDeposit((s) => ({ ...s, [visitId]: false }))
  if (!res.ok) return
  const data = await res.json()
  setDepositSent((s) => ({ ...s, [visitId]: data.depositAmount }))
  setVisits((vs) =>
    vs.map((v) =>
      v.id === visitId ? { ...v, final_price: Number(finalPrice), status: 'confirmed' } : v
    )
  )
}
```

- [ ] **Step 2: Update the visit card rendering**

Find the visit card block (around line 442):

```typescript
                {visits.map((v) => (
                  <div key={v.id} className="flex gap-4 p-4 rounded-xl bg-gray-50 group">
                    <div className="shrink-0 text-center">
                      <p className="text-xs font-bold text-[#1D164E]">
                        {new Date(v.date).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                        })}
                      </p>
                      <p className="text-xs text-gray-400">{new Date(v.date).getFullYear()}</p>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-[#1D164E]">
                          {SERVICE_LABELS[v.service] ?? v.service}
                        </span>
                        {v.staff && <span className="text-xs text-gray-400">· {v.staff}</span>}
                        {v.price != null && (
                          <span className="ml-auto text-sm font-semibold text-[#1D164E]">
                            {v.price.toFixed(2)} €
                          </span>
                        )}
                      </div>
                      {v.notes && <p className="text-xs text-gray-500 mt-1">{v.notes}</p>}
                    </div>
                    <button
                      onClick={() => deleteVisit(v.id)}
                      className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
```

Replace with:

```typescript
                {visits.map((v) => (
                  <div key={v.id} className="rounded-xl bg-gray-50 overflow-hidden group">
                    <div className="flex gap-4 p-4">
                      <div className="shrink-0 text-center">
                        <p className="text-xs font-bold text-[#1D164E]">
                          {new Date(v.date).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: 'short',
                          })}
                        </p>
                        <p className="text-xs text-gray-400">{new Date(v.date).getFullYear()}</p>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-[#1D164E]">
                            {SERVICE_LABELS[v.service] ?? v.service}
                          </span>
                          {v.staff && <span className="text-xs text-gray-400">· {v.staff}</span>}
                          {v.status === 'pending_deposit' && (
                            <span className="ml-auto text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                              Acompte en attente
                            </span>
                          )}
                          {v.status === 'confirmed' && v.final_price != null && (
                            <span className="ml-auto text-sm font-semibold text-[#1D164E]">
                              {v.final_price.toFixed(2)} €
                            </span>
                          )}
                          {v.status === 'confirmed' && v.price != null && v.final_price == null && (
                            <span className="ml-auto text-sm font-semibold text-[#1D164E]">
                              {v.price.toFixed(2)} €
                            </span>
                          )}
                        </div>
                        {v.notes && <p className="text-xs text-gray-500 mt-1">{v.notes}</p>}
                        {depositSent[v.id] != null && (
                          <p className="text-xs text-green-600 mt-1">
                            ✓ Acompte de {depositSent[v.id].toFixed(2)} € envoyé
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => deleteVisit(v.id)}
                        className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {v.status === 'pending_deposit' && depositSent[v.id] == null && (
                      <div className="px-4 pb-4 flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="Prix final (€)"
                          value={depositPrices[v.id] ?? ''}
                          onChange={(e) =>
                            setDepositPrices((d) => ({ ...d, [v.id]: e.target.value }))
                          }
                          className="w-36 text-sm rounded-lg border border-gray-200 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#1D164E]"
                        />
                        <button
                          onClick={() => sendDeposit(v.id)}
                          disabled={
                            sendingDeposit[v.id] ||
                            !depositPrices[v.id] ||
                            Number(depositPrices[v.id]) <= 0
                          }
                          className="text-xs font-medium bg-[#1D164E] text-white px-3 py-1.5 rounded-lg hover:bg-[#1D164E]/90 disabled:opacity-50 transition-colors"
                        >
                          {sendingDeposit[v.id] ? 'Envoi…' : 'Envoyer l\'acompte (50%)'}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: 0 errors

- [ ] **Step 4: Commit**

```bash
git add src/components/dashboard/customer-detail.tsx
git commit -m "feat: add deposit validation UI to visit cards in customer detail"
```

---

## Task 5: Final build verification

- [ ] **Step 1: Type-check**

Run: `npx tsc --noEmit`
Expected: 0 errors

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: successful build, no type errors, only existing warnings

- [ ] **Step 3: Commit any lint fixes**

```bash
git add -A
git commit -m "fix: lint issues from deposit flow"
```
