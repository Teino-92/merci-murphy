import Link from 'next/link'

import {
  CONTAINER,
  DisplayTitle,
  FOCUS_RING,
  RULED_ITEM,
  RULED_LIST,
  TEXT_LINK,
} from '@/components/ui/editorial'
import { SanityImage as Image } from '@/components/ui/sanity-image'
import { cn, BLUR_PLACEHOLDER, blurDataURL } from '@/lib/utils'
import { urlFor } from '@/sanity/client'
import type { PostSummary } from '@/sanity/queries/posts'
import { noOrphan } from '@/lib/typo'

interface HomeBlogV2Props {
  posts: PostSummary[]
}

function coverUrl(post: PostSummary, width: number, height: number) {
  if (!post.coverImage) return null

  return urlFor(post.coverImage).width(width).height(height).auto('format').quality(80).url()
}

function coverBlur(post: PostSummary) {
  if (!post.coverImage?.dominantColor) return BLUR_PLACEHOLDER

  return blurDataURL(post.coverImage.dominantColor)
}

/**
 *Blog v2.
 * Une à la une et une liste à filets, comme le sommaire d'un magazine. Les
 * catégories passent en italique Playfair (plus de capitales espacées), les
 * flèches disparaissent.
 */
export function HomeBlogV2({ posts }: HomeBlogV2Props) {
  if (posts.length === 0) return null

  const [main, ...rest] = posts
  const solo = rest.length === 0
  const mainSrc = coverUrl(main, 1200, 800)

  return (
    <section className="bg-white py-16 lg:py-24">
      <div className={CONTAINER}>
        <div className="flex flex-col gap-y-8 lg:flex-row lg:items-end lg:justify-between lg:gap-x-16">
          <div>
            <DisplayTitle>Conseils &amp; bien-être</DisplayTitle>
            <p className="mt-5 text-base leading-relaxed text-charcoal/70 lg:text-lg">
              Le blog merci murphy®.
            </p>
          </div>

          <Link href="/blog" className={cn(TEXT_LINK.light, 'self-start lg:mb-2 lg:self-auto')}>
            Tous les articles
          </Link>
        </div>

        <div
          className={cn(
            'mt-12 grid grid-cols-1 gap-y-12 lg:mt-16',
            !solo && 'lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] lg:gap-x-16'
          )}
        >
          <Link
            href={`/blog/${main.slug.current}`}
            className={cn(
              'group block',
              FOCUS_RING,
              solo && 'lg:grid lg:grid-cols-2 lg:items-center lg:gap-x-16'
            )}
          >
            <div className="relative aspect-[3/2] overflow-hidden bg-rose/30">
              {mainSrc && (
                <Image
                  src={mainSrc}
                  alt={main.coverImage?.alt ?? main.title}
                  fill
                  placeholder="blur"
                  blurDataURL={coverBlur(main)}
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none"
                  sizes="(min-width: 1024px) 55vw, 100vw"
                />
              )}
            </div>

            <div className="mt-6 lg:mt-7">
              <p className="font-display text-lg italic text-terracotta-dark">
                {noOrphan(main.category)}
              </p>
              <h3 className="mt-2 font-display text-3xl leading-[1.1] tracking-[-0.01em] text-charcoal transition-colors group-hover:text-terracotta-dark lg:text-[2.5rem]">
                {noOrphan(main.title)}
              </h3>
              <p className="mt-4 line-clamp-2 max-w-xl text-base leading-relaxed text-charcoal/70">
                {noOrphan(main.excerpt)}
              </p>
              <p className="mt-4 text-sm text-charcoal/60">{main.readingTime} min de lecture</p>
            </div>
          </Link>

          {!solo && (
            <ul className={cn(RULED_LIST, 'self-start')}>
              {rest.map((post) => {
                const src = coverUrl(post, 400, 300)

                return (
                  <li key={post._id} className={RULED_ITEM}>
                    <Link
                      href={`/blog/${post.slug.current}`}
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
                        <p className="mt-2.5 hidden text-[15px] leading-relaxed text-charcoal/70 lg:line-clamp-2">
                          {noOrphan(post.excerpt)}
                        </p>
                        <p className="mt-3 text-sm text-charcoal/60">
                          {post.readingTime} min de lecture
                        </p>
                      </div>

                      <div className="relative aspect-[4/3] w-24 shrink-0 overflow-hidden bg-rose/30 sm:w-32">
                        {src && (
                          <Image
                            src={src}
                            alt=""
                            fill
                            placeholder="blur"
                            blurDataURL={coverBlur(post)}
                            className="object-cover"
                            sizes="(min-width: 640px) 128px, 96px"
                          />
                        )}
                      </div>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}
