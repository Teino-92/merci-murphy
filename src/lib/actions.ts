'use server'

import { z } from 'zod'
import nodemailer from 'nodemailer'
import { Resend } from 'resend'
import { supabaseAdmin } from '@/lib/supabase-admin'

const resend = new Resend(process.env.RESEND_API_KEY)

const transporter = nodemailer.createTransport({
  host: process.env.OVH_SMTP_HOST,
  port: Number(process.env.OVH_SMTP_PORT ?? 587),
  secure: false,
  auth: {
    user: process.env.OVH_SMTP_USER,
    pass: process.env.OVH_SMTP_PASS,
  },
})

// ─── Lead (reservation + contact) ───────────────────────────────────────────

const LeadSchema = z.object({
  nom: z.string().min(2),
  email: z.string().email(),
  telephone: z.string().min(8),
  service: z.enum(['toilettage', 'bains', 'creche', 'education', 'osteo', 'autre']),
  race_chien: z.string().optional(),
  poids_chien: z.string().optional(),
  etat_poil: z.string().optional(),
  message: z.string().optional(),
  source: z.enum(['reservation', 'contact']),
})

export type LeadFormData = z.infer<typeof LeadSchema>

const SERVICE_LABELS: Record<string, string> = {
  toilettage: 'Toilettage',
  bains: 'Bains self-service',
  creche: 'Crèche',
  education: 'Éducation',
  osteo: 'Ostéopathie',
  autre: 'Autre',
}

export async function submitLead(data: LeadFormData) {
  const parsed = LeadSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: 'Données invalides.' }

  const { error } = await supabaseAdmin.from('leads').insert([parsed.data])
  if (error) return { success: false, error: 'Une erreur est survenue. Veuillez réessayer.' }

  // Notification interne via OVH
  const d = parsed.data
  const serviceLabel = SERVICE_LABELS[d.service] ?? d.service
  const dogInfo = [
    d.race_chien && `Race : ${d.race_chien}`,
    d.poids_chien && `Poids : ${d.poids_chien}`,
    d.etat_poil && `Pelage : ${d.etat_poil}`,
  ]
    .filter(Boolean)
    .join('\n')

  await transporter
    .sendMail({
      from: `"Merci Murphy" <${process.env.OVH_SMTP_USER}>`,
      to: 'bonjour@mercimurphy.com',
      subject: `🐾 Nouvelle demande de rappel — ${d.nom} (${serviceLabel})`,
      text: [
        `Nouvelle demande de rappel reçue sur mercimurphy.com`,
        ``,
        `CLIENT`,
        `Nom : ${d.nom}`,
        `Email : ${d.email}`,
        `Téléphone : ${d.telephone}`,
        ``,
        `SERVICE DEMANDÉ`,
        serviceLabel,
        dogInfo ? `\nINFOS CHIEN\n${dogInfo}` : '',
        d.message ? `\nMESSAGE\n${d.message}` : '',
        ``,
        `---`,
        `Ce client attend d'être rappelé.e pour confirmer son rendez-vous.`,
      ]
        .filter((l) => l !== undefined)
        .join('\n'),
    })
    .catch(() => {
      // Ne pas bloquer la soumission si l'email échoue
    })

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

  // Welcome email via Resend
  await resend.emails
    .send({
      from: `Merci Murphy <${process.env.RESEND_NEWSLETTER_FROM}>`,
      to: parsed.data.email,
      subject: 'Bienvenue dans la communauté merci murphy® 🐾',
      text: [
        `Bonjour,`,
        ``,
        `merci de rejoindre la communauté merci murphy® !`,
        ``,
        `Vous serez parmi les premiers à recevoir nos actualités, conseils bien-être pour votre chien, et offres exclusives.`,
        ``,
        `À très bientôt,`,
        `L'équipe merci murphy®`,
        ``,
        `---`,
        `merci murphy® — Boutique premium de bien-être pour chiens`,
        `Paris | mercimurphy.com`,
      ].join('\n'),
    })
    .catch(() => {
      // Ne pas bloquer si l'email échoue
    })

  return { success: true }
}
