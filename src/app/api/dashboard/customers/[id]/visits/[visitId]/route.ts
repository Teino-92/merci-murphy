import { NextResponse } from 'next/server'
import { deleteVisit } from '@/lib/supabase-admin'

export async function DELETE(_req: Request, { params }: { params: { visitId: string } }) {
  await deleteVisit(params.visitId)
  return NextResponse.json({ ok: true })
}
