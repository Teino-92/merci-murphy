import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getTimeOff, addTimeOff, deleteTimeOff } from '@/lib/supabase-admin'

async function authed() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await authed()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = req.nextUrl
  const from = searchParams.get('from') ?? new Date().toISOString().slice(0, 10)
  const to = searchParams.get('to') ?? from
  const timeOff = await getTimeOff(params.id, from, to)
  return NextResponse.json(timeOff)
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await authed()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { date, note } = await req.json()
  if (!date) return NextResponse.json({ error: 'date required' }, { status: 400 })
  await addTimeOff(params.id, date, note)
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const user = await authed()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await req.json()
  await deleteTimeOff(id)
  return NextResponse.json({ ok: true })
}
