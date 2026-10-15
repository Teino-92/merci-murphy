// src/components/sections/home-blog.tsx
// Section blog de la home, format magazine : dernier article en grand + 2 précédents à droite.

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { SanityImage as Image } from '@/components/ui/sanity-image'
import { Section, Container } from '@/components/ui/section'
import { urlFor } from '@/sanity/client'
import { cn, BLUR_PLACEHOLDER, blurDataURL } from '@/lib/utils'
import type { PostSummary } from '@/sanity/queries/posts'

function coverUrl(post: PostSummary, width: number, height: number): string | null {
  if (!post.coverImage) return null
  return urlFor(post.coverImage).width(width).height(height).auto('format').quality(80).url()
}

function coverBlur(post: PostSummary): string {
  return post.coverImage?.dominantColor
    ? blurDataURL(post.coverImage.dominantColor)
    : BLUR_PLACEHOLDER
}

// solo : un seul article publié → image et texte côte à côte au lieu d'une image géante
function MainPost({ post, solo }: { post: PostSummary; solo: boolean }) {
  const src = coverUrl(post, 1200, 800)

  return (
    <Link
      href={`/blog/${post.slug.current}`}
      className={cn(
        'group flex flex-col',
        solo && 'lg:grid lg:grid-cols-2 lg:items-center lg:gap-10'
      )}
    >
      <div className="relative aspect-[3/2] overflow-hidden rounded-2xl bg-charcoal/10">
        {src && (
          <Image
            src={src}
            alt={post.coverImage?.alt ?? post.title}
            fill
            placeholder="blur"
            blurDataURL={coverBlur(post)}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 1024px) 100vw, 60vw"
          />
        )}
      </div>
      <div className={cn('mt-5', solo && 'lg:mt-0')}>
        <span className="text-xs font-semibold uppercase tracking-widest text-terracotta-dark">
          {post.category}
        </span>
        <h3 className="mt-2 font-display text-2xl font-semibold leading-tight text-charcoal transition-colors group-hover:text-terracotta-dark sm:text-3xl">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-charcoal/60 line-clamp-2">
            {post.excerpt}
          </p>
        )}
        <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-charcoal transition-all group-hover:gap-3">
          Lire l&apos;article <ArrowRight className="h-4 w-4 text-terracotta-dark" />
        </span>
      </div>
    </Link>
  )
}

// Mobile : vignette + texte en ligne. Desktop : image au-dessus, texte dessous.
function SidePost({ post }: { post: PostSummary }) {
  const src = coverUrl(post, 800, 400)

  return (
    <Link href={`/blog/${post.slug.current}`} className="group flex gap-4 lg:flex-col lg:gap-0">
      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-charcoal/10 lg:aspect-[2/1] lg:h-auto lg:w-full">
        {src && (
          <Image
            src={src}
            alt={post.coverImage?.alt ?? post.title}
            fill
            placeholder="blur"
            blurDataURL={coverBlur(post)}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 1024px) 96px, 35vw"
          />
        )}
      </div>
      <div className="min-w-0 lg:mt-3">
        <span className="text-xs font-semibold uppercase tracking-widest text-terracotta-dark">
          {post.category}
        </span>
        <h3 className="mt-1 font-display text-base font-semibold leading-snug text-charcoal line-clamp-2 transition-colors group-hover:text-terracotta-dark lg:text-lg">
          {post.title}
        </h3>
        <p className="mt-1 text-xs text-charcoal/50">{post.readingTime} min de lecture</p>
      </div>
    </Link>
  )
}

export function HomeBlog({ posts }: { posts: PostSummary[] }) {
  if (posts.length === 0) return null
  const [main, ...side] = posts

  return (
    <Section className="bg-cream">
      <Container>
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <span className="block h-px w-6 flex-shrink-0 bg-terracotta-dark" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-terracotta-dark">
                Le blog merci murphy®
              </span>
            </div>
            <h2 className="font-display text-2xl font-bold text-charcoal sm:text-3xl">
              Conseils &amp; bien-être
            </h2>
          </div>
          <Link
            href="/blog"
            className="hidden items-center gap-1 text-sm font-medium text-terracotta-dark transition-all hover:gap-2 sm:flex"
          >
            Tous les articles <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className={cn('grid gap-8', side.length > 0 && 'lg:grid-cols-5 lg:gap-10')}>
          <div className={cn(side.length > 0 && 'lg:col-span-3')}>
            <MainPost post={main} solo={side.length === 0} />
          </div>
          {side.length > 0 && (
            <div className="flex flex-col gap-6 border-t border-charcoal/10 pt-6 lg:col-span-2 lg:border-t-0 lg:pt-0">
              {side.map((post) => (
                <SidePost key={post._id} post={post} />
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link href="/blog" className="text-sm font-medium text-terracotta-dark hover:underline">
            Tous les articles →
          </Link>
        </div>
      </Container>
    </Section>
  )
}
