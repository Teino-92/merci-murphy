// src/app/api/webhooks/sumup/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { bookingConfirmedHtml } from '@/lib/emails/booking-confirmed'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

async function verifySignature(req: NextRequest, rawBody: string): Promise<boolean> {
  const secret = process.env.SUMUP_WEBHOOK_SECRET
  if (!secret) return false
  const sig = req.headers.get('x-payload-signature')
  if (!sig) return false
  const expected = createHmac('sha256', secret).update(rawBody).digest('hex')
  return sig === expected
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text()

  const valid = await verifySignature(req, rawBody)
  if (!valid) return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })

  let payload: {
    event_type: string
    checkout_reference: string
    status: string
    customer?: { email?: string; name?: string }
    transaction_code?: string
    timestamp?: string
  }

  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (payload.event_type !== 'CHECKOUT_STATUS_CHANGED' || payload.status !== 'PAID') {
    return NextResponse.json({ ok: true })
  }

  // checkout_reference is 'deposit_<visitId>'
  const visitId = payload.checkout_reference.replace('deposit_', '')

  const { data: visit, error: fetchError } = await supabaseAdmin
    .from('visits')
    .select('*')
    .eq('id', visitId)
    .single()

  if (fetchError || !visit) {
    return NextResponse.json({ error: 'Visit not found' }, { status: 404 })
  }

  // Update status
  await supabaseAdmin
    .from('visits')
    .update({ status: 'confirmed', deposit_paid_at: new Date().toISOString() })
    .eq('id', visit.id)

  // Send confirmation email
  if (payload.customer?.email) {
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('nom')
      .eq('id', visit.profile_id)
      .single()

    const startDate = new Date(`${visit.date}T${visit.time ?? '00:00'}`)
    const formatted = startDate.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Paris',
    })

    await resend.emails
      .send({
        from: `merci murphy® <${process.env.RESEND_FROM_EMAIL}>`,
        to: payload.customer.email,
        subject: 'Réservation confirmée — merci murphy® 🐾',
        html: bookingConfirmedHtml({
          clientName: profile?.nom ?? payload.customer.name ?? 'Client',
          serviceName: 'toilettage',
          appointmentDate: formatted,
        }),
      })
      .catch((err) => console.error('Confirmation email error:', err))
  }

  return NextResponse.json({ ok: true })
}
