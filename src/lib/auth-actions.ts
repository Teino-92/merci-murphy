'use server'

import { z } from 'zod'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { resend } from '@/lib/resend'
import { accountConfirmHtml } from '@/lib/emails/account-confirm'
import type { PendingSignup } from '@/lib/signup-finalize'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mercimurphy.com'

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
  prenom: z.string().trim().min(1).max(80),
  nom: z.string().trim().min(1).max(80),
  telephone: z
    .string()
    .max(30)
    .regex(/^\+\d+\s[\d\s]{6,}$/, 'Numéro de téléphone invalide'),
  newsletter_subscribed: z.boolean().optional(),
  // Dog fields
  dog_name: z.string().trim().min(1, 'Le prénom du chien est requis').max(60),
  dog_breed: z.string().max(80).optional(),
  dog_age: z.string().max(30).optional(),
  dog_poids: z.string().max(30).optional(),
  dog_etat_poil: z.string().max(60).optional(),
})

export type SignUpData = z.infer<typeof SignUpSchema>

export async function signUp(data: SignUpData) {
  const parsed = SignUpSchema.safeParse(data)
  if (!parsed.success)
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Données invalides.' }

  // The account stays unconfirmed until the address owner clicks the link.
  // Profile + dog are created in /auth/callback (finalizeSignup), never before.
  const pending: PendingSignup = {
    prenom: parsed.data.prenom,
    nom: parsed.data.nom,
    telephone: parsed.data.telephone,
    newsletter_subscribed: parsed.data.newsletter_subscribed ?? false,
    dog_name: parsed.data.dog_name,
    dog_breed: parsed.data.dog_breed ?? null,
    dog_age: parsed.data.dog_age ?? null,
    dog_poids: parsed.data.dog_poids ?? null,
    dog_etat_poil: parsed.data.dog_etat_poil ?? null,
  }

  const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
    type: 'signup',
    email: parsed.data.email,
    password: parsed.data.password,
    options: { data: { signup: pending } },
  })

  if (linkError || !linkData.properties?.hashed_token) {
    const alreadyExists =
      linkError?.message.includes('already registered') ||
      linkError?.message.includes('already been registered')
    if (!alreadyExists) {
      // eslint-disable-next-line no-console
      console.error('[signUp] generateLink failed:', linkError)
      return { success: false, error: 'Erreur lors de la création du compte.' }
    }
    // Same response as a fresh signup: don't reveal which addresses have an account
    return { success: true }
  }

  const confirmUrl = new URL('/auth/callback', SITE_URL)
  confirmUrl.searchParams.set('token_hash', linkData.properties.hashed_token)
  confirmUrl.searchParams.set('type', 'signup')
  confirmUrl.searchParams.set('next', '/compte')

  const { error: emailError } = await resend.emails.send({
    from: `merci murphy® <${process.env.RESEND_AUTH_FROM}>`,
    to: parsed.data.email,
    subject: 'Confirmez votre adresse email — merci murphy®',
    html: accountConfirmHtml(parsed.data.prenom, confirmUrl.toString()),
  })

  if (emailError) {
    // eslint-disable-next-line no-console
    console.error('[signUp] confirmation email failed:', emailError)
    return { success: false, error: "Impossible d'envoyer l'email de confirmation." }
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
  // Explicit columns: internal fields (notes) must never reach the browser
  const { data } = await supabaseAdmin
    .from('profiles')
    .select('id, nom, telephone, can_book, admission_passed, newsletter_subscribed')
    .eq('id', user.id)
    .single()
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
    if (process.env.RESEND_AUDIENCE_ID) {
      await resend.contacts
        .create({
          email: user.email!,
          audienceId: process.env.RESEND_AUDIENCE_ID,
          unsubscribed: false,
        })
        .catch(() => {})
    }
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
