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

  const [visitsRes, leadsRes, nlRes] = await Promise.all([
    supabaseAdmin
      .from('visits')
      .select('id, profile_id, service, status, date, time, created_at, profiles(nom, dogs(name))')
      .in('status', ['new', 'confirmed', 'pending_deposit'])
      .order('created_at', { ascending: false })
      .limit(20),
    supabaseAdmin
      .from('leads')
      .select('id, nom, service, created_at')
      .eq('status', 'new')
      .order('created_at', { ascending: false })
      .limit(20),
    supabaseAdmin
      .from('newsletter_subscribers')
      .select('id, email, created_at')
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  return NextResponse.json({
    visits: visitsRes.data ?? [],
    leads: leadsRes.data ?? [],
    newsletter: nlRes.data ?? [],
  })
}
