import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { supabaseAdmin, updateLeadStatus } from '@/lib/supabase-admin'
import { hasDashboardAccess } from '@/lib/auth-role'
import { bookingProposalHtml } from '@/lib/emails/booking-proposal'
import { depositRequestHtml } from '@/lib/emails/deposit-request'
import { Resend } from 'resend'
import { randomBytes } from 'crypto'

const resend = new Resend(process.env.RESEND_API_KEY)

const SERVICE_LABELS: Record<string, string> = {
  toilettage: 'Toilettage',
  bains: 'Bains',
  balneo: 'Balnéo',
  massage: 'Massage',
  osteo: 'Ostéopathie',
  education: 'Éducation',
  creche: 'Crèche',
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!hasDashboardAccess(user.email))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()

  // ── Cas 1 : simple changement de statut ──────────────────────────────────
  if (body.status && !body.action) {
    await updateLeadStatus(params.id, body.status)
    return NextResponse.json({ ok: true })
  }

  // ── Cas 2 : proposer un créneau ──────────────────────────────────────────
  if (body.action === 'propose') {
    const { proposedDate, proposedTime } = body
    if (!proposedDate || !proposedTime)
      return NextResponse.json({ error: 'Date/heure manquante' }, { status: 400 })

    const { data: lead } = await supabaseAdmin
      .from('leads')
      .select('nom, email, service, nom_chien')
      .eq('id', params.id)
      .single()

    if (!lead) return NextResponse.json({ error: 'Lead introuvable' }, { status: 404 })

    const token = randomBytes(32).toString('hex')

    await supabaseAdmin
      .from('leads')
      .update({
        proposed_date: proposedDate,
        proposed_time: proposedTime,
        respond_token: token,
        client_response: null,
        status: 'contacted',
      })
      .eq('id', params.id)

    const slugBase = lead.service.split('-')[0]
    const serviceName = SERVICE_LABELS[slugBase] ?? lead.service

    const formattedDate = new Date(`${proposedDate}T${proposedTime}:00`).toLocaleDateString(
      'fr-FR',
      {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Europe/Paris',
      }
    )

    await resend.emails.send({
      from: `merci murphy® <${process.env.RESEND_AUTH_FROM}>`,
      to: lead.email,
      subject: `Proposition de rendez-vous chez merci murphy®`,
      html: bookingProposalHtml({
        clientName: lead.nom,
        dogName: lead.nom_chien,
        serviceName,
        proposedDate: formattedDate,
        token,
      }),
    })

    return NextResponse.json({ ok: true })
  }

  // ── Cas 3 : envoyer demande d'acompte ────────────────────────────────────
  if (body.action === 'send-deposit') {
    const { depositAmount, paymentUrl } = body
    if (!depositAmount || !paymentUrl)
      return NextResponse.json({ error: 'Montant ou lien manquant' }, { status: 400 })

    const { data: lead } = await supabaseAdmin
      .from('leads')
      .select('nom, email, service, nom_chien, proposed_date, proposed_time')
      .eq('id', params.id)
      .single()

    if (!lead) return NextResponse.json({ error: 'Lead introuvable' }, { status: 404 })

    await supabaseAdmin
      .from('leads')
      .update({ deposit_amount: depositAmount, payment_url: paymentUrl, status: 'confirmed' })
      .eq('id', params.id)

    const slugBase = lead.service.split('-')[0]
    const serviceName = SERVICE_LABELS[slugBase] ?? lead.service

    const formattedDate =
      lead.proposed_date && lead.proposed_time
        ? new Date(`${lead.proposed_date}T${lead.proposed_time}:00`).toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Europe/Paris',
          })
        : 'à confirmer'

    await resend.emails.send({
      from: `merci murphy® <${process.env.RESEND_AUTH_FROM}>`,
      to: lead.email,
      subject: `Confirmez votre réservation chez merci murphy®`,
      html: depositRequestHtml({
        clientName: lead.nom,
        dogName: lead.nom_chien,
        serviceName,
        appointmentDate: formattedDate,
        depositAmount: Number(depositAmount),
        paymentUrl,
      }),
    })

    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 })
}
