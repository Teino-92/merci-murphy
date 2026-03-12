import { NextResponse } from 'next/server'
import { setNewsletterActive } from '@/lib/supabase-admin'

export async function PATCH(req: Request) {
  const { id, active } = await req.json()
  await setNewsletterActive(id, active)
  return NextResponse.json({ ok: true })
}
