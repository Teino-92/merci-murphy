# Booking Emails — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Send two automated emails via Resend triggered by cal.com webhooks: a 24h reminder before the appointment, and a thank-you email 20 minutes after the event ends with a Google review CTA and 3 dynamic Shopify bestseller products.

**Architecture:** The existing `/api/webhooks/calcom` route already handles `BOOKING_CREATED`. We extend it to handle two new triggers: `BOOKING_REMINDER` (cal.com fires 24h before) and `MEETING_ENDED`. For `MEETING_ENDED` we fetch 3 bestselling Shopify products server-side and include them in the email HTML. Both emails are sent via Resend. The Shopify fetch uses the existing `shopifyFetch` pattern from `src/lib/shopify.ts` but called server-side without Next.js cache (raw fetch).

**Tech Stack:** Next.js 14 App Router, TypeScript strict, Resend, Shopify Storefront API, cal.com webhooks

**Cal.com webhook triggers to add:** `BOOKING_REMINDER` (set reminder to 24h before in cal.com) and `MEETING_ENDED`

---

## File Map

| File                                   | Action | Purpose                                                                 |
| -------------------------------------- | ------ | ----------------------------------------------------------------------- |
| `src/app/api/webhooks/calcom/route.ts` | Modify | Handle `BOOKING_REMINDER` and `MEETING_ENDED` trigger events            |
| `src/lib/emails/booking-reminder.ts`   | Create | HTML email template for 24h before reminder                             |
| `src/lib/emails/thank-you.ts`          | Create | HTML email template for post-event thank you + Google review + products |
| `src/lib/shopify-server.ts`            | Create | Server-side Shopify fetch (no Next.js cache) for use in API routes      |

---

## Task 1: Create server-side Shopify helper

**Files:**

- Create: `src/lib/shopify-server.ts`

The existing `src/lib/shopify.ts` uses `next: { revalidate: 3600 }` which only works in Server Components, not in API routes/webhooks. We need a plain fetch version.

- [ ] **Step 1: Create `src/lib/shopify-server.ts`**

```typescript
// src/lib/shopify-server.ts
// Server-side Shopify fetch for use in API routes (no Next.js cache)

interface ShopifyProductBasic {
  id: string
  title: string
  handle: string
  featuredImage: { url: string; altText: string | null } | null
  priceRange: { minVariantPrice: { amount: string; currencyCode: string } }
}

export async function getBestsellingProducts(count = 3): Promise<ShopifyProductBasic[]> {
  const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN
  const token = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN

  const query = `{
    products(first: ${count}, sortKey: BEST_SELLING) {
      nodes {
        id
        title
        handle
        featuredImage { url altText }
        priceRange { minVariantPrice { amount currencyCode } }
      }
    }
  }`

  const res = await fetch(`https://${domain}/api/2026-01/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': token!,
    },
    body: JSON.stringify({ query }),
  })

  if (!res.ok) return []
  const json = await res.json()
  return json.data?.products?.nodes ?? []
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: 0 errors

- [ ] **Step 3: Commit**

```bash
git add src/lib/shopify-server.ts
git commit -m "feat: add server-side Shopify bestsellers helper for API routes"
```

---

## Task 2: Create booking reminder email template

**Files:**

- Create: `src/lib/emails/booking-reminder.ts`

Sent 24h before the appointment. Friendly reminder with date, time, and address.

- [ ] **Step 1: Create `src/lib/emails/booking-reminder.ts`**

```typescript
// src/lib/emails/booking-reminder.ts

export function bookingReminderHtml(params: {
  dogName: string | null
  serviceName: string
  appointmentDate: string // e.g. 'vendredi 11 avril à 14h30'
}): string {
  const { dogName, serviceName, appointmentDate } = params
  const subject = dogName ? `le rendez-vous de ${dogName}` : 'votre rendez-vous'

  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Rappel de votre rendez-vous — merci murphy®</title></head>
<body style="margin:0;padding:0;background:#f5f0eb;font-family:Inter,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0">
<tr><td align="center" style="padding:48px 16px;">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;">
<tr><td style="padding:40px 48px;background:#1D164E;text-align:center;">
  <p style="margin:0;color:#f5f0eb;font-size:22px;font-weight:600;letter-spacing:0.02em;">merci murphy®</p>
</td></tr>
<tr><td style="padding:40px 48px;">
  <p style="margin:0 0 16px;font-size:15px;color:#4a4a4a;line-height:1.6;">Bonjour,</p>
  <p style="margin:0 0 16px;font-size:15px;color:#4a4a4a;line-height:1.6;">
    Nous vous rappelons ${subject} pour un <strong>${serviceName.toLowerCase()}</strong> demain <strong>${appointmentDate}</strong> chez merci murphy.
  </p>
  <p style="margin:0 0 16px;font-size:15px;color:#4a4a4a;line-height:1.6;">
    📍 18 rue Victor Massé, 75009 Paris
  </p>
  <p style="margin:0 0 32px;font-size:15px;color:#4a4a4a;line-height:1.6;">
    En cas d'empêchement, merci de nous prévenir le plus tôt possible afin que nous puissions proposer ce créneau à un autre client.
  </p>
  <p style="margin:0;font-size:15px;color:#4a4a4a;line-height:1.6;">
    À demain,<br>
    <strong>L'équipe merci murphy</strong>
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

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: 0 errors

- [ ] **Step 3: Commit**

```bash
git add src/lib/emails/booking-reminder.ts
git commit -m "feat: add booking reminder email template"
```

---

## Task 3: Create thank-you email template

**Files:**

- Create: `src/lib/emails/thank-you.ts`

Sent ~20min after the event ends. Includes Google review CTA and 3 Shopify product cards.

- [ ] **Step 1: Create `src/lib/emails/thank-you.ts`**

```typescript
// src/lib/emails/thank-you.ts

interface ProductCard {
  title: string
  handle: string
  imageUrl: string | null
  price: string // e.g. '24.90'
}

export function thankYouHtml(params: {
  dogName: string | null
  serviceName: string
  googleReviewUrl: string
  products: ProductCard[]
}): string {
  const { dogName, serviceName, googleReviewUrl, products } = params
  const dogText = dogName ? `${dogName} et vous` : 'vous'

  const productCards = products
    .map(
      (p) => `
    <td align="center" style="padding:8px;width:33%;" valign="top">
      <a href="https://mercimurphy.com/shop/${p.handle}" style="text-decoration:none;color:#1D164E;">
        ${
          p.imageUrl
            ? `<img src="${p.imageUrl}" alt="${p.title}" width="140" style="border-radius:8px;display:block;margin:0 auto 8px;" />`
            : ''
        }
        <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#1D164E;">${p.title}</p>
        <p style="margin:0;font-size:12px;color:#888;">${p.price} €</p>
      </a>
    </td>`
    )
    .join('')

  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Merci pour votre visite — merci murphy®</title></head>
<body style="margin:0;padding:0;background:#f5f0eb;font-family:Inter,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0">
<tr><td align="center" style="padding:48px 16px;">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;">
<tr><td style="padding:40px 48px;background:#1D164E;text-align:center;">
  <p style="margin:0;color:#f5f0eb;font-size:22px;font-weight:600;letter-spacing:0.02em;">merci murphy®</p>
</td></tr>
<tr><td style="padding:40px 48px;">
  <p style="margin:0 0 16px;font-size:15px;color:#4a4a4a;line-height:1.6;">Bonjour,</p>
  <p style="margin:0 0 16px;font-size:15px;color:#4a4a4a;line-height:1.6;">
    Merci pour votre visite aujourd'hui ! Nous espérons que ${dogText} êtes repartis heureux de votre séance de <strong>${serviceName.toLowerCase()}</strong>.
  </p>
  <p style="margin:0 0 32px;font-size:15px;color:#4a4a4a;line-height:1.6;">
    Votre avis compte beaucoup pour nous. Si vous avez été satisfait(e), nous serions ravis que vous partagiez votre expérience en ligne — cela nous aide énormément !
  </p>
  <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 40px;">
    <tr><td align="center">
      <a href="${googleReviewUrl}" style="display:inline-block;background:#B85C38;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 32px;border-radius:100px;">
        Laisser un avis Google ⭐
      </a>
    </td></tr>
  </table>
  ${
    products.length > 0
      ? `<p style="margin:0 0 16px;font-size:14px;font-weight:600;color:#1D164E;">Nos coups de cœur du moment</p>
  <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
    <tr>${productCards}</tr>
  </table>
  <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
    <tr><td align="center">
      <a href="https://mercimurphy.com/shop" style="font-size:13px;color:#1D164E;text-decoration:underline;">
        Voir toute la boutique →
      </a>
    </td></tr>
  </table>`
      : ''
  }
  <p style="margin:0;font-size:15px;color:#4a4a4a;line-height:1.6;">
    À très bientôt,<br>
    <strong>L'équipe merci murphy</strong>
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

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: 0 errors

- [ ] **Step 3: Commit**

```bash
git add src/lib/emails/thank-you.ts
git commit -m "feat: add thank-you email template with Google review CTA and product cards"
```

---

## Task 4: Extend cal.com webhook to handle BOOKING_REMINDER and MEETING_ENDED

**Files:**

- Modify: `src/app/api/webhooks/calcom/route.ts`

Cal.com sends `BOOKING_REMINDER` when the reminder fires (configure to 24h in cal.com dashboard). It sends `MEETING_ENDED` when the event end time passes.

Both payloads have the same structure as `BOOKING_CREATED`. We look up the attendee's profile to get `nom_chien` and the service name.

The Google review URL:
`https://www.google.com/search?sca_esv=51f1ea3ba9abaebf&sxsrf=ANbL-n5uoG36-TXIAoMzHvaLG_VnUNLpiw:1775678003574&q=merci+murphy+Avis&rflfq=1&num=20&stick=H4sIAAAAAAAAAONgkxI2MzE1NTAwMjc2NTEyMjUGMTYwMr5iFMxNLUrOVMgtLSrIqFRwLMssXsSKKQYAHsJGA0IAAAA&rldimm=6455002735422532735&tbm=lcl&hl=fr-FR&sa=X&ved=2ahUKEwiMv42FhN-TAxVjRKQEHYfLHwsQ9fQKegQIKhAG&biw=1450&bih=902&dpr=2#lkt=LocalPoiReviews`

- [ ] **Step 1: Replace `src/app/api/webhooks/calcom/route.ts`**

```typescript
// src/app/api/webhooks/calcom/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { bookingReminderHtml } from '@/lib/emails/booking-reminder'
import { thankYouHtml } from '@/lib/emails/thank-you'
import { getBestsellingProducts } from '@/lib/shopify-server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const GOOGLE_REVIEW_URL =
  'https://www.google.com/search?sca_esv=51f1ea3ba9abaebf&sxsrf=ANbL-n5uoG36-TXIAoMzHvaLG_VnUNLpiw:1775678003574&q=merci+murphy+Avis&rflfq=1&num=20&stick=H4sIAAAAAAAAAONgkxI2MzE1NTAwMjc2NTEyMjUGMTYwMr5iFMxNLUrOVMgtLSrIqFRwLMssXsSKKQYAHsJGA0IAAAA&rldimm=6455002735422532735&tbm=lcl&hl=fr-FR&sa=X&ved=2ahUKEwiMv42FhN-TAxVjRKQEHYfLHwsQ9fQKegQIKhAG&biw=1450&bih=902&dpr=2#lkt=LocalPoiReviews'

const EVENT_SLUG_TO_SERVICE: Record<string, string> = {
  toilettage: 'Toilettage',
  'toilettage-maison-poilus-r-avec-titouan': 'Toilettage',
  'toilettage-maison-poilus-r-avec-andrea': 'Toilettage',
  'les-bains': 'Bains',
  balneo: 'Balnéo',
}

function getServiceFromSlug(eventSlug: string): string | null {
  const slug = eventSlug.split('/').pop() ?? ''
  return EVENT_SLUG_TO_SERVICE[slug] ?? null
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function verifySignature(req: NextRequest, rawBody: string): Promise<boolean> {
  const secret = process.env.CAL_WEBHOOK_SECRET
  if (!secret) return false
  const sig = req.headers.get('x-cal-signature-256')
  if (!sig) return false
  const expected = createHmac('sha256', secret).update(rawBody).digest('hex')
  return sig === expected
}

interface CalPayload {
  triggerEvent: string
  payload: {
    attendees: { name: string; email: string }[]
    eventType?: { slug: string; title: string }
    type?: string
    startTime: string
    endTime: string
    responses?: { notes?: { value?: string } }
  }
}

async function getAttendeeInfo(email: string): Promise<{
  dogName: string | null
  profileId: string | null
}> {
  const { data: users } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 })
  const authUser = (users?.users ?? []).find((u) => u.email === email)
  if (!authUser) return { dogName: null, profileId: null }

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('nom_chien')
    .eq('id', authUser.id)
    .single()

  return { dogName: profile?.nom_chien ?? null, profileId: authUser.id }
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text()

  // TODO: re-enable signature check once webhook is confirmed working
  // const valid = await verifySignature(req, rawBody)
  // if (!valid) return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })

  let payload: CalPayload

  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  console.log('CAL WEBHOOK PAYLOAD:', JSON.stringify(payload, null, 2))

  const attendee = payload.payload.attendees?.[0]
  if (!attendee) return NextResponse.json({ error: 'No attendee' }, { status: 400 })

  const eventSlug = payload.payload.eventType?.slug ?? payload.payload.type ?? ''
  const service = getServiceFromSlug(eventSlug)

  const startDate = new Date(payload.payload.startTime)
  const appointmentDate = startDate.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Paris',
  })

  // ─── BOOKING_CREATED ────────────────────────────────────────────────────────
  if (payload.triggerEvent === 'BOOKING_CREATED') {
    if (!service) return NextResponse.json({ error: 'Unknown event type' }, { status: 400 })

    const notesValue = payload.payload.responses?.notes?.value ?? ''
    const isDashboardBooking = notesValue.includes('source=dashboard')

    const { data: users } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 })
    const authUser = (users?.users ?? []).find((u) => u.email === attendee.email)
    if (!authUser) return NextResponse.json({ ok: true, skipped: 'no_profile' })

    const dateStr = startDate.toISOString().slice(0, 10)
    const timeStr = startDate.toISOString().slice(11, 16)
    const status = service === 'Toilettage' && !isDashboardBooking ? 'pending_deposit' : 'confirmed'

    const { data: visit, error: visitError } = await supabaseAdmin
      .from('visits')
      .insert({
        profile_id: authUser.id,
        service: service.toLowerCase(),
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

  // ─── BOOKING_REMINDER (24h before) ─────────────────────────────────────────
  if (payload.triggerEvent === 'BOOKING_REMINDER') {
    if (!service) return NextResponse.json({ ok: true })

    const { dogName } = await getAttendeeInfo(attendee.email)

    try {
      await resend.emails.send({
        from: `merci murphy® <${process.env.RESEND_FROM_EMAIL}>`,
        to: attendee.email,
        subject: `Rappel — votre rendez-vous demain chez merci murphy® 🐾`,
        html: bookingReminderHtml({
          dogName,
          serviceName: service,
          appointmentDate,
        }),
      })
    } catch (err) {
      console.error('Reminder email error:', err)
    }

    return NextResponse.json({ ok: true })
  }

  // ─── MEETING_ENDED ──────────────────────────────────────────────────────────
  if (payload.triggerEvent === 'MEETING_ENDED') {
    if (!service) return NextResponse.json({ ok: true })

    const { dogName } = await getAttendeeInfo(attendee.email)

    const products = await getBestsellingProducts(3)
    const productCards = products.map((p) => ({
      title: p.title,
      handle: p.handle,
      imageUrl: p.featuredImage?.url ?? null,
      price: parseFloat(p.priceRange.minVariantPrice.amount).toFixed(2),
    }))

    try {
      await resend.emails.send({
        from: `merci murphy® <${process.env.RESEND_FROM_EMAIL}>`,
        to: attendee.email,
        subject: `Merci pour votre visite chez merci murphy® 🐾`,
        html: thankYouHtml({
          dogName,
          serviceName: service,
          googleReviewUrl: GOOGLE_REVIEW_URL,
          products: productCards,
        }),
      })
    } catch (err) {
      console.error('Thank-you email error:', err)
    }

    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: 0 errors

- [ ] **Step 3: Commit**

```bash
git add src/app/api/webhooks/calcom/route.ts
git commit -m "feat: handle BOOKING_REMINDER and MEETING_ENDED webhook triggers with Resend emails"
```

---

## Task 5: Configure cal.com webhook triggers

This is a manual step in the cal.com dashboard.

- [ ] **Step 1: Add triggers to the existing webhooks**

For each event type webhook (Titouan and Andrea):

- Go to cal.com → event type → Advanced → Webhooks → edit the webhook
- Add triggers: `BOOKING_REMINDER` and `MEETING_ENDED`

- [ ] **Step 2: Set reminder timing**

For `BOOKING_REMINDER`, cal.com lets you set when it fires. Set it to **24 hours before** the event.

- [ ] **Step 3: Test**

Make a test booking. After the event end time passes, check Vercel logs for `MEETING_ENDED` payload.

---

## Task 6: Final build verification

- [ ] **Step 1: Type-check**

Run: `npx tsc --noEmit`
Expected: 0 errors

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: successful build, no errors

- [ ] **Step 3: Push**

```bash
git push origin main
```
