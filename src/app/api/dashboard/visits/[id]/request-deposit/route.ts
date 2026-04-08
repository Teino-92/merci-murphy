import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { createSumUpCheckout, getSumUpCheckoutUrl } from '@/lib/sumup'
import { depositRequestHtml } from '@/lib/emails/deposit-request'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const SERVICE_LABELS: Record<string, string> = {
  toilettage: 'Toilettage',
  bains: 'Bains',
  balneo: 'Balnéo',
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { finalPrice } = await req.json()
  if (!finalPrice || isNaN(Number(finalPrice)) || Number(finalPrice) <= 0) {
    return NextResponse.json({ error: 'finalPrice invalide' }, { status: 400 })
  }

  const price = Number(finalPrice)
  const depositAmount = Math.round(price * 0.5 * 100) / 100

  const { data: visit, error: visitError } = await supabaseAdmin
    .from('visits')
    .select('*')
    .eq('id', params.id)
    .single()

  if (visitError || !visit) {
    return NextResponse.json({ error: 'Visite introuvable' }, { status: 404 })
  }

  if (visit.status !== 'pending_deposit') {
    return NextResponse.json({ error: 'Cette visite ne nécessite pas de dépôt' }, { status: 400 })
  }

  const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(
    visit.profile_id
  )
  if (authError || !authUser.user?.email) {
    return NextResponse.json({ error: 'Email client introuvable' }, { status: 404 })
  }

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('nom')
    .eq('id', visit.profile_id)
    .single()

  const clientName = profile?.nom ?? 'Client'
  const clientEmail = authUser.user.email

  let checkout
  try {
    checkout = await createSumUpCheckout({
      amount: depositAmount,
      reference: `deposit_${visit.id}`,
      description: `Acompte ${SERVICE_LABELS[visit.service] ?? visit.service} — ${clientName}`,
      returnUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/booking/confirmed`,
    })
  } catch (err) {
    console.error('SumUp error:', err)
    return NextResponse.json({ error: 'Erreur création lien de paiement' }, { status: 500 })
  }

  await supabaseAdmin
    .from('visits')
    .update({ final_price: price, sumup_checkout_id: checkout.id })
    .eq('id', visit.id)

  const paymentUrl = getSumUpCheckoutUrl(checkout.id)

  const startDate = new Date(`${visit.date}T${visit.time ?? '00:00'}`)
  const appointmentDate = startDate.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...(visit.time ? { hour: '2-digit', minute: '2-digit' } : {}),
    timeZone: 'Europe/Paris',
  })

  try {
    await resend.emails.send({
      from: `merci murphy® <${process.env.RESEND_FROM_EMAIL}>`,
      to: clientEmail,
      subject: 'Confirmez votre réservation — merci murphy® 🐾',
      html: depositRequestHtml({
        clientName,
        serviceName: SERVICE_LABELS[visit.service] ?? visit.service,
        appointmentDate,
        depositAmount,
        paymentUrl,
      }),
    })
  } catch (err) {
    console.error('Resend error:', err)
  }

  return NextResponse.json({ ok: true, depositAmount, paymentUrl })
}
