import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'

// Deletes stale/overlapping cache rows, keeping only rows with YYYY-MM-DD_YYYY-MM-DD period format.
// Run once via POST /api/dashboard/sumup/cleanup

export async function POST() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const dateRangeRe = /^\d{4}-\d{2}-\d{2}_\d{4}-\d{2}-\d{2}$/

  const { data: rows } = await supabaseAdmin.from('sumup_cache').select('period')
  if (!rows?.length) return NextResponse.json({ deleted: [] })

  const stale = rows.filter((r) => !dateRangeRe.test(r.period)).map((r) => r.period)

  if (stale.length === 0) return NextResponse.json({ deleted: [] })

  const { error } = await supabaseAdmin.from('sumup_cache').delete().in('period', stale)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ deleted: stale })
}
