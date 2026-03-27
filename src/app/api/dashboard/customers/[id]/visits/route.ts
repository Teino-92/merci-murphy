import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { service, date, notes, staff, price } = await req.json()
  const { data, error } = await supabaseAdmin
    .from('visits')
    .insert({
      profile_id: params.id,
      service,
      date,
      notes: notes || null,
      staff: staff || null,
      price: price != null && price !== '' ? Number(price) : null,
    })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
