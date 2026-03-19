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

  const { data: rows, error } = await supabaseAdmin.from('sumup_cache').select('*')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!rows?.length) {
    return NextResponse.json({ data: null })
  }

  // Merge all cache rows, filtering by_day entries within [from, to]
  const dayMap = new Map<string, number>()
  const productMap = new Map<
    string,
    { name: string; category: string; revenue: number; quantity: number }
  >()
  let latestPayouts: unknown[] = []
  let latestRefreshedAt: string | null = null

  for (const row of rows) {
    // by_day — collect only entries within the requested range
    for (const entry of (row.by_day ?? []) as { date: string; revenue: number }[]) {
      if (entry.date >= fromParam && entry.date <= toParam) {
        dayMap.set(entry.date, (dayMap.get(entry.date) ?? 0) + entry.revenue)
      }
    }
    // by_product — merge quantities and revenue
    for (const p of (row.by_product ?? []) as {
      name: string
      category: string
      revenue: number
      quantity: number
    }[]) {
      const existing = productMap.get(p.name)
      if (!existing) {
        productMap.set(p.name, { ...p })
      } else {
        productMap.set(p.name, {
          ...existing,
          revenue: existing.revenue + p.revenue,
          quantity: existing.quantity + p.quantity,
        })
      }
    }
    // payouts — use the most recently refreshed row
    if (!latestRefreshedAt || (row.refreshed_at && row.refreshed_at > latestRefreshedAt)) {
      latestRefreshedAt = row.refreshed_at ?? null
      latestPayouts = row.payouts ?? []
    }
  }

  const byDay = Array.from(dayMap.entries())
    .map(([date, revenue]) => ({ date, revenue, count: 0 }))
    .sort((a, b) => a.date.localeCompare(b.date))

  const totalRevenue = byDay.reduce((s, d) => s + d.revenue, 0)
  const byProduct = Array.from(productMap.values()).sort((a, b) => b.revenue - a.revenue)

  // Try exact period match for transaction-level stats
  const exactRow = rows.find((r) => r.period === `${fromParam}_${toParam}`)

  const data = {
    by_day: byDay,
    by_product: byProduct,
    payouts: latestPayouts,
    total_revenue: totalRevenue,
    transaction_count: exactRow?.transaction_count ?? 0,
    avg_ticket:
      exactRow?.avg_ticket ??
      (totalRevenue > 0 && byDay.length > 0 ? totalRevenue / byDay.length : 0),
    refund_rate: exactRow?.refund_rate ?? 0,
    refreshed_at: latestRefreshedAt,
  }

  return NextResponse.json({ data, period: `${fromParam}_${toParam}` })
}
