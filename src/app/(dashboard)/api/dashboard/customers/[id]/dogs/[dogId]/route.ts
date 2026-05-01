import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { hasDashboardAccess } from '@/lib/auth-role'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; dogId: string } }
) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!hasDashboardAccess(user.email))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { error } = await supabaseAdmin
    .from('dogs')
    .update({
      name: body.name,
      breed: body.breed ?? null,
      age: body.age ?? null,
      poids: body.poids ?? null,
      etat_poil: body.etat_poil ?? null,
      grooming_duration: body.grooming_duration ? Number(body.grooming_duration) : null,
      numero_puce: body.numero_puce ?? null,
      notes: body.notes ?? null,
    })
    .eq('id', params.dogId)
    .eq('owner_id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string; dogId: string } }
) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!hasDashboardAccess(user.email))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { error } = await supabaseAdmin
    .from('dogs')
    .delete()
    .eq('id', params.dogId)
    .eq('owner_id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
