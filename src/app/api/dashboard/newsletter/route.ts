import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { setNewsletterActive } from '@/lib/supabase-admin'

export async function PATCH(req: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, active } = await req.json()
  await setNewsletterActive(id, active)
  return NextResponse.json({ ok: true })
}
