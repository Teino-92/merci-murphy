import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag, revalidatePath } from 'next/cache'
import { parseBody } from 'next-sanity/webhook'

interface SanityWebhookBody {
  _type?: string
  slug?: { current?: string } | string
}

const TYPE_TO_TAG: Record<string, string> = {
  service: 'sanity:service',
  siteSettings: 'sanity:site-settings',
  post: 'sanity:post',
  teamMember: 'sanity:team',
  testimonial: 'sanity:testimonial',
}

export async function POST(req: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET
  if (!secret) {
    return NextResponse.json({ message: 'Missing SANITY_REVALIDATE_SECRET' }, { status: 500 })
  }

  const { isValidSignature, body } = await parseBody<SanityWebhookBody>(req, secret)
  if (!isValidSignature) {
    return NextResponse.json({ message: 'Invalid signature' }, { status: 401 })
  }
  if (!body?._type) {
    return NextResponse.json({ message: 'Missing _type' }, { status: 400 })
  }

  const tag = TYPE_TO_TAG[body._type]
  if (!tag) {
    return NextResponse.json({ message: `Unknown type: ${body._type}` }, { status: 200 })
  }

  revalidateTag(tag)

  // Pages with hand-curated content benefit from path-level revalidation too
  if (body._type === 'siteSettings') revalidatePath('/', 'layout')
  if (body._type === 'service') {
    const slug = typeof body.slug === 'string' ? body.slug : body.slug?.current
    if (slug) revalidatePath(`/services/${slug}`)
    revalidatePath('/services')
    revalidatePath('/')
  }
  if (body._type === 'post') {
    const slug = typeof body.slug === 'string' ? body.slug : body.slug?.current
    if (slug) revalidatePath(`/blog/${slug}`)
    revalidatePath('/blog')
  }

  return NextResponse.json({ revalidated: true, tag, type: body._type })
}
