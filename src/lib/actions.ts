'use server'

import { z } from 'zod'
import { Resend } from 'resend'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { newsletterWelcomeHtml } from '@/lib/emails/newsletter-welcome'
import { SERVICE_LABELS } from '@/lib/dog-constants'
import { esc } from '@/lib/emails/base'
import { TYPE_COMMERCE_LABELS } from '@/lib/revendeur-constants'
import { sendPushToStaff } from '@/lib/push'

const resend = new Resend(process.env.RESEND_API_KEY)

/** Where internal lead notifications land. */
const INTERNAL_EMAIL = process.env.RESEND_INTERNAL_EMAIL ?? 'bonjour@mercimurphy.com'

/**
 * Sends an internal notification without ever breaking the caller: a lead that
 * is already stored must not fail because Resend is down or misconfigured.
 * Failures are logged rather than swallowed — a silent catch here hid a missing
 * sender address for weeks.
 */
async function notifyInternal(subject: string, html: string) {
  const from = process.env.RESEND_AUTH_FROM
  if (!from) {
    // eslint-disable-next-line no-console
    console.error('[mail] RESEND_AUTH_FROM missing, internal notification skipped:', subject)
    return
  }

  const { error } = await resend.emails.send({
    from: `merci murphy® <${from}>`,
    to: INTERNAL_EMAIL,
    subject,
    html,
  })

  if (error) {
    // eslint-disable-next-line no-console
    console.error('[mail] internal notification failed:', subject, error)
  }
}

// ─── Anti-spam ───────────────────────────────────────────────────────────────

/** Minimum time a human needs to fill a multi-field form. Faster means a script. */
const MIN_FILL_MS = 3000
/** Single-field forms (newsletter) are legitimately faster to submit. */
const MIN_FILL_MS_SHORT = 1200

const AntiSpamSchema = z.object({
  website: z.string().optional(),
  elapsedMs: z.number().optional(),
})

export type AntiSpamInput = z.infer<typeof AntiSpamSchema>

/**
 * Returns true when the submission looks automated: the honeypot field was
 * filled, or the form was submitted faster than a human could type it.
 */
function isBotSubmission(input: unknown, minFillMs = MIN_FILL_MS) {
  const parsed = AntiSpamSchema.safeParse(input)
  if (!parsed.success) return true
  const { website, elapsedMs } = parsed.data
  if (website && website.trim().length > 0) return true
  if (typeof elapsedMs !== 'number' || elapsedMs < minFillMs) return true
  return false
}

/**
 * Rejects bot-generated names like "cDPshepRWwtNLPMGtc" or "iDHHbdsMihyCGAXov".
 * Only applies to single words of 12+ characters — real names that long are
 * virtually always multi-word ("Anne-Sophie de la Rochefoucauld").
 */
function looksLikeGibberish(value: string) {
  const trimmed = value.trim()
  if (trimmed.length < 12) return false
  if (/[\s'-]/.test(trimmed)) return false
  if (!/^[A-Za-z]+$/.test(trimmed)) return false

  // Random case flips: real names capitalise the first letter, at most one
  // internal cap (McDonald, DiCaprio). Bot output flips case constantly.
  const caseFlips = trimmed
    .slice(1)
    .split('')
    .filter((c, i, a) => {
      const prev = i === 0 ? trimmed[0] : a[i - 1]
      return (c === c.toUpperCase()) !== (prev === prev.toUpperCase())
    }).length
  if (caseFlips >= 4) return true

  const vowels = (trimmed.match(/[aeiouy]/gi) ?? []).length
  return vowels / trimmed.length < 0.25
}

// ─── Lead (reservation + contact) ───────────────────────────────────────────

const LeadSchema = z.object({
  nom: z
    .string()
    .min(2)
    .max(80)
    .refine((v) => !looksLikeGibberish(v), 'Nom invalide.'),
  email: z.string().email().max(120),
  telephone: z
    .string()
    .min(8)
    .max(25)
    .regex(/^[+()\d\s.-]+$/, 'Téléphone invalide.'),
  service: z.enum([
    'toilettage',
    'bains',
    'balneo',
    'massage',
    'creche',
    'education',
    'osteo',
    'autre',
  ]),
  nom_chien: z.string().max(60).optional(),
  race_chien: z.string().max(60).optional(),
  poids_chien: z.string().max(30).optional(),
  etat_poil: z.string().max(60).optional(),
  message: z.string().max(3000).optional(),
  source: z.enum(['reservation', 'contact']),
})

export type LeadFormData = z.infer<typeof LeadSchema>

export async function submitLead(data: LeadFormData & Partial<AntiSpamInput>) {
  // Silent drop: returning an error would let bots iterate until they pass.
  if (isBotSubmission({ website: data.website, elapsedMs: data.elapsedMs })) {
    return { success: true }
  }

  const parsed = LeadSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: 'Données invalides.' }

  const { data: inserted, error } = await supabaseAdmin
    .from('leads')
    .insert([parsed.data])
    .select('id')
    .single()
  if (error) return { success: false, error: 'Une erreur est survenue. Veuillez réessayer.' }

  await sendPushToStaff('new-lead', {
    nom: parsed.data.nom,
    service: SERVICE_LABELS[parsed.data.service] ?? parsed.data.service,
    leadId: inserted?.id,
  })

  // Notification interne via Resend
  const d = parsed.data
  const serviceLabel = SERVICE_LABELS[d.service] ?? d.service
  const dogRows = [
    d.nom_chien &&
      `<tr><td style="padding:4px 0;color:#888;font-size:14px;">Nom du chien</td><td style="padding:4px 0 4px 16px;font-size:14px;color:#1D164E;font-weight:600;">${esc(d.nom_chien)}</td></tr>`,
    d.race_chien &&
      `<tr><td style="padding:4px 0;color:#888;font-size:14px;">Race</td><td style="padding:4px 0 4px 16px;font-size:14px;color:#1D164E;">${esc(d.race_chien)}</td></tr>`,
    d.poids_chien &&
      `<tr><td style="padding:4px 0;color:#888;font-size:14px;">Poids</td><td style="padding:4px 0 4px 16px;font-size:14px;color:#1D164E;">${esc(d.poids_chien)}</td></tr>`,
    d.etat_poil &&
      `<tr><td style="padding:4px 0;color:#888;font-size:14px;">Pelage</td><td style="padding:4px 0 4px 16px;font-size:14px;color:#1D164E;">${esc(d.etat_poil)}</td></tr>`,
  ]
    .filter(Boolean)
    .join('')

  const internalHtml = `<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f5f0eb;font-family:Inter,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0">
<tr><td align="center" style="padding:48px 16px;">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;">
<tr><td style="padding:40px 48px;background:#1D164E;text-align:center;">
  <p style="margin:0;color:#f5f0eb;font-size:22px;font-weight:600;letter-spacing:0.02em;">merci murphy®</p>
</td></tr>
<tr><td style="padding:40px 48px;">
  <p style="margin:0 0 8px;font-size:18px;font-weight:600;color:#1D164E;">Nouvelle demande de rappel</p>
  <p style="margin:0 0 32px;font-size:14px;color:#888;">Service demandé : <strong style="color:#1D164E;">${esc(serviceLabel)}</strong></p>
  <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;background:#f5f0eb;border-radius:12px;padding:20px 24px;">
    <tr><td>
      <p style="margin:0 0 12px;font-size:11px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:0.08em;">Client</p>
      <table cellpadding="0" cellspacing="0">
        <tr><td style="padding:4px 0;color:#888;font-size:14px;">Nom</td><td style="padding:4px 0 4px 16px;font-size:14px;color:#1D164E;font-weight:600;">${esc(d.nom)}</td></tr>
        <tr><td style="padding:4px 0;color:#888;font-size:14px;">Email</td><td style="padding:4px 0 4px 16px;font-size:14px;color:#1D164E;"><a href="mailto:${esc(d.email)}" style="color:#B85C38;">${esc(d.email)}</a></td></tr>
        <tr><td style="padding:4px 0;color:#888;font-size:14px;">Téléphone</td><td style="padding:4px 0 4px 16px;font-size:14px;color:#1D164E;"><a href="tel:${esc(d.telephone)}" style="color:#B85C38;">${esc(d.telephone)}</a></td></tr>
      </table>
    </td></tr>
  </table>
  ${
    dogRows
      ? `<table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;background:#f5f0eb;border-radius:12px;padding:20px 24px;">
    <tr><td>
      <p style="margin:0 0 12px;font-size:11px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:0.08em;">Chien</p>
      <table cellpadding="0" cellspacing="0">${dogRows}</table>
    </td></tr>
  </table>`
      : ''
  }
  ${
    d.message
      ? `<table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;background:#f5f0eb;border-radius:12px;padding:20px 24px;">
    <tr><td>
      <p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:0.08em;">Message</p>
      <p style="margin:0;font-size:14px;color:#1D164E;line-height:1.6;">${esc(d.message)}</p>
    </td></tr>
  </table>`
      : ''
  }
  <p style="margin:0;font-size:14px;color:#888;">Ce client attend d'être rappelé·e pour confirmer son rendez-vous.</p>
</td></tr>
<tr><td style="padding:24px 48px;background:#f5f0eb;text-align:center;">
  <p style="margin:0;font-size:12px;color:#888;">merci murphy® · 18 rue Victor Massé, 75009 Paris · bonjour@mercimurphy.com</p>
</td></tr>
</table></td></tr></table>
</body></html>`

  await notifyInternal(
    `🐾 Nouvelle demande — ${d.nom}${d.nom_chien ? ` & ${d.nom_chien}` : ''} (${serviceLabel})`,
    internalHtml
  )

  return { success: true }
}

// ─── Newsletter ──────────────────────────────────────────────────────────────

const NewsletterSchema = z.object({
  email: z.string().email(),
})

export async function subscribeNewsletter(data: { email: string } & Partial<AntiSpamInput>) {
  if (isBotSubmission({ website: data.website, elapsedMs: data.elapsedMs }, MIN_FILL_MS_SHORT)) {
    return { success: true }
  }

  const parsed = NewsletterSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: 'Email invalide.' }

  const { error } = await supabaseAdmin
    .from('newsletter_subscribers')
    .upsert([{ email: parsed.data.email, active: true }], { onConflict: 'email' })

  if (error) return { success: false, error: 'Une erreur est survenue. Veuillez réessayer.' }

  // Add to Resend Audience
  if (process.env.RESEND_AUDIENCE_ID) {
    await resend.contacts
      .create({
        email: parsed.data.email,
        audienceId: process.env.RESEND_AUDIENCE_ID,
        unsubscribed: false,
      })
      .catch(() => {})
  }

  // Welcome email via Resend
  await resend.emails
    .send({
      from: `merci murphy® <${process.env.RESEND_NEWSLETTER_FROM}>`,
      to: parsed.data.email,
      subject: 'Bienvenue dans la communauté merci murphy®',
      html: newsletterWelcomeHtml(),
    })
    .catch(() => {})

  return { success: true }
}

// ─── Lead revendeur (B2B) ────────────────────────────────────────────────────

const RevendeurLeadSchema = z.object({
  nom: z
    .string()
    .min(2)
    .max(80)
    .refine((v) => !looksLikeGibberish(v), 'Nom invalide.'),
  entreprise: z
    .string()
    .min(2)
    .max(120)
    .refine((v) => !looksLikeGibberish(v), 'Nom d’enseigne invalide.'),
  email: z.string().email().max(120),
  telephone: z
    .string()
    .min(8)
    .max(25)
    .regex(/^[+()\d\s.-]+$/, 'Téléphone invalide.'),
  ville: z.string().min(2).max(80),
  type_commerce: z.enum([
    'boutique',
    'concept-store',
    'toiletteur',
    'animalerie',
    'ecommerce',
    'autre',
  ]),
  // Self-declared, never validated against the SIRENE registry: a wrong SIRET
  // must not block a legitimate enquiry.
  siret: z
    .string()
    .max(20)
    .regex(/^[\d\s]*$/, 'SIRET invalide.')
    .optional()
    .or(z.literal('')),
  site_web: z.string().max(200).optional().or(z.literal('')),
  message: z.string().max(3000).optional(),
})

export type RevendeurLeadFormData = z.infer<typeof RevendeurLeadSchema>

export async function submitRevendeurLead(data: RevendeurLeadFormData & Partial<AntiSpamInput>) {
  // Silent drop: returning an error would let bots iterate until they pass.
  if (isBotSubmission({ website: data.website, elapsedMs: data.elapsedMs })) {
    return { success: true }
  }

  const parsed = RevendeurLeadSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: 'Données invalides.' }

  const d = parsed.data
  const { data: inserted, error } = await supabaseAdmin
    .from('leads')
    .insert([
      {
        nom: d.nom,
        email: d.email,
        telephone: d.telephone,
        message: d.message || null,
        entreprise: d.entreprise,
        ville: d.ville,
        type_commerce: d.type_commerce,
        siret: d.siret || null,
        site_web: d.site_web || null,
        // Reseller enquiries share the leads inbox but are filtered on `source`.
        service: 'autre',
        source: 'revendeur',
      },
    ])
    .select('id')
    .single()
  if (error) return { success: false, error: 'Une erreur est survenue. Veuillez réessayer.' }

  const commerceLabel = TYPE_COMMERCE_LABELS[d.type_commerce] ?? d.type_commerce

  await sendPushToStaff('new-lead', {
    nom: d.entreprise,
    service: `Revendeur · ${commerceLabel}`,
    leadId: inserted?.id,
  })

  const row = (label: string, value: string) =>
    `<tr><td style="padding:4px 0;color:#888;font-size:14px;">${label}</td><td style="padding:4px 0 4px 16px;font-size:14px;color:#1D164E;">${value}</td></tr>`

  const internalHtml = `<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f5f0eb;font-family:Inter,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0">
<tr><td align="center" style="padding:48px 16px;">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;">
<tr><td style="padding:40px 48px;background:#1D164E;text-align:center;">
  <p style="margin:0;color:#f5f0eb;font-size:22px;font-weight:600;letter-spacing:0.02em;">merci murphy®</p>
</td></tr>
<tr><td style="padding:40px 48px;">
  <p style="margin:0 0 8px;font-size:18px;font-weight:600;color:#1D164E;">Nouvelle demande revendeur</p>
  <p style="margin:0 0 32px;font-size:14px;color:#888;">Type de commerce : <strong style="color:#1D164E;">${esc(commerceLabel)}</strong></p>
  <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;background:#f5f0eb;border-radius:12px;padding:20px 24px;">
    <tr><td>
      <p style="margin:0 0 12px;font-size:11px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:0.08em;">Enseigne</p>
      <table cellpadding="0" cellspacing="0">
        ${row('Nom', `<strong style="font-weight:600;">${esc(d.entreprise)}</strong>`)}
        ${row('Ville', esc(d.ville))}
        ${d.siret ? row('SIRET', esc(d.siret)) : ''}
        ${
          d.site_web
            ? row(
                'Site / Insta',
                `<a href="${esc(d.site_web)}" style="color:#B85C38;">${esc(d.site_web)}</a>`
              )
            : ''
        }
      </table>
    </td></tr>
  </table>
  <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;background:#f5f0eb;border-radius:12px;padding:20px 24px;">
    <tr><td>
      <p style="margin:0 0 12px;font-size:11px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:0.08em;">Contact</p>
      <table cellpadding="0" cellspacing="0">
        ${row('Nom', `<strong style="font-weight:600;">${esc(d.nom)}</strong>`)}
        ${row('Email', `<a href="mailto:${esc(d.email)}" style="color:#B85C38;">${esc(d.email)}</a>`)}
        ${row('Téléphone', `<a href="tel:${esc(d.telephone)}" style="color:#B85C38;">${esc(d.telephone)}</a>`)}
      </table>
    </td></tr>
  </table>
  ${
    d.message
      ? `<table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;background:#f5f0eb;border-radius:12px;padding:20px 24px;">
    <tr><td>
      <p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:0.08em;">Message</p>
      <p style="margin:0;font-size:14px;color:#1D164E;line-height:1.6;">${esc(d.message)}</p>
    </td></tr>
  </table>`
      : ''
  }
  <p style="margin:0;font-size:14px;color:#888;">Demande professionnelle — à traiter depuis le dashboard.</p>
</td></tr>
<tr><td style="padding:24px 48px;background:#f5f0eb;text-align:center;">
  <p style="margin:0;font-size:12px;color:#888;">merci murphy® · 18 rue Victor Massé, 75009 Paris · bonjour@mercimurphy.com</p>
</td></tr>
</table></td></tr></table>
</body></html>`

  await notifyInternal(`🏪 Demande revendeur — ${d.entreprise} (${d.ville})`, internalHtml)

  return { success: true }
}
