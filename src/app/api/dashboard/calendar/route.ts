// src/app/api/dashboard/calendar/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { hasDashboardAccess } from '@/lib/auth-role'

export async function GET(req: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!hasDashboardAccess(user.email))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = req.nextUrl
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  if (!from || !to) return NextResponse.json({ error: 'Missing from/to' }, { status: 400 })

  const { data, error } = await supabaseAdmin
    .from('visits')
    .select('id, profile_id, service, date, time, staff, status, final_price, price')
    .gte('date', from)
    .lte('date', to)
    .neq('status', 'cancelled')
    .order('date')
    .order('time')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Fetch profile names
  const profileIds = Array.from(new Set((data ?? []).map((v) => v.profile_id)))
  const [profilesRes, dogsRes] = await Promise.all([
    supabaseAdmin.from('profiles').select('id, nom').in('id', profileIds),
    supabaseAdmin
      .from('dogs')
      .select('owner_id, name')
      .in('owner_id', profileIds)
      .order('created_at', { ascending: true }),
  ])

  const profileMap = Object.fromEntries((profilesRes.data ?? []).map((p) => [p.id, p]))
  // First dog per owner
  const dogMap: Record<string, string> = {}
  for (const dog of dogsRes.data ?? []) {
    if (!dogMap[dog.owner_id]) dogMap[dog.owner_id] = dog.name
  }

  const { data: staffRows } = await supabaseAdmin.from('staff').select('name, color')
  const staffColorMap = Object.fromEntries((staffRows ?? []).map((s) => [s.name, s.color]))

  const visits = (data ?? []).map((v) => ({
    ...v,
    client_nom: profileMap[v.profile_id]?.nom ?? '—',
    nom_chien: dogMap[v.profile_id] ?? null,
    staff_color: v.staff ? (staffColorMap[v.staff] ?? '#4F6072') : '#4F6072',
  }))

  return NextResponse.json(visits)
}
