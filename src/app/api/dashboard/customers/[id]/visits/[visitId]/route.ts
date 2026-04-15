import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { deleteVisit, supabaseAdmin } from '@/lib/supabase-admin'
import { hasDashboardAccess } from '@/lib/auth-role'

export async function PATCH(req: NextRequest, { params }: { params: { visitId: string } }) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!hasDashboardAccess(user.email))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { price, visit_notes } = body

  const update: Record<string, unknown> = {}

  if (price != null) {
    if (isNaN(Number(price)) || Number(price) <= 0) {
      return NextResponse.json({ error: 'price invalide' }, { status: 400 })
    }
    update.price = Number(price)
  }

  if (visit_notes !== undefined) {
    update.visit_notes = visit_notes || null
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'Aucun champ à mettre à jour' }, { status: 400 })
  }

  const { error } = await supabaseAdmin.from('visits').update(update).eq('id', params.visitId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest, { params }: { params: { visitId: string } }) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!hasDashboardAccess(user.email))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await deleteVisit(params.visitId)
  return NextResponse.json({ ok: true })
}
