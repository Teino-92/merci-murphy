import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { hasDashboardAccess } from '@/lib/auth-role'

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!hasDashboardAccess(user.email))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  // Get the client's auth email
  const { data: authUser, error } = await supabaseAdmin.auth.admin.getUserById(params.id)
  if (error || !authUser.user) {
    return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })
  }

  const email = authUser.user.email
  if (!email || email.endsWith('@mercimurphy.internal')) {
    return NextResponse.json({ error: "Pas d'email valide pour ce client" }, { status: 400 })
  }

  const { error: resetError } = await supabaseAdmin.auth.admin.generateLink({
    type: 'recovery',
    email,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mercimurphy.com'}/compte`,
    },
  })

  if (resetError) {
    return NextResponse.json({ error: resetError.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
