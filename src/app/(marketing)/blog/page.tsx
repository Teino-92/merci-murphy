import type { Metadata } from 'next'
import Link from 'next/link'

import { PageHeaderV2 } from '@/components/sections/page-header-v2'
import { PostRowV2, postCoverBlur, postCoverUrl } from '@/components/sections/post-row-v2'
import { CONTAINER, FOCUS_RING, RULED_LIST } from '@/components/ui/editorial'
import { SanityImage as Image } from '@/components/ui/sanity-image'
import { cn } from '@/lib/utils'
import { getAllPosts, type PostSummary } from '@/sanity/queries/posts'
import { noOrphan } from '@/lib/typo'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Blog — Conseils bien-être pour votre chien',
  description: "Conseils, bien-être, éducation et produits pour chiens par l'équipe merci murphy®.",
  openGraph: {
    images: [{ url: '/og/og-home.jpg', width: 1200, height: 630, alt: 'Blog — Merci Murphy' }],
  },
}

function FeaturedPost({ post, solo }: { post: PostSummary; solo: boolean }) {
  const src = postCoverUrl(post, 1400, 933)

  return (
    <Link
      href={`/blog/${post.slug.current}`}
      className={cn(
        'group grid grid-cols-1 gap-y-7 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:items-end lg:gap-x-16',
        FOCUS_RING,
        solo && 'lg:items-center'
      )}
    >
      <div className="relative aspect-[3/2] overflow-hidden bg-rose/30">
        {src && (
          <Image
            src={src}
            alt={post.coverImage?.alt ?? post.title}
            fill
            priority
            placeholder="blur"
            blurDataURL={postCoverBlur(post)}
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none"
            sizes="(min-width: 1024px) 55vw, 100vw"
          />
        )}
      </div>

      <div className="lg:pb-2">
        <p className="font-display text-lg italic text-terracotta-dark">
          {noOrphan(post.category)}
        </p>
        <h2 className="mt-2 font-display text-3xl leading-[1.1] tracking-[-0.01em] text-charcoal transition-colors group-hover:text-terracotta-dark lg:text-[2.75rem]">
          {noOrphan(post.title)}
        </h2>
        <p className="mt-5 line-clamp-3 max-w-xl text-base leading-relaxed text-charcoal/70 lg:text-lg">
          {noOrphan(post.excerpt)}
        </p>
        <p className="mt-5 text-sm text-charcoal/60">{post.readingTime} min de lecture</p>
      </div>
    </Link>
  )
}

/**
 * Blog : H1, article à la une en H2, les autres en H3. La une passe en grand
 * format, le reste en sommaire à filets sur deux colonnes.
 */
export default async function BlogPage() {
  const posts = await getAllPosts()
  const [featured, ...others] = posts

  return (
    <>
      <PageHeaderV2 title="Conseils & bien-être" sub="Le blog merci murphy®" />

      <section className="bg-white py-16 lg:py-24">
        <div className={CONTAINER}>
          {!featured && (
            <p className="py-10 text-base text-charcoal/70">Les articles arrivent bientôt…</p>
          )}

          {featured && <FeaturedPost post={featured} solo={others.length === 0} />}

          {featured && (
            <div className="mt-16 grid grid-cols-1 gap-y-6 lg:mt-24 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,2.1fr)] lg:gap-x-16">
              <p className="font-display text-2xl italic text-charcoal lg:sticky lg:top-28 lg:self-start lg:text-3xl">
                À lire aussi
              </p>

              {others.length > 0 ? (
                <ul className={cn(RULED_LIST, 'grid grid-cols-1 gap-x-10 xl:grid-cols-2')}>
                  {others.map((post) => (
                    <PostRowV2 key={post._id} post={post} href={`/blog/${post.slug.current}`} />
                  ))}
                </ul>
              ) : (
                <p className="text-base text-charcoal/70">
                  D&apos;autres articles arrivent bientôt.
                </p>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
