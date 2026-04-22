import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { hasDashboardAccess } from '@/lib/auth-role'

export async function GET() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user || !hasDashboardAccess(user.email))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const selectVisit =
    'id, profile_id, dog_id, service, status, date, time, created_at, deposit_paid_at, profiles(nom), dogs(name)'

  const [newVisitsRes, pendingRes, depositRes, leadsRes, nlRes] = await Promise.all([
    // New visits (not yet confirmed) — all
    supabaseAdmin
      .from('visits')
      .select(selectVisit)
      .eq('status', 'new')
      .order('created_at', { ascending: false })
      .limit(20),
    // Pending deposit — all
    supabaseAdmin
      .from('visits')
      .select(selectVisit)
      .eq('status', 'pending_deposit')
      .order('created_at', { ascending: false })
      .limit(20),
    // Deposit just paid — last 30 days (pending_deposit → confirmed via confirm-deposit route)
    supabaseAdmin
      .from('visits')
      .select(selectVisit)
      .eq('status', 'confirmed')
      .not('deposit_paid_at', 'is', null)
      .gte('deposit_paid_at', since30)
      .order('deposit_paid_at', { ascending: false })
      .limit(10),
    // New leads
    supabaseAdmin
      .from('leads')
      .select('id, nom, service, created_at')
      .eq('status', 'new')
      .order('created_at', { ascending: false })
      .limit(20),
    // Newsletter
    supabaseAdmin
      .from('newsletter_subscribers')
      .select('id, email, created_at')
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  const payload = {
    visits: [...(newVisitsRes.data ?? []), ...(pendingRes.data ?? [])],
    depositPaid: depositRes.data ?? [],
    declined: [],
    leads: leadsRes.data ?? [],
    newsletter: nlRes.data ?? [],
  }
  // eslint-disable-next-line no-console
  console.log('[notifications] payload counts:', {
    visits: payload.visits.length,
    depositPaid: payload.depositPaid.length,
    leads: payload.leads.length,
    newsletter: payload.newsletter.length,
    errors: {
      newVisits: newVisitsRes.error?.message,
      pending: pendingRes.error?.message,
      deposit: depositRes.error?.message,
      leads: leadsRes.error?.message,
    },
  })
  return NextResponse.json(payload)
}
