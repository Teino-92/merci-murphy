// Dit au modal d'avis si le visiteur connecté est un client confirmé.
// Appelé côté client uniquement, après le délai d'affichage — le layout
// marketing reste statique.
import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ isClient: false })

  const today = new Date().toLocaleDateString('fr-CA', { timeZone: 'Europe/Paris' })

  // Une visite passée confirmée est la preuve la plus forte.
  const { data: visit } = await supabaseAdmin
    .from('visits')
    .select('id')
    .eq('profile_id', user.id)
    .eq('status', 'confirmed')
    .lte('date', today)
    .limit(1)
    .maybeSingle()

  if (visit) return NextResponse.json({ isClient: true })

  // Sinon, une demande confirmée rattachée au compte ou à son email.
  // Two plain .eq() queries: never interpolate user data into a PostgREST .or() filter
  const { data: byUser } = await supabaseAdmin
    .from('leads')
    .select('id')
    .eq('status', 'confirmed')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle()
  if (byUser || !user.email) return NextResponse.json({ isClient: Boolean(byUser) })

  const { data: byEmail } = await supabaseAdmin
    .from('leads')
    .select('id')
    .eq('status', 'confirmed')
    .eq('email', user.email)
    .limit(1)
    .maybeSingle()

  return NextResponse.json({ isClient: Boolean(byEmail) })
}
