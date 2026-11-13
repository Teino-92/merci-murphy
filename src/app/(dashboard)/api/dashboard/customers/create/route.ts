import { z } from 'zod'
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { createProfileWithAuth } from '@/lib/supabase-admin'
import { hasDashboardAccess } from '@/lib/auth-role'

const opt = (max: number) => z.string().max(max).optional()

const CreateCustomerSchema = z.object({
  email: z.string().trim().email().max(254),
  nom: z.string().trim().min(1).max(160),
  telephone: z.string().trim().min(1).max(30),
  nom_chien: z.string().trim().min(1).max(60),
  race_chien: opt(80),
  age_chien: opt(30),
  poids_chien: opt(30),
  etat_poil: opt(60),
  // Form may send '' when left empty
  grooming_duration: z.preprocess(
    (v) => (v === '' || v === null ? undefined : v),
    z.coerce.number().int().positive().max(600).optional()
  ),
  notes: opt(5000),
})

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!hasDashboardAccess(user.email))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const parsed = CreateCustomerSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Champs obligatoires manquants ou invalides' },
      { status: 400 }
    )
  }
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
  } = parsed.data

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
