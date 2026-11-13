import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { computeBookableSlots } from '@/lib/booking-availability'
import { SERVICE_DURATIONS } from '@/lib/booking-config'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = req.nextUrl
    const serviceSlug = searchParams.get('service') ?? ''
    const dateStr = searchParams.get('date') ?? ''

    if (!serviceSlug || !dateStr) {
      return NextResponse.json({ error: 'service and date required' }, { status: 400 })
    }

    const slugBase = serviceSlug.split('-')[0]

    // Display only: toilettage passes the dog's grooming duration. The booking
    // itself recomputes the duration server-side in /api/booking/confirm.
    let duration = SERVICE_DURATIONS[slugBase as keyof typeof SERVICE_DURATIONS] ?? 0
    if (duration === 0) duration = parseInt(searchParams.get('duration') ?? '0', 10)

    const result = await computeBookableSlots({
      userId: user.id,
      slugBase,
      dateStr,
      duration,
      staffId: searchParams.get('staffId'),
    })
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status })

    return NextResponse.json({ slots: result.slots })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
