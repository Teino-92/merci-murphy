import Image from 'next/image'
import type { ComponentProps } from 'react'

/**
 * Drop-in replacement for next/image for Sanity CDN images.
 * Passes `unoptimized` so Vercel never proxies/transforms them —
 * Sanity's CDN already handles resizing and format conversion via urlFor().
 */
export function SanityImage(props: ComponentProps<typeof Image>) {
  return <Image {...props} unoptimized />
}
