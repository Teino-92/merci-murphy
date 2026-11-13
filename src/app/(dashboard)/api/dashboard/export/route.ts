import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { isAdminEmail } from '@/lib/auth-role'
import { supabaseAdmin } from '@/lib/supabase-admin'

// Neutralise spreadsheet formulas (=, +, -, @, tab, CR) to prevent CSV injection
function csvCell(val: unknown): string {
  if (val === null || val === undefined) return ''
  let str = String(val)
  if (/^[=+\-@\t\r]/.test(str)) str = `'${str}`
  str = str.replace(/"/g, '""')
  return /[",\n\r]/.test(str) ? `"${str}"` : str
}

function toCSV(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return ''
  const headers = Object.keys(rows[0])
  const lines = [
    headers.map(csvCell).join(','),
    ...rows.map((row) => headers.map((h) => csvCell(row[h])).join(',')),
  ]
  return lines.join('\n')
}

// Explicit columns: never export tokens
const EXPORTS = {
  profiles: {
    columns:
      'id, nom, telephone, can_book, admission_passed, newsletter_subscribed, notes, created_at',
    order: 'created_at',
    ascending: false,
  },
  dogs: {
    columns:
      'id, owner_id, name, breed, age, poids, etat_poil, grooming_duration, numero_puce, notes, created_at',
    order: 'name',
    ascending: true,
  },
  visits: {
    columns:
      'id, profile_id, dog_id, service, date, time, duration, staff, status, price, deposit_amount, deposit_paid_at, notes, visit_notes, created_at',
    order: 'date',
    ascending: false,
  },
} as const

export async function GET(request: Request) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isAdminEmail(user.email)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const table = new URL(request.url).searchParams.get('table')
  if (table !== 'profiles' && table !== 'dogs' && table !== 'visits') {
    return NextResponse.json({ error: 'Table inconnue' }, { status: 400 })
  }

  const cfg: { columns: string; order: string; ascending: boolean } = EXPORTS[table]
  const { data, error } = await supabaseAdmin
    .from(table as string)
    .select(cfg.columns)
    .order(cfg.order, { ascending: cfg.ascending })
  if (error) {
    // eslint-disable-next-line no-console
    console.error('[export] query failed:', error)
    return NextResponse.json({ error: "Erreur lors de l'export." }, { status: 500 })
  }

  return new NextResponse(toCSV((data ?? []) as unknown as Record<string, unknown>[]), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${table}.csv"`,
    },
  })
}
