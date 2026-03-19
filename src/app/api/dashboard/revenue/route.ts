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
        const { data } = await supabaseAdmin
          .from('sumup_cache')
          .select('by_day')
          .eq('period', `${from}_${to}`)
          .maybeSingle()
        return data?.by_day ?? []
      } catch {
        return []
      }
    })(),
  ])

  return NextResponse.json({ daily, top, sumupDaily })
}
