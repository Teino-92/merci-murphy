import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getStaffSchedule, upsertStaffSchedule, deleteStaffSchedule } from '@/lib/supabase-admin'
import { hasDashboardAccess } from '@/lib/auth-role'

async function requireDashboard() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user || !hasDashboardAccess(user.email)) return null
  return user
}

// GET /api/dashboard/staff/[id]/schedule?from=YYYY-MM-DD&to=YYYY-MM-DD
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireDashboard()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const from = req.nextUrl.searchParams.get('from') ?? new Date().toISOString().slice(0, 10)
  const to = req.nextUrl.searchParams.get('to') ?? from

  const schedule = await getStaffSchedule(params.id, from, to)
  return NextResponse.json(schedule)
}

// POST /api/dashboard/staff/[id]/schedule  { date, start_time, end_time }
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireDashboard()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { date, start_time, end_time } = await req.json()
  if (!date || !start_time || !end_time) {
    return NextResponse.json({ error: 'date, start_time and end_time required' }, { status: 400 })
  }
  if (start_time >= end_time) {
    return NextResponse.json({ error: 'start_time must be before end_time' }, { status: 400 })
  }

  const entry = await upsertStaffSchedule(params.id, date, start_time, end_time)
  return NextResponse.json(entry)
}

// DELETE /api/dashboard/staff/[id]/schedule  { id }
export async function DELETE(req: NextRequest) {
  const user = await requireDashboard()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  await deleteStaffSchedule(id)
  return NextResponse.json({ ok: true })
}
