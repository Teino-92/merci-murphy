// src/components/sections/post-card.tsx
import Link from 'next/link'
import Image from 'next/image'
import { urlFor } from '@/sanity/client'
import { cn, BLUR_PLACEHOLDER, blurDataURL } from '@/lib/utils'
import type { PostSummary } from '@/sanity/queries/posts'

interface PostCardProps {
  post: PostSummary
  variant: 'featured' | 'secondary' | 'compact'
  className?: string
}

export function PostCard({ post, variant, className }: PostCardProps) {
  const imageUrl = post.coverImage
    ? urlFor(post.coverImage).width(800).height(450).auto('format').quality(80).url()
    : null
  const blur = post.coverImage?.dominantColor
    ? blurDataURL(post.coverImage.dominantColor)
    : BLUR_PLACEHOLDER

  if (variant === 'compact') {
    return (
      <Link href={`/blog/${post.slug.current}`} className={cn('group flex flex-col', className)}>
        {imageUrl && (
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
            <Image
              src={imageUrl}
              alt={post.coverImage?.alt ?? post.title}
              fill
              placeholder="blur"
              blurDataURL={blur}
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, 33vw"
            />
          </div>
        )}
        <div className="mt-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-terracotta-dark">
            {post.category}
          </span>
          <h3 className="mt-1 font-display text-base font-semibold text-charcoal line-clamp-2 group-hover:text-terracotta-dark transition-colors">
            {post.title}
          </h3>
          <p className="mt-1 text-xs text-charcoal/50">{post.readingTime} min de lecture</p>
        </div>
      </Link>
    )
  }

  if (variant === 'secondary') {
    return (
      <Link
        href={`/blog/${post.slug.current}`}
        className={cn('group flex gap-4 items-start', className)}
      >
        {imageUrl && (
          <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg">
            <Image
              src={imageUrl}
              alt={post.coverImage?.alt ?? post.title}
              fill
              placeholder="blur"
              blurDataURL={blur}
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="80px"
            />
          </div>
        )}
        <div className="min-w-0">
          <span className="text-xs font-semibold uppercase tracking-widest text-terracotta-dark">
            {post.category}
          </span>
          <h3 className="mt-1 font-display text-sm font-semibold text-charcoal line-clamp-2 group-hover:text-terracotta-dark transition-colors">
            {post.title}
          </h3>
          <p className="mt-1 text-xs text-charcoal/50">{post.readingTime} min</p>
        </div>
      </Link>
    )
  }

  // featured
  return (
    <Link href={`/blog/${post.slug.current}`} className={cn('group flex flex-col', className)}>
      {imageUrl && (
        <div className="relative aspect-[16/9] overflow-hidden rounded-2xl">
          <Image
            src={imageUrl}
            alt={post.coverImage?.alt ?? post.title}
            fill
            placeholder="blur"
            blurDataURL={blur}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 1024px) 100vw, 60vw"
          />
        </div>
      )}
      <div className="mt-4">
        <span className="text-xs font-semibold uppercase tracking-widest text-terracotta-dark">
          {post.category}
        </span>
        <h2 className="mt-2 font-display text-2xl font-semibold text-charcoal line-clamp-3 group-hover:text-terracotta-dark transition-colors">
          {post.title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-charcoal/60 line-clamp-3">{post.excerpt}</p>
        <p className="mt-3 text-xs text-charcoal/40">{post.readingTime} min de lecture</p>
      </div>
    </Link>
  )
}
