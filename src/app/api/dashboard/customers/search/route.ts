import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { searchProfiles } from '@/lib/supabase-admin'
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

  const query = req.nextUrl.searchParams.get('q') ?? ''
  if (query.length < 2) return NextResponse.json([])

  const profiles = await searchProfiles(query)
  const profileIds = profiles.map((p) => p.id)

  if (profileIds.length === 0) return NextResponse.json([])

  // Fetch all dogs for matched profiles to show alongside results
  const { data: dogs } = await supabaseAdmin
    .from('dogs')
    .select('owner_id, name')
    .in('owner_id', profileIds)

  const dogsByOwner: Record<string, string[]> = {}
  for (const dog of dogs ?? []) {
    if (!dogsByOwner[dog.owner_id]) dogsByOwner[dog.owner_id] = []
    dogsByOwner[dog.owner_id].push(dog.name)
  }

  const results = profiles.map((p) => ({
    ...p,
    dog_names: dogsByOwner[p.id] ?? [],
  }))

  return NextResponse.json(results)
}
