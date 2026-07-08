'use client'

import Image from 'next/image'
import type { ComponentProps } from 'react'
import { sanityLoader } from '@/lib/sanity-loader'

/**
 * Drop-in replacement for next/image for Sanity CDN images.
 *
 * Uses a custom loader that rewrites Sanity's `?w=` from the width Next
 * requests (driven by `sizes` + DPR). This yields a real responsive
 * srcset so mobile downloads a small variant instead of the full
 * desktop-sized image. The image bytes are still served/resized by
 * Sanity's CDN — Vercel never proxies them.
 */
export function SanityImage(props: ComponentProps<typeof Image>) {
  return <Image {...props} loader={sanityLoader} />
}
