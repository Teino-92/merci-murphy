import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { updateProfileNotes } from '@/lib/supabase-admin'
import { hasDashboardAccess } from '@/lib/auth-role'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!hasDashboardAccess(user.email))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { notes } = await req.json()
  await updateProfileNotes(params.id, notes)
  return NextResponse.json({ ok: true })
}
