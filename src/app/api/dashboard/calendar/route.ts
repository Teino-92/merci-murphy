// src/app/api/dashboard/calendar/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(req: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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
  const { data: profiles } = await supabaseAdmin
    .from('profiles')
    .select('id, nom, nom_chien')
    .in('id', profileIds)

  const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]))

  const visits = (data ?? []).map((v) => ({
    ...v,
    client_nom: profileMap[v.profile_id]?.nom ?? '—',
    nom_chien: profileMap[v.profile_id]?.nom_chien ?? null,
  }))

  return NextResponse.json(visits)
}
