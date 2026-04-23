// Server-only helper for sending Web Push notifications to dashboard staff.
// Invoked from Server Actions / API routes after a relevant INSERT / UPDATE.
// Never throws — failures are logged, main flow is never broken.

import 'server-only'
import webpush from 'web-push'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { hasDashboardAccess } from '@/lib/auth-role'

const PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY
const PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY
const SUBJECT = process.env.VAPID_SUBJECT

if (!PUBLIC_KEY || !PRIVATE_KEY || !SUBJECT) {
  throw new Error(
    'Missing VAPID env: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT must all be set.'
  )
}

webpush.setVapidDetails(SUBJECT, PUBLIC_KEY, PRIVATE_KEY)

export type PushEventType = 'new-lead' | 'new-visit' | 'pending-deposit' | 'deposit-paid'

export type PushEventData = {
  nom?: string
  service?: string
  date?: string
  visitId?: string
  leadId?: string
}

type PushPayload = {
  title: string
  body: string
  url: string
  tag?: string
}

function buildPayload(event: PushEventType, data: PushEventData): PushPayload {
  const who = data.nom || 'Un client'
  const service = data.service || 'service'
  const when = data.date || ''
  switch (event) {
    case 'new-lead':
      return {
        title: 'Nouvelle demande',
        body: `${who} — ${service}`,
        url: '/dashboard/leads',
        tag: `lead-${data.leadId ?? 'x'}`,
      }
    case 'new-visit':
      return {
        title: 'Nouvelle réservation',
        body: `${who} — ${service}${when ? ` · ${when}` : ''}`,
        url: '/dashboard/reservations',
        tag: `visit-${data.visitId ?? 'x'}`,
      }
    case 'pending-deposit':
      return {
        title: 'Acompte à demander',
        body: `${who} — ${service}${when ? ` · ${when}` : ''}`,
        url: '/dashboard/reservations?filter=pending_deposit',
        tag: `pending-${data.visitId ?? 'x'}`,
      }
    case 'deposit-paid':
      return {
        title: 'Acompte payé',
        body: `${who} — ${service}${when ? ` · ${when}` : ''}`,
        url: '/dashboard/reservations',
        tag: `paid-${data.visitId ?? 'x'}`,
      }
  }
}

export async function sendPushToStaff(
  event: PushEventType,
  data: PushEventData
): Promise<void> {
  try {
    // Step 1: get all staff user ids (admins + team) via auth allowlist.
    const { data: usersRes, error: usersErr } = await supabaseAdmin.auth.admin.listUsers({
      perPage: 1000,
    })
    if (usersErr) {
      // eslint-disable-next-line no-console
      console.error('[push] listUsers failed', usersErr)
      return
    }
    const staffIds = (usersRes?.users ?? [])
      .filter((u) => hasDashboardAccess(u.email ?? undefined))
      .map((u) => u.id)

    if (staffIds.length === 0) return

    // Step 2: load subs for those staff.
    const { data: subs, error: subsErr } = await supabaseAdmin
      .from('push_subscriptions')
      .select('id, endpoint, p256dh, auth')
      .in('user_id', staffIds)

    if (subsErr) {
      // eslint-disable-next-line no-console
      console.error('[push] load subs failed', subsErr)
      return
    }
    if (!subs || subs.length === 0) return

    // Step 3: send in parallel. Cleanup 404/410.
    const payload = JSON.stringify(buildPayload(event, data))
    const results = await Promise.allSettled(
      subs.map((s) =>
        webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          payload
        )
      )
    )

    const gone: string[] = []
    results.forEach((r, i) => {
      if (r.status === 'rejected') {
        const err = r.reason as { statusCode?: number } | undefined
        const code = err?.statusCode
        if (code === 404 || code === 410) {
          gone.push(subs[i].id)
        } else {
          // eslint-disable-next-line no-console
          console.error('[push] send failed', code, r.reason)
        }
      }
    })

    if (gone.length > 0) {
      await supabaseAdmin.from('push_subscriptions').delete().in('id', gone)
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[push] sendPushToStaff threw', err)
  }
}
