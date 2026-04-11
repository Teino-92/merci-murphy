import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { isAdminEmail } from '@/lib/auth-role'
import { depositPaidHtml } from '@/lib/emails/deposit-paid'
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

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isAdminEmail(user.email)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  // Fetch visit + profile
  const { data: visit, error: fetchError } = await supabaseAdmin
    .from('visits')
    .select('profile_id, service, date, time, status')
    .eq('id', params.id)
    .eq('status', 'pending_deposit')
    .single()

  if (fetchError || !visit) {
    return NextResponse.json({ error: 'Visit not found or not pending deposit' }, { status: 404 })
  }

  // Mark confirmed
  const { error } = await supabaseAdmin
    .from('visits')
    .update({ status: 'confirmed', deposit_paid_at: new Date().toISOString() })
    .eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Send deposit-paid email to client
  const [profileRes, authUserRes] = await Promise.all([
    supabaseAdmin.from('profiles').select('nom, nom_chien').eq('id', visit.profile_id).single(),
    supabaseAdmin.auth.admin.getUserById(visit.profile_id),
  ])

  const clientEmail = authUserRes.data.user?.email
  if (clientEmail) {
    const startDate = new Date(`${visit.date}T${visit.time?.slice(0, 5) ?? '09:00'}Z`)
    const appointmentDate = startDate.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Paris',
    })
    const slugBase = visit.service.split('-')[0]

    await resend.emails
      .send({
        from: `merci murphy® <${process.env.RESEND_AUTH_FROM}>`,
        to: clientEmail,
        subject: `Acompte reçu — votre toilettage est confirmé chez merci murphy® 🐾`,
        html: depositPaidHtml({
          clientName: profileRes.data?.nom ?? '',
          dogName: profileRes.data?.nom_chien ?? null,
          serviceName: SERVICE_LABELS[slugBase] ?? visit.service,
          appointmentDate,
        }),
      })
      .catch(() => {})
  }

  return NextResponse.json({ ok: true })
}
