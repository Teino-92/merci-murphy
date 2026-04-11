import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { hasDashboardAccess } from '@/lib/auth-role'
import type { VisitsStats } from '@/app/(dashboard)/dashboard/dashboard-main'

export async function GET(req: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!hasDashboardAccess(user.email))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  let query = supabaseAdmin.from('visits').select('service, price, date').not('price', 'is', null)

  if (from) query = query.gte('date', from)
  if (to) query = query.lte('date', to)

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const rows = data ?? []

  // Aggregate by service
  const serviceMap = new Map<string, { revenue: number; count: number }>()
  let totalRevenue = 0
  let visitCount = 0

  for (const row of rows) {
    const price = Number(row.price ?? 0)
    totalRevenue += price
    visitCount++
    const existing = serviceMap.get(row.service) ?? { revenue: 0, count: 0 }
    serviceMap.set(row.service, {
      revenue: existing.revenue + price,
      count: existing.count + 1,
    })
  }

  const byService = Array.from(serviceMap.entries())
    .map(([service, { revenue, count }]) => ({ service, revenue, count }))
    .sort((a, b) => b.revenue - a.revenue)

  const result: VisitsStats = {
    totalRevenue,
    visitCount,
    avgTicket: visitCount > 0 ? totalRevenue / visitCount : 0,
    byService,
  }

  return NextResponse.json(result)
}
