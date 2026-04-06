import Image from 'next/image'
import type { ComponentProps } from 'react'

/**
 * Drop-in replacement for next/image for Shopify CDN images.
 * Passes `unoptimized` so Vercel never proxies/transforms them —
 * Shopify's CDN already serves optimized images via its own URL params.
 */
export function ShopifyImage(props: ComponentProps<typeof Image>) {
  return <Image {...props} unoptimized />
}
