import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { updateStaff } from '@/lib/supabase-admin'

async function authed() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await authed()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const updates = await req.json()
  await updateStaff(params.id, updates)
  return NextResponse.json({ ok: true })
}
