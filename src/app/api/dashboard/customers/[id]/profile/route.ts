import { NextResponse } from 'next/server'
import { updateProfile, deleteProfile } from '@/lib/supabase-admin'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json()
  await updateProfile(params.id, body)
  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  await deleteProfile(params.id)
  return NextResponse.json({ ok: true })
}
