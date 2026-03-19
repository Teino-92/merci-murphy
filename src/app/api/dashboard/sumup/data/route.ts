import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(req: NextRequest) {
  // Auth check
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = req.nextUrl
  const fromParam = searchParams.get('from')
  const toParam = searchParams.get('to')

  const dateRe = /^\d{4}-\d{2}-\d{2}$/
  if (!fromParam || !toParam || !dateRe.test(fromParam) || !dateRe.test(toParam)) {
    return NextResponse.json(
      { error: 'Invalid params. Use ?from=YYYY-MM-DD&to=YYYY-MM-DD' },
      { status: 400 }
    )
  }

  const period = `${fromParam}_${toParam}`

  const { data, error } = await supabaseAdmin
    .from('sumup_cache')
    .select('*')
    .eq('period', period)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data: data ?? null, period })
}
