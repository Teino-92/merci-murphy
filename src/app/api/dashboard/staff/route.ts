import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getStaff, createStaff } from '@/lib/supabase-admin'

async function authed() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function GET() {
  const user = await authed()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const staff = await getStaff()
  return NextResponse.json(staff)
}

export async function POST(req: NextRequest) {
  const user = await authed()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { name, role, color } = await req.json()
  if (!name || !role) return NextResponse.json({ error: 'name and role required' }, { status: 400 })
  const staff = await createStaff(name, role, color ?? '#4F6072')
  return NextResponse.json(staff, { status: 201 })
}
