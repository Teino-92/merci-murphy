import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { hasDashboardAccess } from '@/lib/auth-role'

const SubscribeSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
  userAgent: z.string().optional(),
})

const UnsubscribeSchema = z.object({
  endpoint: z.string().url(),
})

async function requireStaffUser() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  if (!hasDashboardAccess(user.email))
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  return { user }
}

export async function POST(req: NextRequest) {
  const gate = await requireStaffUser()
  if ('error' in gate) return gate.error

  const body = await req.json().catch(() => null)
  const parsed = SubscribeSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const now = new Date().toISOString()
  const { error } = await supabaseAdmin.from('push_subscriptions').upsert(
    {
      user_id: gate.user.id,
      endpoint: parsed.data.endpoint,
      p256dh: parsed.data.keys.p256dh,
      auth: parsed.data.keys.auth,
      user_agent: parsed.data.userAgent ?? null,
      last_used_at: now,
    },
    { onConflict: 'endpoint' }
  )

  if (error) {
    // eslint-disable-next-line no-console
    console.error('[push/subscribe] upsert failed', error)
    return NextResponse.json({ error: 'Upsert failed' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const gate = await requireStaffUser()
  if ('error' in gate) return gate.error

  const body = await req.json().catch(() => null)
  const parsed = UnsubscribeSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const { error } = await supabaseAdmin
    .from('push_subscriptions')
    .delete()
    .eq('user_id', gate.user.id)
    .eq('endpoint', parsed.data.endpoint)

  if (error) {
    // eslint-disable-next-line no-console
    console.error('[push/subscribe] delete failed', error)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
