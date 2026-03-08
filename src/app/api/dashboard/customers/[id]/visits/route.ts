import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { addVisit } from '@/lib/supabase-admin'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { service, date, notes, staff } = await req.json()
  await addVisit({
    profile_id: params.id,
    service,
    date,
    notes: notes || null,
    staff: staff || null,
  })
  return NextResponse.json({ ok: true })
}
