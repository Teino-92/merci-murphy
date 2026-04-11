import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getStaff, createStaff } from '@/lib/supabase-admin'
import { isAdminEmail } from '@/lib/auth-role'

async function requireAdmin() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user || !isAdminEmail(user.email)) return null
  return user
}

export async function GET() {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const staff = await getStaff()
  return NextResponse.json(staff)
}

export async function POST(req: NextRequest) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { name, role, color } = await req.json()
  if (!name || !role) return NextResponse.json({ error: 'name and role required' }, { status: 400 })
  const staff = await createStaff(name, role, color ?? '#4F6072')
  return NextResponse.json(staff, { status: 201 })
}
