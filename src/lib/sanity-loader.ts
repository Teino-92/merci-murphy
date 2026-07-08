import type { ImageLoaderProps } from 'next/image'

/**
 * Next.js image loader for Sanity CDN URLs.
 *
 * Sanity's CDN resizes on the fly via `?w=`. We let Next drive the width
 * (from the `sizes` attribute + device DPR) instead of baking a fixed
 * `.width()` into the URL — so mobile downloads a small variant, not the
 * full desktop-sized image.
 *
 * The incoming `src` is already a `urlFor(...).url()` string. We:
 * - override `w` with Next's requested width,
 * - recompute `h` from the original aspect ratio (if the source pinned one),
 * - override `q` (quality) with Next's value,
 * - force `auto=format` for AVIF/WebP negotiation.
 */
export function sanityLoader({ src, width, quality }: ImageLoaderProps): string {
  const url = new URL(src)
  const params = url.searchParams

  const originalW = Number(params.get('w'))
  const originalH = Number(params.get('h'))

  params.set('w', String(width))

  // Preserve aspect ratio if the source pinned both dimensions.
  if (originalW > 0 && originalH > 0) {
    const ratio = originalH / originalW
    params.set('h', String(Math.round(width * ratio)))
  }

  params.set('q', String(quality ?? 80))
  params.set('auto', 'format')

  url.search = params.toString()
  return url.toString()
}
