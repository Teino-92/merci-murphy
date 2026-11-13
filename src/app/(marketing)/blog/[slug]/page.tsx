import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { BlogShopTeaserV2 } from '@/components/sections/blog-shop-teaser-v2'
import { PortableText } from '@/components/sections/portable-text'
import { PostRowV2 } from '@/components/sections/post-row-v2'
import { Button } from '@/components/ui/button'
import {
  CONTAINER,
  DisplayTitle,
  RULED_ITEM,
  RULED_LIST,
  TEXT_LINK,
} from '@/components/ui/editorial'
import { SanityImage as Image } from '@/components/ui/sanity-image'
import { pickBlogProducts } from '@/lib/blog-products'
import { getAllProducts } from '@/lib/shopify'
import { cn, BLUR_PLACEHOLDER, blurDataURL } from '@/lib/utils'
import { urlFor } from '@/sanity/client'
import {
  getAllPosts,
  getPostBySlug,
  getRelatedPosts,
  type PostDetail,
} from '@/sanity/queries/posts'
import { noOrphan } from '@/lib/typo'

export const revalidate = 3600

const SITE_URL = 'https://mercimurphy.com'

const SPLIT = cn(
  CONTAINER,
  'grid grid-cols-1 gap-y-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,2.1fr)] lg:gap-x-16'
)
const STICKY = 'lg:sticky lg:top-28 lg:self-start'

// Le composant PortableText est partagé : on règle la typo de lecture depuis
// le conteneur (sélecteurs descendants, plus spécifiques que ses classes).
const ARTICLE_BODY = cn(
  'max-w-2xl',
  '[&>*:first-child]:mt-0',
  '[&_p]:mb-6 [&_p]:text-[17px] [&_p]:leading-[1.75] [&_p]:text-charcoal/80',
  '[&_ul]:mb-6 [&_ul]:space-y-2 [&_ul]:text-[17px] [&_ul]:leading-[1.75] [&_ul]:text-charcoal/80',
  '[&_h2]:mb-5 [&_h2]:mt-14 [&_h2]:text-[1.75rem] [&_h2]:font-normal [&_h2]:leading-tight lg:[&_h2]:text-[2rem]',
  '[&_h3]:mb-3 [&_h3]:mt-10 [&_h3]:text-[1.375rem] [&_h3]:font-normal [&_h3]:leading-snug'
)

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

function CoverCredit({ post }: { post: PostDetail }) {
  const credit = post.coverImage
  if (!credit?.creditName) return null

  return (
    <figcaption className="mt-3 text-xs text-charcoal/60">
      Photo&nbsp;:{' '}
      {credit.creditUrl ? (
        <a
          href={credit.creditUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-terracotta-dark"
        >
          {credit.creditName}
        </a>
      ) : (
        credit.creditName
      )}{' '}
      sur{' '}
      <a
        href="https://unsplash.com/?utm_source=merci_murphy&utm_medium=referral"
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2 hover:text-terracotta-dark"
      >
        Unsplash
      </a>
    </figcaption>
  )
}

/**
 * Article de blog. Le titre passe avant la photo, en grand ; le corps prend
 * une mesure de lecture confortable ; la FAQ reste rendue en clair (pas
 * d'accordéon) pour Google et les LLM.
 */
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
    ? urlFor(post.coverImage).width(1600).height(800).auto('format').quality(85).url()
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

      <header className="bg-cream pt-14 lg:pt-20">
        <div className={cn(CONTAINER, coverImageUrl ? 'pb-10 lg:pb-14' : 'pb-16 lg:pb-20')}>
          <div className="max-w-4xl">
            <p className="font-display text-lg italic text-terracotta-dark lg:text-xl">
              {noOrphan(post.category)}
            </p>
            <h1 className="mt-3 font-display text-4xl leading-[1.08] tracking-[-0.015em] text-charcoal sm:text-5xl lg:text-[3.75rem]">
              {noOrphan(post.title)}
            </h1>
            <p className="mt-6 text-sm text-charcoal/60">
              L&apos;équipe Merci Murphy, {publishedDate}. {post.readingTime} min de lecture
            </p>
          </div>
        </div>
      </header>

      {coverImageUrl && (
        <div className="relative">
          <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1/2 bg-cream" />
          <figure className={cn(CONTAINER, 'relative')}>
            <div className="relative aspect-[3/2] overflow-hidden bg-rose/30 sm:aspect-[2/1]">
              <Image
                src={coverImageUrl}
                alt={post.coverImage?.alt ?? post.title}
                fill
                priority
                placeholder="blur"
                blurDataURL={coverBlur}
                className="object-cover"
                sizes="(min-width: 1280px) 1200px, 100vw"
              />
            </div>
            <CoverCredit post={post} />
          </figure>
        </div>
      )}

      <section className="bg-white py-14 lg:py-20">
        <div className={SPLIT}>
          <div className={cn(STICKY, 'hidden lg:block')}>
            <Link href="/blog" className={TEXT_LINK.light}>
              Tous les articles
            </Link>
          </div>

          <div>
            <PortableText value={post.body} className={ARTICLE_BODY} />

            {post.race && (
              <div className="mt-12 max-w-2xl border-t border-charcoal/15 pt-8">
                <Button
                  asChild
                  size="lg"
                  className="h-auto min-h-12 w-full whitespace-normal bg-terracotta-dark px-8 py-3 text-center text-[15px] leading-snug text-white hover:bg-terracotta-dark/90 sm:w-auto"
                >
                  <Link href={`/toilettage/${post.race}`}>
                    Le toilettage de cette race chez merci murphy
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FAQ rendue en clair (pas d'accordéon) pour être lisible par Google et les LLM */}
      {post.faq && post.faq.length > 0 && (
        <section className="bg-cream py-16 lg:py-24">
          <div className={SPLIT}>
            <div className={STICKY}>
              <DisplayTitle size="compact">Questions fréquentes</DisplayTitle>
            </div>
            <ul className={cn(RULED_LIST, 'max-w-2xl')}>
              {post.faq.map((f) => (
                <li key={f._key} className={cn(RULED_ITEM, 'py-6 lg:py-7')}>
                  <h3 className="font-display text-xl leading-snug text-charcoal lg:text-[1.375rem]">
                    {noOrphan(f.question)}
                  </h3>
                  <p className="mt-3 text-base leading-relaxed text-charcoal/75">
                    {noOrphan(f.answer)}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <BlogShopTeaserV2 products={shopProducts} animal={post.race ? 'chien' : post.animal} />

      {related.length >= 2 && (
        <section className="bg-white py-16 lg:py-24">
          <div className={SPLIT}>
            <div className={STICKY}>
              <p className="font-display text-2xl italic text-charcoal lg:text-3xl">À lire aussi</p>
              <Link href="/blog" className={cn(TEXT_LINK.light, 'mt-6 inline-block')}>
                Tous les articles
              </Link>
            </div>
            <ul className={RULED_LIST}>
              {related.map((p) => (
                <PostRowV2 key={p._id} post={p} href={`/blog/${p.slug.current}`} />
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  )
}
