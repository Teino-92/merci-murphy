import Link from 'next/link'

import { FOCUS_RING, RULED_ITEM } from '@/components/ui/editorial'
import { SanityImage as Image } from '@/components/ui/sanity-image'
import { cn, BLUR_PLACEHOLDER, blurDataURL } from '@/lib/utils'
import { urlFor } from '@/sanity/client'
import type { PostSummary } from '@/sanity/queries/posts'
import { noOrphan } from '@/lib/typo'

export function postCoverUrl(post: PostSummary, width: number, height: number) {
  if (!post.coverImage) return null

  return urlFor(post.coverImage).width(width).height(height).auto('format').quality(80).url()
}

export function postCoverBlur(post: PostSummary) {
  if (!post.coverImage?.dominantColor) return BLUR_PLACEHOLDER

  return blurDataURL(post.coverImage.dominantColor)
}

/**
 * Ligne de sommaire à filet : catégorie en italique, titre en H3, durée de
 * lecture, vignette à droite. À placer dans un `ul` portant `RULED_LIST`.
 */
export function PostRowV2({ post, href }: { post: PostSummary; href: string }) {
  const src = postCoverUrl(post, 400, 300)

  return (
    <li className={RULED_ITEM}>
      <Link
        href={href}
        className={cn(
          'group grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-5 py-6 lg:py-7',
          FOCUS_RING
        )}
      >
        <div>
          <p className="font-display text-base italic text-terracotta-dark">
            {noOrphan(post.category)}
          </p>
          <h3 className="mt-1.5 font-display text-xl leading-snug text-charcoal transition-colors group-hover:text-terracotta-dark sm:text-2xl sm:leading-snug">
            {noOrphan(post.title)}
          </h3>
          <p className="mt-3 text-sm text-charcoal/60">{post.readingTime} min de lecture</p>
        </div>

        <div className="relative aspect-[4/3] w-24 shrink-0 overflow-hidden bg-rose/30 sm:w-32">
          {src && (
            <Image
              src={src}
              alt=""
              fill
              placeholder="blur"
              blurDataURL={postCoverBlur(post)}
              className="object-cover"
              sizes="(min-width: 640px) 128px, 96px"
            />
          )}
        </div>
      </Link>
    </li>
  )
}
