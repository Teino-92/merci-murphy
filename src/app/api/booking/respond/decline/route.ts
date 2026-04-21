import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  const { token, counter } = await req.json()

  if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 })

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
      client_counter: counter ?? null,
      respond_token: null,
    })
    .eq('id', lead.id)

  // Notif interne
  const internalEmail = process.env.RESEND_INTERNAL_EMAIL
  if (internalEmail) {
    await resend.emails.send({
      from: `merci murphy® <${process.env.RESEND_AUTH_FROM}>`,
      to: internalEmail,
      subject: `❌ Créneau refusé — ${lead.nom}`,
      html: `<p><strong>${lead.nom}</strong> a refusé le créneau proposé.</p>
${counter ? `<p><strong>Contre-proposition :</strong> ${counter}</p>` : '<p>Aucune contre-proposition fournie.</p>'}
<p>Service : ${lead.service}</p>
<p>→ <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard">Voir dans le dashboard</a></p>`,
    })
  }

  return NextResponse.json({ ok: true })
}
