import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { createProfileWithAuth } from '@/lib/supabase-admin'
import { isAdminEmail } from '@/lib/auth-role'

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isAdminEmail(user.email)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const {
    email,
    nom,
    telephone,
    nom_chien,
    race_chien,
    age_chien,
    poids_chien,
    etat_poil,
    grooming_duration,
    notes,
  } = body

  if (!email || !nom || !telephone || !nom_chien) {
    return NextResponse.json({ error: 'Champs obligatoires manquants' }, { status: 400 })
  }

  try {
    const profile = await createProfileWithAuth({
      email,
      nom,
      telephone,
      nom_chien,
      race_chien: race_chien || undefined,
      age_chien: age_chien || undefined,
      poids_chien: poids_chien || undefined,
      etat_poil: etat_poil || undefined,
      grooming_duration: grooming_duration ? Number(grooming_duration) : null,
      notes: notes || null,
    })
    return NextResponse.json(profile)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
