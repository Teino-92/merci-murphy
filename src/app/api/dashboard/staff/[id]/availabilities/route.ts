import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getAvailabilities, upsertAvailability, deleteAvailability } from '@/lib/supabase-admin'

async function authed() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await authed()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const avails = await getAvailabilities(params.id)
  return NextResponse.json(avails)
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await authed()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { day_of_week, start_time, end_time } = await req.json()
  await upsertAvailability(params.id, day_of_week, start_time, end_time)
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const user = await authed()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await req.json()
  await deleteAvailability(id)
  return NextResponse.json({ ok: true })
}
