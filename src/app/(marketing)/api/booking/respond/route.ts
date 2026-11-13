import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { sendPushToStaff } from '@/lib/push'

const TOKEN_RE = /^[a-f0-9]{64}$/

// Email links: never mutate on GET (link scanners), send to the confirmation page.
export async function GET(req: NextRequest) {
  const dest = new URL('/booking/respond/confirm', req.url)
  dest.searchParams.set('kind', 'lead')
  dest.searchParams.set('token', req.nextUrl.searchParams.get('token') ?? '')
  return NextResponse.redirect(dest, 303)
}

export async function POST(req: NextRequest) {
  const invalid = NextResponse.redirect(new URL('/booking/respond/invalid', req.url), 303)
  const form = await req.formData().catch(() => null)
  const token = form?.get('token')
  if (typeof token !== 'string' || !TOKEN_RE.test(token)) return invalid

  const { data: lead, error } = await supabaseAdmin
    .from('leads')
    .select('id, status, proposed_date, proposed_time, service, user_id, email')
    .eq('respond_token', token)
    .single()

  if (error || !lead || lead.status === 'cancelled') return invalid

  // Consume the token atomically: a double submit must not create two visits
  const { data: consumed } = await supabaseAdmin
    .from('leads')
    .update({
      client_response: 'accepted',
      status: 'confirmed',
      respond_token: null,
    })
    .eq('id', lead.id)
    .eq('respond_token', token)
    .select('id')
  if (!consumed || consumed.length === 0) return invalid

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

  return NextResponse.redirect(new URL('/booking/respond/accepted', req.url), 303)
}
