import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { hasDashboardAccess } from '@/lib/auth-role'
import { depositRequestHtml } from '@/lib/emails/deposit-request'
import { Resend } from 'resend'

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

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!hasDashboardAccess(user.email))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { depositAmount, paymentUrl } = await req.json()
  if (!depositAmount || Number(depositAmount) <= 0 || !paymentUrl) {
    return NextResponse.json({ error: 'Montant ou lien manquant' }, { status: 400 })
  }

  const { data: visit, error: fetchError } = await supabaseAdmin
    .from('visits')
    .select('profile_id, service, date, time')
    .eq('id', params.id)
    .single()

  if (fetchError || !visit)
    return NextResponse.json({ error: 'Visite introuvable' }, { status: 404 })

  await supabaseAdmin
    .from('visits')
    .update({ deposit_amount: Number(depositAmount) })
    .eq('id', params.id)

  const { data: firstDog } = await supabaseAdmin
    .from('dogs')
    .select('name')
    .eq('owner_id', visit.profile_id)
    .order('created_at', { ascending: true })
    .limit(1)
    .single()

  const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(visit.profile_id)
  const clientEmail = authUser?.user?.email
  if (!clientEmail) return NextResponse.json({ error: 'Email client introuvable' }, { status: 404 })

  const slugBase = visit.service.split('-')[0]
  const serviceName = SERVICE_LABELS[slugBase] ?? visit.service

  const appointmentDate =
    visit.date && visit.time
      ? new Date(`${visit.date}T${visit.time.slice(0, 5)}:00`).toLocaleDateString('fr-FR', {
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
    to: clientEmail,
    subject: `Confirmez votre réservation chez merci murphy®`,
    html: depositRequestHtml({
      clientName: '',
      dogName: firstDog?.name ?? null,
      serviceName,
      appointmentDate,
      depositAmount: Number(depositAmount),
      paymentUrl,
    }),
  })

  return NextResponse.json({ ok: true })
}
