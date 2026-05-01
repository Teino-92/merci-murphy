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
    .select('id, owner_id, name, grooming_duration')
    .in('owner_id', profileIds)

  const dogsByOwner: Record<
    string,
    { id: string; name: string; grooming_duration: number | null }[]
  > = {}
  for (const dog of dogs ?? []) {
    if (!dogsByOwner[dog.owner_id]) dogsByOwner[dog.owner_id] = []
    dogsByOwner[dog.owner_id].push({
      id: dog.id,
      name: dog.name,
      grooming_duration: dog.grooming_duration,
    })
  }

  const results = profiles.map((p) => ({
    ...p,
    dog_names: (dogsByOwner[p.id] ?? []).map((d) => d.name),
    dogs: dogsByOwner[p.id] ?? [],
  }))

  return NextResponse.json(results)
}
