// src/app/api/webhooks/calcom/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'
import { supabaseAdmin } from '@/lib/supabase-admin'

// Map cal.com event slug to Supabase visit service value
const EVENT_SLUG_TO_SERVICE: Record<string, string> = {
  toilettage: 'toilettage',
  'toilettage-maison-poilus-r-avec-titouan': 'toilettage',
  'toilettage-maison-poilus-r-avec-andrea': 'toilettage',
  'les-bains': 'bains',
  balneo: 'balneo',
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

export async function POST(req: NextRequest) {
  const rawBody = await req.text()

  // TODO: re-enable signature check once webhook is confirmed working
  // const valid = await verifySignature(req, rawBody)
  // if (!valid) return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })

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

  // Log full payload for debugging
  console.log('CAL WEBHOOK PAYLOAD:', JSON.stringify(payload, null, 2))

  if (payload.triggerEvent !== 'BOOKING_CREATED') {
    return NextResponse.json({ ok: true })
  }

  const attendee = payload.payload.attendees?.[0]
  if (!attendee) return NextResponse.json({ error: 'No attendee' }, { status: 400 })

  const eventSlug = payload.payload.eventType?.slug ?? payload.payload.type ?? ''
  const service = getServiceFromSlug(eventSlug)
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

  // Toilettage booked by client (not dashboard) → staff must validate price before deposit
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
