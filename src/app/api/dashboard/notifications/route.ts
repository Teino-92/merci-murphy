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
  const since7 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [visitsRes, declinedRes, depositRes, leadsRes, nlRes] = await Promise.all([
    // new + pending_deposit (all) + confirmed only last 7 days
    supabaseAdmin
      .from('visits')
      .select(
        'id, profile_id, service, status, date, time, created_at, deposit_paid_at, profiles(nom, dogs(name))'
      )
      .or(
        `status.eq.new,status.eq.pending_deposit,and(status.eq.confirmed,created_at.gte.${since7})`
      )
      .order('created_at', { ascending: false })
      .limit(20),
    // Cancelled (client declined reschedule) — last 30 days, sort by updated_at
    supabaseAdmin
      .from('visits')
      .select(
        'id, profile_id, service, status, date, time, created_at, updated_at, profiles(nom, dogs(name))'
      )
      .eq('status', 'cancelled')
      .is('respond_token', null)
      .gte('updated_at', since30)
      .order('updated_at', { ascending: false })
      .limit(10),
    // Deposit paid — last 30 days
    supabaseAdmin
      .from('visits')
      .select(
        'id, profile_id, service, status, date, time, created_at, deposit_paid_at, profiles(nom, dogs(name))'
      )
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

  return NextResponse.json({
    visits: visitsRes.data ?? [],
    declined: declinedRes.data ?? [],
    depositPaid: depositRes.data ?? [],
    leads: leadsRes.data ?? [],
    newsletter: nlRes.data ?? [],
  })
}
