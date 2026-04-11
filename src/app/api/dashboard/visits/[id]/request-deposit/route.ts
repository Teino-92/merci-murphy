import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { isAdminEmail } from '@/lib/auth-role'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isAdminEmail(user.email)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { finalPrice } = await req.json()
  if (!finalPrice || isNaN(Number(finalPrice)) || Number(finalPrice) <= 0) {
    return NextResponse.json({ error: 'finalPrice invalide' }, { status: 400 })
  }

  const price = Number(finalPrice)
  const depositAmount = Math.round(price * 0.5 * 100) / 100

  const { error } = await supabaseAdmin
    .from('visits')
    .update({ final_price: price })
    .eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true, depositAmount })
}
