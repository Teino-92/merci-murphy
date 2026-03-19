import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: rows } = await supabaseAdmin
    .from('sumup_cache')
    .select('period, total_revenue, transaction_count, refreshed_at, by_payment_type')
    .order('refreshed_at', { ascending: false })

  return NextResponse.json({ rows })
}
