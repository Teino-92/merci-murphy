import { z } from 'zod'
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { updateStaff } from '@/lib/supabase-admin'
import { isAdminEmail } from '@/lib/auth-role'

async function requireAdmin() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user || !isAdminEmail(user.email)) return null
  return user
}

// Only these columns may be changed from the dashboard
const StaffUpdateSchema = z
  .object({
    name: z.string().trim().min(1).max(80),
    role: z.string().trim().max(80),
    color: z.string().regex(/^#[0-9a-fA-F]{3,8}$/),
    active: z.boolean(),
  })
  .partial()
  .strict()

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const parsed = StaffUpdateSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
  await updateStaff(params.id, parsed.data)
  return NextResponse.json({ ok: true })
}
