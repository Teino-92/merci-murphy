import { Resend } from 'resend'
import { z } from 'zod'
import type { User } from '@supabase/supabase-js'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { accountWelcomeHtml } from '@/lib/emails/account-welcome'

const resend = new Resend(process.env.RESEND_API_KEY)

// Shape stored in user_metadata.signup by signUp() until the email is confirmed
export const PendingSignupSchema = z.object({
  prenom: z.string().min(1).max(80),
  nom: z.string().min(1).max(80),
  telephone: z.string().max(30),
  newsletter_subscribed: z.boolean(),
  dog_name: z.string().min(1).max(60),
  dog_breed: z.string().max(80).nullable(),
  dog_age: z.string().max(30).nullable(),
  dog_poids: z.string().max(30).nullable(),
  dog_etat_poil: z.string().max(60).nullable(),
})

export type PendingSignup = z.infer<typeof PendingSignupSchema>

/**
 * Creates profile + first dog once the address is proven (called from
 * /auth/callback after a successful verification). Idempotent.
 */
export async function finalizeSignup(user: User): Promise<void> {
  if (!user.email_confirmed_at || !user.email) return

  const { data: existing } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle()
  if (existing) return

  const parsed = PendingSignupSchema.safeParse(user.user_metadata?.signup)
  if (!parsed.success) return
  const d = parsed.data

  const { error: profileError } = await supabaseAdmin.from('profiles').insert({
    id: user.id,
    nom: `${d.prenom} ${d.nom}`.trim(),
    telephone: d.telephone,
    newsletter_subscribed: d.newsletter_subscribed,
  })
  if (profileError) {
    // eslint-disable-next-line no-console
    console.error('[finalizeSignup] profile insert failed:', profileError)
    return
  }

  const { error: dogError } = await supabaseAdmin.from('dogs').insert({
    owner_id: user.id,
    name: d.dog_name,
    breed: d.dog_breed,
    age: d.dog_age,
    poids: d.dog_poids,
    etat_poil: d.dog_etat_poil,
  })
  if (dogError) {
    // eslint-disable-next-line no-console
    console.error('[finalizeSignup] dog insert failed:', dogError)
  }

  // Signup payload no longer needed in auth metadata
  await supabaseAdmin.auth.admin.updateUserById(user.id, { user_metadata: { signup: null } })

  if (d.newsletter_subscribed) {
    await Promise.resolve(
      supabaseAdmin
        .from('newsletter_subscribers')
        .upsert({ email: user.email, active: true }, { onConflict: 'email' })
    ).catch(() => {})
    if (process.env.RESEND_AUDIENCE_ID) {
      await resend.contacts
        .create({
          email: user.email,
          audienceId: process.env.RESEND_AUDIENCE_ID,
          unsubscribed: false,
        })
        .catch(() => {})
    }
  }

  const { error: emailError } = await resend.emails.send({
    from: `merci murphy® <${process.env.RESEND_NEWSLETTER_FROM ?? process.env.RESEND_AUTH_FROM}>`,
    to: user.email,
    subject: `Bienvenue chez merci murphy®, ${d.prenom}`.replace(/[\r\n]/g, ' '),
    html: accountWelcomeHtml(d.prenom, d.dog_name),
  })
  if (emailError) {
    // eslint-disable-next-line no-console
    console.error('[finalizeSignup] welcome email failed:', emailError)
  }
}
