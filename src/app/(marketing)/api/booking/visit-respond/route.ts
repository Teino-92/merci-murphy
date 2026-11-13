import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

// Client accepts a rescheduled slot (link sent by dashboard reschedule).
// Accepting a new time must never settle a deposit: a visit awaiting its
// deposit stays `pending_deposit` until the team confirms payment.
export async function GET(req: NextRequest) {
  const dest = new URL('/booking/respond/accepted', req.url)
  const token = req.nextUrl.searchParams.get('token')
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return NextResponse.redirect(dest)

  const { data: visit, error } = await supabaseAdmin
    .from('visits')
    .select('id, status, deposit_paid_at')
    .eq('respond_token', token)
    .single()

  if (error || !visit || visit.status === 'cancelled') return NextResponse.redirect(dest)

  const nextStatus = visit.status === 'pending_deposit' ? 'pending_deposit' : 'confirmed'

  await supabaseAdmin
    .from('visits')
    .update({ status: nextStatus, respond_token: null })
    .eq('id', visit.id)
    .eq('respond_token', token)

  if (visit.deposit_paid_at) dest.searchParams.set('deposit', 'paid')

  return NextResponse.redirect(dest)
}
