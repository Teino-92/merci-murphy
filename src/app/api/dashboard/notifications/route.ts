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

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const [visitsRes, declinedRes, depositRes, leadsRes, nlRes] = await Promise.all([
    // Active visits (new, confirmed, pending_deposit)
    supabaseAdmin
      .from('visits')
      .select(
        'id, profile_id, service, status, date, time, created_at, deposit_paid_at, profiles(nom, dogs(name))'
      )
      .in('status', ['new', 'confirmed', 'pending_deposit'])
      .order('created_at', { ascending: false })
      .limit(20),
    // Cancelled visits (client declined reschedule) — last 30 days
    supabaseAdmin
      .from('visits')
      .select('id, profile_id, service, status, date, time, created_at, profiles(nom, dogs(name))')
      .eq('status', 'cancelled')
      .is('respond_token', null)
      .gte('updated_at', since)
      .order('updated_at', { ascending: false })
      .limit(10),
    // Deposit paid — confirmed visits with deposit_paid_at — last 30 days
    supabaseAdmin
      .from('visits')
      .select(
        'id, profile_id, service, status, date, time, created_at, deposit_paid_at, profiles(nom, dogs(name))'
      )
      .eq('status', 'confirmed')
      .not('deposit_paid_at', 'is', null)
      .gte('deposit_paid_at', since)
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

  return NextResponse.json({
    visits: visitsRes.data ?? [],
    declined: declinedRes.data ?? [],
    depositPaid: depositRes.data ?? [],
    leads: leadsRes.data ?? [],
    newsletter: nlRes.data ?? [],
  })
}
