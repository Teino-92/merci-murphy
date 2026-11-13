import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { createHash, timingSafeEqual } from 'crypto'

// Constant-time comparison (hash first so lengths always match)
function secretMatches(given: string | null, expected: string | undefined): boolean {
  if (!given || !expected) return false
  const a = createHash('sha256').update(given).digest()
  const b = createHash('sha256').update(expected).digest()
  return timingSafeEqual(a, b)
}

export async function POST(req: NextRequest) {
  // Header preferred; query param kept for existing webhook configs
  const secret = req.headers.get('x-revalidate-secret') ?? req.nextUrl.searchParams.get('secret')

  if (!secretMatches(secret, process.env.SHOPIFY_REVALIDATE_SECRET)) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const handle = body?.handle as string | undefined

    // Invalidate all Shopify fetches
    revalidateTag('shopify')

    if (handle) {
      revalidatePath(`/shop/${handle}`)
    }

    revalidatePath('/shop')
    revalidatePath('/')

    return NextResponse.json({ revalidated: true })
  } catch {
    return NextResponse.json({ message: 'Error revalidating' }, { status: 500 })
  }
}
