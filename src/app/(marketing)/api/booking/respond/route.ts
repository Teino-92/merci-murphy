import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { sendPushToStaff } from '@/lib/push'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')
  const action = searchParams.get('action')

  if (!token || action !== 'accept') {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { data: lead, error } = await supabaseAdmin
    .from('leads')
    .select('id, status, respond_token, proposed_date, proposed_time, service, user_id, email')
    .eq('respond_token', token)
    .single()

  if (error || !lead) {
    return NextResponse.redirect(new URL('/booking/respond/invalid', req.url))
  }

  if (lead.status === 'cancelled') {
    return NextResponse.redirect(new URL('/booking/respond/expired', req.url))
  }

  await supabaseAdmin
    .from('leads')
    .update({
      client_response: 'accepted',
      status: 'confirmed',
      respond_token: null,
    })
    .eq('id', lead.id)

  // Crée la visite si on a les infos nécessaires
  if (lead.proposed_date && lead.proposed_time) {
    // Résout le profile_id : d'abord user_id du lead, sinon cherche par email
    let profileId = lead.user_id as string | null
    if (!profileId && lead.email) {
      const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 })
      const match = (authUsers?.users ?? []).find((u) => u.email === lead.email)
      if (match) profileId = match.id
    }

    if (profileId) {
      // Récupère grooming_duration du premier chien
      const { data: firstDog } = await supabaseAdmin
        .from('dogs')
        .select('grooming_duration')
        .eq('owner_id', profileId)
        .order('created_at', { ascending: true })
        .limit(1)
        .single()

      const { data: newVisit } = await supabaseAdmin
        .from('visits')
        .insert({
          profile_id: profileId,
          service: lead.service,
          date: lead.proposed_date,
          time: `${lead.proposed_time}:00`,
          duration: firstDog?.grooming_duration ?? null,
          status: 'confirmed',
        })
        .select('id')
        .single()

      await sendPushToStaff('new-visit', {
        service: lead.service,
        date: `${lead.proposed_date} ${lead.proposed_time}`,
        visitId: newVisit?.id,
      })
    }
  }

  return NextResponse.redirect(new URL('/booking/respond/accepted', req.url))
}
