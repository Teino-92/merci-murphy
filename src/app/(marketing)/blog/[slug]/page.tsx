// src/app/(marketing)/blog/[slug]/page.tsx
export const revalidate = 3600

import { notFound } from 'next/navigation'
import Image from 'next/image'
import type { Metadata } from 'next'
import { getAllPosts, getPostBySlug, getRelatedPosts } from '@/sanity/queries/posts'
import { urlFor } from '@/sanity/client'
import { PortableText } from '@/components/sections/portable-text'
import { PostCard } from '@/components/sections/post-card'
import { Section, Container } from '@/components/ui/section'
import { BLUR_PLACEHOLDER } from '@/lib/utils'

interface Props {
  params: { slug: string }
}

export async function generateStaticParams() {
  const posts = await getAllPosts()
  return posts.map((p) => ({ slug: p.slug.current }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPostBySlug(params.slug)
  if (!post) return {}

  const ogImage = post.coverImage
    ? urlFor(post.coverImage).width(1200).height(630).url()
    : '/og/og-home.jpg'

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      images: [{ url: ogImage, width: 1200, height: 630, alt: post.title }],
    },
  }
}

export default async function BlogArticlePage({ params }: Props) {
  const [post, related] = await Promise.all([
    getPostBySlug(params.slug),
    getRelatedPosts(params.slug),
  ])

  if (!post) notFound()

  const coverImageUrl = post.coverImage
    ? urlFor(post.coverImage).width(1400).height(788).auto('format').quality(85).url()
    : null

  const publishedDate = new Date(post.publishedAt).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <>
      {/* Cover image */}
      {coverImageUrl && (
        <div className="relative w-full aspect-[16/9] max-h-[560px] overflow-hidden bg-charcoal/10">
          <Image
            src={coverImageUrl}
            alt={post.coverImage?.alt ?? post.title}
            fill
            priority
            placeholder="blur"
            blurDataURL={BLUR_PLACEHOLDER}
            className="object-cover"
            sizes="100vw"
          />
        </div>
      )}

      {/* Article header */}
      <Section className="pt-10 pb-0">
        <Container className="max-w-2xl text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-xs font-semibold uppercase tracking-widest text-terracotta-dark">
              {post.category}
            </span>
            <span className="text-charcoal/30">·</span>
            <span className="text-xs text-charcoal/50">{post.readingTime} min de lecture</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-normal text-charcoal leading-tight">
            {post.title}
          </h1>
          <p className="mt-4 text-sm text-charcoal/40">
            L&apos;équipe Merci Murphy · {publishedDate}
          </p>
        </Container>
      </Section>

      {/* Divider */}
      <Section className="py-6">
        <Container className="max-w-2xl">
          <hr className="border-charcoal/10" />
        </Container>
      </Section>

      {/* Body */}
      <Section className="pt-0 pb-16">
        <Container className="max-w-2xl">
          <PortableText value={post.body} />
        </Container>
      </Section>

      {/* À lire aussi — only when >= 2 related posts */}
      {related.length >= 2 && (
        <Section className="border-t border-charcoal/10 bg-cream/50">
          <Container className="max-w-6xl">
            <div className="flex items-center gap-3 mb-8">
              <span className="block w-6 h-px bg-terracotta-dark flex-shrink-0" />
              <span className="text-xs font-semibold uppercase tracking-widest text-terracotta-dark">
                À lire aussi
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {related.map((p) => (
                <PostCard key={p._id} post={p} variant="compact" />
              ))}
            </div>
          </Container>
        </Section>
      )}
    </>
  )
}
