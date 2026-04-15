import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { hasDashboardAccess } from '@/lib/auth-role'
import { supabaseAdmin } from '@/lib/supabase-admin'

function toCSV(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return ''
  const headers = Object.keys(rows[0])
  const lines = [
    headers.join(','),
    ...rows.map((row) =>
      headers
        .map((h) => {
          const val = row[h]
          if (val === null || val === undefined) return ''
          const str = String(val).replace(/"/g, '""')
          return str.includes(',') || str.includes('\n') || str.includes('"') ? `"${str}"` : str
        })
        .join(',')
    ),
  ]
  return lines.join('\n')
}

export async function GET(request: Request) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !hasDashboardAccess(user.email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const table = searchParams.get('table')

  if (table === 'profiles') {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return new NextResponse(toCSV(data ?? []), {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="profiles.csv"',
      },
    })
  }

  if (table === 'dogs') {
    const { data, error } = await supabaseAdmin
      .from('dogs')
      .select('*')
      .order('name', { ascending: true })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return new NextResponse(toCSV(data ?? []), {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="dogs.csv"',
      },
    })
  }

  if (table === 'visits') {
    const { data, error } = await supabaseAdmin
      .from('visits')
      .select('*')
      .order('date', { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return new NextResponse(toCSV(data ?? []), {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="visits.csv"',
      },
    })
  }

  return NextResponse.json({ error: 'Table inconnue' }, { status: 400 })
}
