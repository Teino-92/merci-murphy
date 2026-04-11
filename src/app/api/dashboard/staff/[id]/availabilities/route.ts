import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getAvailabilities, upsertAvailability, deleteAvailability } from '@/lib/supabase-admin'
import { hasDashboardAccess } from '@/lib/auth-role'

async function requireAdmin() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user || !hasDashboardAccess(user.email)) return null
  return user
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const avails = await getAvailabilities(params.id)
  return NextResponse.json(avails)
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { day_of_week, start_time, end_time } = await req.json()
  await upsertAvailability(params.id, day_of_week, start_time, end_time)
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await req.json()
  await deleteAvailability(id)
  return NextResponse.json({ ok: true })
}
