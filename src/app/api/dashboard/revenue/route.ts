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
        const { data: rows } = await supabaseAdmin
          .from('sumup_cache')
          .select('period, by_day, refreshed_at')
          .order('refreshed_at', { ascending: false })
        if (!rows?.length) return []

        // Pick the best single row: exact match > row whose period contains the range > most recent
        const best =
          rows.find((r) => r.period === `${from}_${to}`) ??
          rows.find((r) => {
            const [rFrom, rTo] = r.period.split('_')
            return rFrom <= from && rTo >= to
          }) ??
          rows[0]

        const byDay: { date: string; revenue: number }[] = (best.by_day ?? [])
          .filter((e: { date: string }) => e.date >= from && e.date <= to)
          .sort((a: { date: string }, b: { date: string }) => a.date.localeCompare(b.date))

        return byDay
      } catch {
        return []
      }
    })(),
  ])

  return NextResponse.json({ daily, top, sumupDaily })
}
