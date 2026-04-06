import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { SanityImage } from '@/components/ui/sanity-image'
import { urlFor } from '@/sanity/client'
import { blurDataURL, BLUR_PLACEHOLDER } from '@/lib/utils'
import type { PostSummary } from '@/sanity/queries/posts'

export function FeaturedPost({ post }: { post: PostSummary }) {
  const imageSrc = post.coverImage
    ? urlFor(post.coverImage).width(1400).height(700).auto('format').quality(85).url()
    : null
  const blur = post.coverImage?.dominantColor
    ? blurDataURL(post.coverImage.dominantColor)
    : BLUR_PLACEHOLDER

  return (
    <Link
      href={`/blog/${post.slug.current}`}
      className="group block relative w-full overflow-hidden"
      style={{ minHeight: '420px' }}
    >
      {/* Background image */}
      {imageSrc && (
        <SanityImage
          src={imageSrc}
          alt={post.coverImage?.alt ?? post.title}
          fill
          placeholder="blur"
          blurDataURL={blur}
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="100vw"
        />
      )}
      {!imageSrc && <div className="absolute inset-0 bg-charcoal" />}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/30 to-transparent" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 px-6 py-10 sm:px-14 sm:py-14 max-w-3xl">
        {post.category && (
          <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.18em] text-terracotta-dark mb-4">
            {post.category}
          </span>
        )}
        <h2 className="font-display text-2xl font-bold text-cream sm:text-4xl leading-tight mb-4">
          {post.title}
        </h2>
        {post.excerpt && (
          <p className="text-sm leading-relaxed text-cream/70 max-w-xl mb-6 line-clamp-2">
            {post.excerpt}
          </p>
        )}
        <span className="inline-flex items-center gap-2 text-sm font-medium text-cream transition-all group-hover:gap-3">
          Lire l&apos;article <ArrowRight className="h-4 w-4 text-terracotta-dark" />
        </span>
      </div>
    </Link>
  )
}
