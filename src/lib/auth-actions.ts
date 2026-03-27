'use server'

import { z } from 'zod'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { Resend } from 'resend'
import { accountWelcomeHtml } from '@/lib/emails/account-welcome'

const resend = new Resend(process.env.RESEND_API_KEY)

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Profile {
  id: string
  nom: string
  telephone: string
  nom_chien: string | null
  race_chien: string | null
  age_chien: string | null
  poids_chien: string | null
  etat_poil: string | null
  can_book: boolean
}

// ─── Sign up ─────────────────────────────────────────────────────────────────

const SignUpSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8, 'Le mot de passe doit faire au moins 8 caractères')
    .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre'),
  nom: z.string().min(2),
  telephone: z.string().min(8),
  nom_chien: z.string().optional(),
  race_chien: z.string().optional(),
  age_chien: z.string().optional(),
  poids_chien: z.string().optional(),
  etat_poil: z.string().optional(),
})

export type SignUpData = z.infer<typeof SignUpSchema>

export async function signUp(data: SignUpData) {
  const parsed = SignUpSchema.safeParse(data)
  if (!parsed.success)
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Données invalides.' }

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
  })

  if (authError || !authData.user) {
    if (
      authError?.message.includes('already registered') ||
      authError?.message.includes('already been registered')
    ) {
      return { success: false, error: 'Cet email est déjà utilisé. Veuillez vous connecter.' }
    }
    return { success: false, error: 'Erreur lors de la création du compte.' }
  }

  const { error: profileError } = await supabaseAdmin.from('profiles').insert({
    id: authData.user.id,
    nom: parsed.data.nom,
    telephone: parsed.data.telephone,
    nom_chien: parsed.data.nom_chien ?? null,
    race_chien: parsed.data.race_chien ?? null,
    age_chien: parsed.data.age_chien ?? null,
    poids_chien: parsed.data.poids_chien ?? null,
    etat_poil: parsed.data.etat_poil ?? null,
  })

  if (profileError) {
    console.error('Profile insert error:', profileError)
    return { success: false, error: `Erreur profil: ${profileError.message}` }
  }

  // Insert dog row if dog info was provided
  if (parsed.data.nom_chien) {
    await supabaseAdmin.from('dogs').insert({
      owner_id: authData.user.id,
      name: parsed.data.nom_chien,
      breed: parsed.data.race_chien ?? null,
      age: parsed.data.age_chien ?? null,
      poids: parsed.data.poids_chien ?? null,
      etat_poil: parsed.data.etat_poil ?? null,
    })
  }

  // Welcome email
  const prenom = parsed.data.nom.split(' ')[0] ?? parsed.data.nom
  await resend.emails
    .send({
      from: `merci murphy® <${process.env.RESEND_NEWSLETTER_FROM}>`,
      to: parsed.data.email,
      subject: `Bienvenue chez merci murphy®, ${prenom} 🐾`,
      html: accountWelcomeHtml(prenom, parsed.data.nom_chien),
    })
    .catch(() => {})

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
  age_chien: z.string().optional(),
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

// ─── Dog types ────────────────────────────────────────────────────────────────

export interface Dog {
  id: string
  owner_id: string
  name: string
  breed: string | null
  age: string | null
  poids: string | null
  etat_poil: string | null
  photo_url: string | null
  can_book_online: boolean
}

// ─── Visit types ──────────────────────────────────────────────────────────────

export interface Visit {
  id: string
  service: string
  date: string
  dog_id: string | null
}

// ─── Get dogs for current user ────────────────────────────────────────────────

export async function getDogs(): Promise<Dog[]> {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('dogs')
    .select('id, owner_id, name, breed, age, poids, etat_poil, photo_url, can_book_online')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: true })

  return data ?? []
}

// ─── Get visits for current user ─────────────────────────────────────────────

export async function getVisits(): Promise<Visit[]> {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('visits')
    .select('id, service, date, dog_id')
    .eq('profile_id', user.id)
    .order('date', { ascending: false })

  return data ?? []
}
