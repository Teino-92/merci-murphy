import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!token) return NextResponse.redirect(new URL('/booking/respond/accepted', req.url))

  const { data: visit, error } = await supabaseAdmin
    .from('visits')
    .select('id, status')
    .eq('respond_token', token)
    .single()

  if (error || !visit) return NextResponse.redirect(new URL('/booking/respond/accepted', req.url))

  await supabaseAdmin
    .from('visits')
    .update({ status: 'confirmed', respond_token: null })
    .eq('id', visit.id)

  return NextResponse.redirect(new URL('/booking/respond/accepted', req.url))
}
