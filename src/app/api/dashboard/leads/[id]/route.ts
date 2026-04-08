import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { updateLeadStatus } from '@/lib/supabase-admin'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { status } = await req.json()
  await updateLeadStatus(params.id, status)
  return NextResponse.json({ ok: true })
}
