import { z } from 'zod'
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { updateProfile, deleteProfile } from '@/lib/supabase-admin'
import { hasDashboardAccess, isAdminEmail } from '@/lib/auth-role'

// Whitelist: id / created_at and unknown columns are rejected
const ProfileUpdateSchema = z
  .object({
    nom: z.string().trim().min(1).max(160),
    telephone: z.string().trim().max(30),
    notes: z.string().max(5000).nullable(),
    can_book: z.boolean(),
    admission_passed: z.boolean(),
    newsletter_subscribed: z.boolean(),
  })
  .partial()
  .strict()

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!hasDashboardAccess(user.email))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const parsed = ProfileUpdateSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
  await updateProfile(params.id, parsed.data)
  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isAdminEmail(user.email)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await deleteProfile(params.id)
  return NextResponse.json({ ok: true })
}
