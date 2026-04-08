'use server'

import { z } from 'zod'
import { Resend } from 'resend'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { newsletterWelcomeHtml } from '@/lib/emails/newsletter-welcome'
import { SERVICE_LABELS } from '@/lib/dog-constants'

const resend = new Resend(process.env.RESEND_API_KEY)

// ─── Lead (reservation + contact) ───────────────────────────────────────────

const LeadSchema = z.object({
  nom: z.string().min(2),
  email: z.string().email(),
  telephone: z.string().min(8),
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
  nom_chien: z.string().optional(),
  race_chien: z.string().optional(),
  poids_chien: z.string().optional(),
  etat_poil: z.string().optional(),
  message: z.string().optional(),
  source: z.enum(['reservation', 'contact']),
})

export type LeadFormData = z.infer<typeof LeadSchema>

export async function submitLead(data: LeadFormData) {
  const parsed = LeadSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: 'Données invalides.' }

  const { error } = await supabaseAdmin.from('leads').insert([parsed.data])
  if (error) return { success: false, error: 'Une erreur est survenue. Veuillez réessayer.' }

  // Notification interne via Resend
  const d = parsed.data
  const serviceLabel = SERVICE_LABELS[d.service] ?? d.service
  const dogRows = [
    d.nom_chien &&
      `<tr><td style="padding:4px 0;color:#888;font-size:14px;">Nom du chien</td><td style="padding:4px 0 4px 16px;font-size:14px;color:#1D164E;font-weight:600;">${d.nom_chien}</td></tr>`,
    d.race_chien &&
      `<tr><td style="padding:4px 0;color:#888;font-size:14px;">Race</td><td style="padding:4px 0 4px 16px;font-size:14px;color:#1D164E;">${d.race_chien}</td></tr>`,
    d.poids_chien &&
      `<tr><td style="padding:4px 0;color:#888;font-size:14px;">Poids</td><td style="padding:4px 0 4px 16px;font-size:14px;color:#1D164E;">${d.poids_chien}</td></tr>`,
    d.etat_poil &&
      `<tr><td style="padding:4px 0;color:#888;font-size:14px;">Pelage</td><td style="padding:4px 0 4px 16px;font-size:14px;color:#1D164E;">${d.etat_poil}</td></tr>`,
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
  <p style="margin:0 0 32px;font-size:14px;color:#888;">Service demandé : <strong style="color:#1D164E;">${serviceLabel}</strong></p>
  <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;background:#f5f0eb;border-radius:12px;padding:20px 24px;">
    <tr><td>
      <p style="margin:0 0 12px;font-size:11px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:0.08em;">Client</p>
      <table cellpadding="0" cellspacing="0">
        <tr><td style="padding:4px 0;color:#888;font-size:14px;">Nom</td><td style="padding:4px 0 4px 16px;font-size:14px;color:#1D164E;font-weight:600;">${d.nom}</td></tr>
        <tr><td style="padding:4px 0;color:#888;font-size:14px;">Email</td><td style="padding:4px 0 4px 16px;font-size:14px;color:#1D164E;"><a href="mailto:${d.email}" style="color:#B85C38;">${d.email}</a></td></tr>
        <tr><td style="padding:4px 0;color:#888;font-size:14px;">Téléphone</td><td style="padding:4px 0 4px 16px;font-size:14px;color:#1D164E;"><a href="tel:${d.telephone}" style="color:#B85C38;">${d.telephone}</a></td></tr>
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
      <p style="margin:0;font-size:14px;color:#1D164E;line-height:1.6;">${d.message}</p>
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

  await resend.emails
    .send({
      from: `merci murphy® <${process.env.RESEND_FROM_EMAIL}>`,
      to: 'bonjour@mercimurphy.com',
      subject: `🐾 Nouvelle demande — ${d.nom}${d.nom_chien ? ` & ${d.nom_chien}` : ''} (${serviceLabel})`,
      html: internalHtml,
    })
    .catch(() => {})

  return { success: true }
}

// ─── Newsletter ──────────────────────────────────────────────────────────────

const NewsletterSchema = z.object({
  email: z.string().email(),
})

export async function subscribeNewsletter(data: { email: string }) {
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
      subject: 'Bienvenue dans la communauté merci murphy® 🐾',
      html: newsletterWelcomeHtml(),
    })
    .catch(() => {})

  return { success: true }
}
