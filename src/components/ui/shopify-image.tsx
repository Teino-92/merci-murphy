import Image from 'next/image'
import type { ComponentProps } from 'react'

/**
 * Drop-in replacement for next/image for Shopify CDN images.
 * Uses Shopify's own CDN URL params (?width=&format=webp) for resizing
 * so Vercel never proxies the image — zero cost, full performance.
 */

function shopifyImageUrl(src: string, width: number): string {
  try {
    const url = new URL(src)
    url.searchParams.set('width', String(width))
    url.searchParams.set('format', 'webp')
    return url.toString()
  } catch {
    return src
  }
}

const WIDTHS = [400, 800, 1200, 1600]

function loader({ src, width }: { src: string; width: number }): string {
  // Round up to nearest bucket to maximise cache hits
  const bucket = WIDTHS.find((w) => w >= width) ?? WIDTHS[WIDTHS.length - 1]
  return shopifyImageUrl(src, bucket)
}

export function ShopifyImage(props: ComponentProps<typeof Image>) {
  return <Image {...props} loader={loader} unoptimized={false} />
}
