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

// Map cal.com event slug to service display name
const EVENT_SLUG_TO_SERVICE: Record<string, string> = {
  toilettage: 'Toilettage',
  'toilettage-maison-poilus-r-avec-titouan': 'Toilettage',
  'toilettage-maison-poilus-r-avec-andrea': 'Toilettage',
  'les-bains': 'Bains',
  balneo: 'Balnéo',
}

// Map cal.com event slug to staff name
const EVENT_SLUG_TO_STAFF: Record<string, string | null> = {
  toilettage: null,
  'toilettage-maison-poilus-r-avec-titouan': 'Titouan',
  'toilettage-maison-poilus-r-avec-andrea': 'Andrea',
  'les-bains': null,
  balneo: null,
}

function getServiceFromSlug(eventSlug: string): string | null {
  const slug = eventSlug.split('/').pop() ?? ''
  return EVENT_SLUG_TO_SERVICE[slug] ?? null
}

function getStaffFromSlug(eventSlug: string): string | null {
  const slug = eventSlug.split('/').pop() ?? ''
  return EVENT_SLUG_TO_STAFF[slug] ?? null
}

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
    uid?: string
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

  const valid = await verifySignature(req, rawBody)
  if (!valid) return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })

  let payload: CalPayload

  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // eslint-disable-next-line no-console
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

    // Toilettage booked by client (not dashboard) → staff must validate price before deposit
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
        staff: getStaffFromSlug(eventSlug),
        price: null,
        final_price: null,
        status,
        cal_booking_uid: payload.payload.uid ?? null,
      })
      .select()
      .single()

    if (visitError) {
      // eslint-disable-next-line no-console
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
      // eslint-disable-next-line no-console
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
      // eslint-disable-next-line no-console
      console.error('Thank-you email error:', err)
    }

    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ ok: true })
}
