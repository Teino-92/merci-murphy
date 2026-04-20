import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')

  if (secret !== process.env.SHOPIFY_REVALIDATE_SECRET) {
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
