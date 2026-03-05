'use server'

import { z } from 'zod'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Profile {
  id: string
  nom: string
  telephone: string
  nom_chien: string | null
  race_chien: string | null
  poids_chien: string | null
  etat_poil: string | null
  can_book: boolean
}

// ─── Sign up ─────────────────────────────────────────────────────────────────

const SignUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Le mot de passe doit faire au moins 8 caractères'),
  nom: z.string().min(2),
  telephone: z.string().min(8),
  nom_chien: z.string().optional(),
  race_chien: z.string().optional(),
  poids_chien: z.string().optional(),
  etat_poil: z.string().optional(),
})

export type SignUpData = z.infer<typeof SignUpSchema>

export async function signUp(data: SignUpData) {
  const parsed = SignUpSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: 'Données invalides.' }

  const supabase = await createSupabaseServerClient()

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (authError || !authData.user) {
    if (authError?.message.includes('already registered')) {
      return { success: false, error: 'Cet email est déjà utilisé. Veuillez vous connecter.' }
    }
    return { success: false, error: 'Erreur lors de la création du compte.' }
  }

  const { error: profileError } = await supabase.from('profiles').insert({
    id: authData.user.id,
    nom: parsed.data.nom,
    telephone: parsed.data.telephone,
    nom_chien: parsed.data.nom_chien ?? null,
    race_chien: parsed.data.race_chien ?? null,
    poids_chien: parsed.data.poids_chien ?? null,
    etat_poil: parsed.data.etat_poil ?? null,
  })

  if (profileError) return { success: false, error: 'Erreur lors de la création du profil.' }

  return { success: true }
}

// ─── Sign in ─────────────────────────────────────────────────────────────────

const SignInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export type SignInData = z.infer<typeof SignInSchema>

export async function signIn(data: SignInData) {
  const parsed = SignInSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: 'Données invalides.' }

  const supabase = await createSupabaseServerClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error) return { success: false, error: 'Email ou mot de passe incorrect.' }

  return { success: true }
}

// ─── Sign out ─────────────────────────────────────────────────────────────────

export async function signOut() {
  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut()
  redirect('/')
}

// ─── Get current user profile ────────────────────────────────────────────────

export async function getProfile(): Promise<Profile | null> {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  return data ?? null
}

// ─── Update profile ───────────────────────────────────────────────────────────

const UpdateProfileSchema = z.object({
  nom: z.string().min(2),
  telephone: z.string().min(8),
  nom_chien: z.string().optional(),
  race_chien: z.string().optional(),
  poids_chien: z.string().optional(),
  etat_poil: z.string().optional(),
})

export async function updateProfile(data: z.infer<typeof UpdateProfileSchema>) {
  const parsed = UpdateProfileSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: 'Données invalides.' }

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Non authentifié.' }

  const { error } = await supabase.from('profiles').update(parsed.data).eq('id', user.id)

  if (error) return { success: false, error: 'Erreur lors de la mise à jour.' }
  return { success: true }
}
