import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { deleteVisit } from '@/lib/supabase-admin'
import { isAdminEmail } from '@/lib/auth-role'

export async function DELETE(req: NextRequest, { params }: { params: { visitId: string } }) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isAdminEmail(user.email)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await deleteVisit(params.visitId)
  return NextResponse.json({ ok: true })
}
