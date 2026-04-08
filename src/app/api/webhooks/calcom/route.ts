// src/app/api/webhooks/calcom/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { createSumUpCheckout, getSumUpCheckoutUrl } from '@/lib/sumup'
import { depositRequestHtml } from '@/lib/emails/deposit-request'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// Map cal.com event slug to Supabase visit service value
const EVENT_SLUG_TO_SERVICE: Record<string, string> = {
  toilettage: 'toilettage',
  'les-bains': 'bains',
  balneo: 'balneo',
}

function getServiceFromCalLink(eventSlug: string): string | null {
  // eventSlug may be full path like 'merci-murphy/toilettage'
  const parts = eventSlug.split('/')
  const slug = parts[parts.length - 1]
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
      metadata?: Record<string, string>
      responses?: { notes?: { value?: string } }
    }
  }

  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Only handle BOOKING_CREATED
  if (payload.triggerEvent !== 'BOOKING_CREATED') {
    return NextResponse.json({ ok: true })
  }

  const attendee = payload.payload.attendees[0]
  if (!attendee) return NextResponse.json({ error: 'No attendee' }, { status: 400 })

  const service = getServiceFromCalLink(payload.payload.eventType.slug)
  if (!service) return NextResponse.json({ error: 'Unknown event type' }, { status: 400 })

  // Detect if booked from dashboard (source=dashboard in notes prefill)
  const notesValue = payload.payload.responses?.notes?.value ?? ''
  const isDashboardBooking = notesValue.includes('source=dashboard')

  // Look up profile by attendee email
  const { data: users } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 })
  const authUser = (users?.users ?? []).find((u) => u.email === attendee.email)
  if (!authUser) {
    // No account yet — skip visit creation (client booked before creating account)
    return NextResponse.json({ ok: true, skipped: 'no_profile' })
  }

  // Parse start time
  const startDate = new Date(payload.payload.startTime)
  const dateStr = startDate.toISOString().slice(0, 10) // YYYY-MM-DD
  const timeStr = startDate.toISOString().slice(11, 16) // HH:MM

  // Insert visit
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
      status,
    })
    .select()
    .single()

  if (visitError) {
    console.error('Visit insert error:', visitError)
    return NextResponse.json({ error: visitError.message }, { status: 500 })
  }

  // Toilettage + client booking → create deposit
  if (service === 'toilettage' && !isDashboardBooking) {
    try {
      const checkout = await createSumUpCheckout({
        amount: 60,
        reference: `deposit_${visit.id}`,
        description: `Acompte toilettage — ${attendee.name}`,
        returnUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/booking/confirmed`,
      })

      // Store checkout id on the visit
      await supabaseAdmin
        .from('visits')
        .update({ sumup_checkout_id: checkout.id })
        .eq('id', visit.id)

      const paymentUrl = getSumUpCheckoutUrl(checkout.id)

      // Format date for email
      const formatted = startDate.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Europe/Paris',
      })

      await resend.emails.send({
        from: `merci murphy® <${process.env.RESEND_FROM_EMAIL}>`,
        to: attendee.email,
        subject: 'Confirmez votre réservation — merci murphy® 🐾',
        html: depositRequestHtml({
          clientName: attendee.name,
          serviceName: 'toilettage',
          appointmentDate: formatted,
          depositAmount: 60,
          paymentUrl,
        }),
      })
    } catch (err) {
      // Log but don't fail the webhook — visit is created
      console.error('Deposit flow error:', err)
    }
  }

  return NextResponse.json({ ok: true, visitId: visit.id })
}
