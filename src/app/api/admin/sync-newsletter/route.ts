// src/app/api/admin/sync-newsletter/route.ts
// ONE-TIME USE: syncs existing newsletter_subscribers to Resend Audience.
// Hit once, then delete this file.

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: subscribers, error } = await supabaseAdmin
    .from('newsletter_subscribers')
    .select('email, active')
    .eq('active', true)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const audienceId = process.env.RESEND_AUDIENCE_ID!
  let synced = 0

  for (const sub of subscribers ?? []) {
    await resend.contacts
      .create({ email: sub.email, audienceId, unsubscribed: false })
      .catch(() => {})
    synced++
  }

  return NextResponse.json({ ok: true, synced })
}
