import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getDailyRevenue, getTopProducts } from '@/lib/shopify-admin'

export async function GET(req: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = req.nextUrl
  const from = searchParams.get('from') // YYYY-MM-DD
  const to = searchParams.get('to') // YYYY-MM-DD

  const [[daily, top], sumupDaily] = await Promise.all([
    Promise.all([
      getDailyRevenue(from ?? undefined, to ?? undefined),
      getTopProducts(from ?? undefined, to ?? undefined),
    ]),
    (async () => {
      if (!from || !to) return []
      try {
        // Fetch all cache rows and merge by_day entries that fall within [from, to].
        // This handles cases where the cached period is wider than the requested range
        // (e.g. cache has 2026-03-01_2026-03-19 but user requests today only).
        const { data: rows } = await supabaseAdmin.from('sumup_cache').select('by_day')
        if (!rows) return []
        const map = new Map<string, number>()
        for (const row of rows) {
          const byDay: { date: string; revenue: number; count: number }[] = row.by_day ?? []
          for (const entry of byDay) {
            if (entry.date >= from && entry.date <= to) {
              map.set(entry.date, (map.get(entry.date) ?? 0) + entry.revenue)
            }
          }
        }
        return Array.from(map.entries())
          .map(([date, revenue]) => ({ date, revenue }))
          .sort((a, b) => a.date.localeCompare(b.date))
      } catch {
        return []
      }
    })(),
  ])

  return NextResponse.json({ daily, top, sumupDaily })
}
