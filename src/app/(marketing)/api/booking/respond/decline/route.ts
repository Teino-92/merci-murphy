import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { esc } from '@/lib/emails/base'

const resend = new Resend(process.env.RESEND_API_KEY)

const bodySchema = z.object({
  token: z.string().regex(/^[a-f0-9]{64}$/),
  counter: z.string().trim().max(500).optional().nullable(),
})

export async function POST(req: NextRequest) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Requête invalide' }, { status: 400 })
  const { token } = parsed.data
  const counter = parsed.data.counter || null

  const { data: lead, error } = await supabaseAdmin
    .from('leads')
    .select('id, nom, email, service, respond_token')
    .eq('respond_token', token)
    .single()

  if (error || !lead) {
    return NextResponse.json({ error: 'Token invalide' }, { status: 404 })
  }

  await supabaseAdmin
    .from('leads')
    .update({
      client_response: 'declined',
      client_counter: counter,
      respond_token: null,
    })
    .eq('id', lead.id)

  // Notif interne
  const internalEmail = process.env.RESEND_INTERNAL_EMAIL
  if (internalEmail) {
    await resend.emails.send({
      from: `merci murphy® <${process.env.RESEND_AUTH_FROM}>`,
      to: internalEmail,
      subject: `❌ Créneau refusé — ${(lead.nom ?? '').replace(/[\r\n]/g, ' ').slice(0, 100)}`,
      html: `<p><strong>${esc(lead.nom)}</strong> a refusé le créneau proposé.</p>
${counter ? `<p><strong>Contre-proposition :</strong> ${esc(counter)}</p>` : '<p>Aucune contre-proposition fournie.</p>'}
<p>Service : ${esc(lead.service)}</p>
<p>→ <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard">Voir dans le dashboard</a></p>`,
    })
  }

  return NextResponse.json({ ok: true })
}
