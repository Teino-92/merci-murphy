// src/app/(marketing)/blog/[slug]/page.tsx
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SanityImage as Image } from '@/components/ui/sanity-image'
import type { Metadata } from 'next'
import {
  getAllPosts,
  getPostBySlug,
  getRelatedPosts,
  type PostDetail,
} from '@/sanity/queries/posts'
import { urlFor } from '@/sanity/client'
import { PortableText } from '@/components/sections/portable-text'
import { PostCard } from '@/components/sections/post-card'
import { BlogShopTeaser } from '@/components/sections/blog-shop-teaser'
import { Section, Container } from '@/components/ui/section'
import { BLUR_PLACEHOLDER, blurDataURL } from '@/lib/utils'
import { getAllProducts } from '@/lib/shopify'
import { pickBlogProducts } from '@/lib/blog-products'

export const revalidate = 3600

const SITE_URL = 'https://mercimurphy.com'

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

  const title = post.metaTitle ?? post.title
  const description = post.metaDescription ?? post.excerpt
  const url = `${SITE_URL}/blog/${post.slug.current}`

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'article',
      publishedTime: post.publishedAt,
      images: [{ url: ogImage, width: 1200, height: 630, alt: post.coverImage?.alt ?? post.title }],
    },
  }
}

function buildJsonLd(post: PostDetail) {
  const url = `${SITE_URL}/blog/${post.slug.current}`
  const article = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.metaDescription ?? post.excerpt,
    url,
    mainEntityOfPage: url,
    datePublished: post.publishedAt,
    dateModified: post._updatedAt,
    inLanguage: 'fr-FR',
    ...(post.coverImage ? { image: urlFor(post.coverImage).width(1200).height(630).url() } : {}),
    author: { '@type': 'Organization', name: 'merci murphy®', url: SITE_URL },
    publisher: {
      '@type': 'Organization',
      name: 'merci murphy®',
      url: SITE_URL,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo-email-white.png` },
    },
  }
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog` },
      { '@type': 'ListItem', position: 3, name: post.title, item: url },
    ],
  }
  if (!post.faq || post.faq.length === 0) return [article, breadcrumb]
  const faqPage = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: post.faq.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  }
  return [article, faqPage, breadcrumb]
}

export default async function BlogArticlePage({ params }: Props) {
  const [post, allProducts] = await Promise.all([getPostBySlug(params.slug), getAllProducts()])

  if (!post) notFound()

  const related = await getRelatedPosts({
    slug: params.slug,
    category: post.category,
    animal: post.animal,
  })

  const shopProducts = pickBlogProducts(allProducts, post)

  const coverImageUrl = post.coverImage
    ? urlFor(post.coverImage).width(1400).height(788).auto('format').quality(85).url()
    : null
  const coverBlur = post.coverImage?.dominantColor
    ? blurDataURL(post.coverImage.dominantColor)
    : BLUR_PLACEHOLDER

  const publishedDate = new Date(post.publishedAt).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  // Échappe "<" : le contenu est généré et ne doit pas pouvoir fermer la balise <script>.
  const jsonLd = JSON.stringify(buildJsonLd(post)).replace(/</g, '\\u003c')

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />

      {/* Cover image */}
      {coverImageUrl && (
        <div className="relative w-full aspect-[16/9] max-h-[560px] overflow-hidden bg-charcoal/10">
          <Image
            src={coverImageUrl}
            alt={post.coverImage?.alt ?? post.title}
            fill
            priority
            placeholder="blur"
            blurDataURL={coverBlur}
            className="object-cover"
            sizes="100vw"
          />
          {post.coverImage?.creditName && (
            <p className="absolute bottom-2 right-3 rounded bg-charcoal/50 px-2 py-0.5 text-[11px] text-cream/90">
              Photo :{' '}
              {post.coverImage.creditUrl ? (
                <a
                  href={post.coverImage.creditUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2"
                >
                  {post.coverImage.creditName}
                </a>
              ) : (
                post.coverImage.creditName
              )}{' '}
              sur{' '}
              <a
                href="https://unsplash.com/?utm_source=merci_murphy&utm_medium=referral"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2"
              >
                Unsplash
              </a>
            </p>
          )}
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

      {/* FAQ — rendue en clair (pas d'accordéon) pour être lisible par Google et les LLM */}
      {post.faq && post.faq.length > 0 && (
        <Section className="pt-0 pb-16">
          <Container className="max-w-2xl">
            <h2 className="mb-6 font-display text-2xl font-semibold text-charcoal">
              Questions fréquentes
            </h2>
            <div className="divide-y divide-charcoal/10">
              {post.faq.map((f) => (
                <div key={f._key} className="py-5">
                  <h3 className="mb-2 font-medium text-charcoal">{f.question}</h3>
                  <p className="leading-relaxed text-charcoal/70">{f.answer}</p>
                </div>
              ))}
            </div>
          </Container>
        </Section>
      )}

      {/* CTA page race */}
      {post.race && (
        <Section className="pt-0 pb-16">
          <Container className="max-w-2xl text-center">
            <Link
              href={`/toilettage/${post.race}`}
              className="inline-block rounded-full bg-terracotta-dark px-8 py-3 text-sm font-semibold text-cream transition-opacity hover:opacity-90"
            >
              Le toilettage de cette race chez merci murphy
            </Link>
          </Container>
        </Section>
      )}

      {/* Shop teaser */}
      <BlogShopTeaser products={shopProducts} animal={post.race ? 'chien' : post.animal} />

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
