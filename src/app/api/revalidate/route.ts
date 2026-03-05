import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')

  if (secret !== process.env.SHOPIFY_REVALIDATE_SECRET) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const handle = body?.handle as string | undefined

    if (handle) {
      // Revalidate the specific product page
      revalidatePath(`/shop/${handle}`)
    }

    // Always revalidate the shop index and homepage (stock badges, featured products)
    revalidatePath('/shop')
    revalidatePath('/')

    return NextResponse.json({ revalidated: true })
  } catch {
    return NextResponse.json({ message: 'Error revalidating' }, { status: 500 })
  }
}
