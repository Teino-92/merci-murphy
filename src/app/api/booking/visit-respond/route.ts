import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!token) return NextResponse.redirect(new URL('/booking/respond/accepted', req.url))

  const { data: visit, error } = await supabaseAdmin
    .from('visits')
    .select('id, status, deposit_amount')
    .eq('respond_token', token)
    .single()

  if (error || !visit) return NextResponse.redirect(new URL('/booking/respond/accepted', req.url))

  await supabaseAdmin
    .from('visits')
    .update({ status: 'confirmed', respond_token: null })
    .eq('id', visit.id)

  const depositAlreadyPaid = visit.deposit_amount != null && visit.deposit_amount > 0
  const dest = new URL('/booking/respond/accepted', req.url)
  if (depositAlreadyPaid) dest.searchParams.set('deposit', 'paid')

  return NextResponse.redirect(dest)
}
