import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(req: NextRequest) {
  // Auth check
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = req.nextUrl
  const fromParam = searchParams.get('from')
  const toParam = searchParams.get('to')

  const dateRe = /^\d{4}-\d{2}-\d{2}$/
  if (!fromParam || !toParam || !dateRe.test(fromParam) || !dateRe.test(toParam)) {
    return NextResponse.json(
      { error: 'Invalid params. Use ?from=YYYY-MM-DD&to=YYYY-MM-DD' },
      { status: 400 }
    )
  }

  const { data: rows, error } = await supabaseAdmin
    .from('sumup_cache')
    .select('*')
    .order('refreshed_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!rows?.length) {
    return NextResponse.json({ data: null })
  }

  // Prefer exact period match first
  let best = rows.find((r) => r.period === `${fromParam}_${toParam}`)

  // Then try a row whose cached period fully contains the requested range
  if (!best) {
    best = rows.find((r) => {
      const [rFrom, rTo] = r.period.split('_')
      return rFrom <= fromParam && rTo >= toParam
    })
  }

  // Fall back to the most recently refreshed row
  if (!best) {
    best = rows[0]
  }

  // Filter by_day to the requested range
  const byDay = ((best.by_day ?? []) as { date: string; revenue: number; count: number }[])
    .filter((e) => e.date >= fromParam && e.date <= toParam)
    .sort((a, b) => a.date.localeCompare(b.date))

  const totalRevenue = byDay.reduce((s, d) => s + d.revenue, 0)

  const data = {
    by_day: byDay,
    by_product: best.by_product ?? [],
    payouts: best.payouts ?? [],
    total_revenue: totalRevenue,
    transaction_count: best.transaction_count ?? 0,
    avg_ticket: best.avg_ticket ?? 0,
    refund_rate: best.refund_rate ?? 0,
    refreshed_at: best.refreshed_at ?? null,
  }

  return NextResponse.json({ data, period: `${fromParam}_${toParam}` })
}
