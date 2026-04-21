import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')
  const action = searchParams.get('action')

  if (!token || action !== 'accept') {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { data: lead, error } = await supabaseAdmin
    .from('leads')
    .select('id, status, respond_token, proposed_date, proposed_time')
    .eq('respond_token', token)
    .single()

  if (error || !lead) {
    return NextResponse.redirect(new URL('/booking/respond/invalid', req.url))
  }

  if (lead.status === 'cancelled') {
    return NextResponse.redirect(new URL('/booking/respond/expired', req.url))
  }

  await supabaseAdmin
    .from('leads')
    .update({
      client_response: 'accepted',
      status: 'contacted',
      respond_token: null,
    })
    .eq('id', lead.id)

  return NextResponse.redirect(new URL('/booking/respond/accepted', req.url))
}
