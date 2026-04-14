'use server'

import { z } from 'zod'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
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
  can_book: boolean
  admission_passed: boolean
  newsletter_subscribed: boolean
}

// ─── Sign up ─────────────────────────────────────────────────────────────────

const SignUpSchema = z.object({
  email: z
    .string()
    .email('Email invalide')
    .regex(/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/, 'Email invalide'),
  password: z
    .string()
    .min(8, 'Le mot de passe doit faire au moins 8 caractères')
    .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre'),
  prenom: z.string().min(1),
  nom: z.string().min(1),
  telephone: z.string().regex(/^\+\d+\s[\d\s]{6,}$/, 'Numéro de téléphone invalide'),
  newsletter_subscribed: z.boolean().optional(),
  // Dog fields
  dog_name: z.string().min(1, 'Le prénom du chien est requis'),
  dog_breed: z.string().optional(),
  dog_age: z.string().optional(),
  dog_poids: z.string().optional(),
  dog_etat_poil: z.string().optional(),
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

  const userId = authData.user.id
  const newsletterSubscribed = parsed.data.newsletter_subscribed ?? false
  const fullNom = `${parsed.data.prenom} ${parsed.data.nom}`.trim()

  const { error: profileError } = await supabaseAdmin.from('profiles').insert({
    id: userId,
    nom: fullNom,
    telephone: parsed.data.telephone,
    newsletter_subscribed: newsletterSubscribed,
  })

  if (profileError) {
    await supabaseAdmin.auth.admin.deleteUser(userId)
    return { success: false, error: `Erreur profil: ${profileError.message}` }
  }

  const { error: dogError } = await supabaseAdmin.from('dogs').insert({
    owner_id: userId,
    name: parsed.data.dog_name,
    breed: parsed.data.dog_breed ?? null,
    age: parsed.data.dog_age ?? null,
    poids: parsed.data.dog_poids ?? null,
    etat_poil: parsed.data.dog_etat_poil ?? null,
  })

  if (dogError) {
    await supabaseAdmin.from('profiles').delete().eq('id', userId)
    await supabaseAdmin.auth.admin.deleteUser(userId)
    return { success: false, error: `Erreur chien: ${dogError.message}` }
  }

  // Subscribe to newsletter if opted in
  if (newsletterSubscribed) {
    await Promise.resolve(
      supabaseAdmin
        .from('newsletter_subscribers')
        .upsert({ email: parsed.data.email, active: true }, { onConflict: 'email' })
    ).catch(() => {})
  }

  // Welcome email
  const prenom = parsed.data.prenom
  const { error: emailError } = await resend.emails.send({
    from: `merci murphy® <${process.env.RESEND_NEWSLETTER_FROM ?? process.env.RESEND_AUTH_FROM}>`,
    to: parsed.data.email,
    subject: `Bienvenue chez merci murphy®, ${prenom} 🐾`,
    html: accountWelcomeHtml(prenom, parsed.data.dog_name),
  })

  if (emailError) {
    // eslint-disable-next-line no-console
    console.error('[signUp] welcome email failed:', emailError)
  }

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
  revalidatePath('/', 'layout')
  redirect('/')
}

// ─── Get current user profile ────────────────────────────────────────────────

export async function getProfile(): Promise<Profile | null> {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  // Use admin client to bypass RLS — user identity already verified above
  const { data } = await supabaseAdmin.from('profiles').select('*').eq('id', user.id).single()
  if (!data) return null

  // Reconcile newsletter_subscribed with the newsletter_subscribers table —
  // the user may have subscribed via the homepage form which only writes to that table.
  if (!data.newsletter_subscribed) {
    const { data: nlRow } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('active')
      .eq('email', user.email!)
      .single()
    if (nlRow?.active) {
      data.newsletter_subscribed = true
      // Sync back so future reads are consistent
      await supabaseAdmin.from('profiles').update({ newsletter_subscribed: true }).eq('id', user.id)
    }
  }

  return data
}

// ─── Update profile ───────────────────────────────────────────────────────────

const UpdateProfileSchema = z.object({
  nom: z.string().min(2),
  telephone: z.string().min(8),
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

// ─── Update newsletter subscription ──────────────────────────────────────────

export async function updateNewsletter(subscribed: boolean) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Non authentifié.' }

  const { error } = await supabase
    .from('profiles')
    .update({ newsletter_subscribed: subscribed })
    .eq('id', user.id)

  if (error) return { success: false, error: 'Erreur lors de la mise à jour.' }

  // Sync with newsletter_subscribers table
  if (subscribed) {
    await Promise.resolve(
      supabaseAdmin
        .from('newsletter_subscribers')
        .upsert({ email: user.email, active: true }, { onConflict: 'email' })
    ).catch(() => {})
  } else {
    await Promise.resolve(
      supabaseAdmin
        .from('newsletter_subscribers')
        .update({ active: false })
        .eq('email', user.email!)
    ).catch(() => {})
  }

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
  grooming_duration: number | null
  numero_puce: string | null
  notes: string | null
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

  const { data } = await supabaseAdmin
    .from('dogs')
    .select(
      'id, owner_id, name, breed, age, poids, etat_poil, photo_url, grooming_duration, numero_puce, notes'
    )
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

  const { data } = await supabaseAdmin
    .from('visits')
    .select('id, service, date, dog_id')
    .eq('profile_id', user.id)
    .order('date', { ascending: false })

  return data ?? []
}
