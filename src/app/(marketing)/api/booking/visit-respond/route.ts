import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

const TOKEN_RE = /^[a-f0-9]{64}$/

// Old email links: never mutate on GET, send to the confirmation page.
export async function GET(req: NextRequest) {
  const dest = new URL('/booking/respond/confirm', req.url)
  dest.searchParams.set('kind', 'visit')
  dest.searchParams.set('token', req.nextUrl.searchParams.get('token') ?? '')
  return NextResponse.redirect(dest, 303)
}

// Client accepts a rescheduled slot (link sent by dashboard reschedule).
// Accepting a new time must never settle a deposit: a visit awaiting its
// deposit stays `pending_deposit` until the team confirms payment.
export async function POST(req: NextRequest) {
  const dest = new URL('/booking/respond/accepted', req.url)
  const form = await req.formData().catch(() => null)
  const token = form?.get('token')
  if (typeof token !== 'string' || !TOKEN_RE.test(token)) {
    return NextResponse.redirect(new URL('/booking/respond/invalid', req.url), 303)
  }

  const { data: visit, error } = await supabaseAdmin
    .from('visits')
    .select('id, status, deposit_paid_at')
    .eq('respond_token', token)
    .single()

  if (error || !visit || visit.status === 'cancelled') {
    return NextResponse.redirect(new URL('/booking/respond/invalid', req.url), 303)
  }

  const nextStatus = visit.status === 'pending_deposit' ? 'pending_deposit' : 'confirmed'

  await supabaseAdmin
    .from('visits')
    .update({ status: nextStatus, respond_token: null })
    .eq('id', visit.id)
    .eq('respond_token', token)

  if (visit.deposit_paid_at) dest.searchParams.set('deposit', 'paid')

  return NextResponse.redirect(dest, 303)
}
