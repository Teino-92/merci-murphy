import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
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

  const [daily, top] = await Promise.all([
    getDailyRevenue(from ?? undefined, to ?? undefined),
    getTopProducts(from ?? undefined, to ?? undefined),
  ])

  return NextResponse.json({ daily, top })
}
