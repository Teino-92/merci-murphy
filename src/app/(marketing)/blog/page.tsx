// src/app/(marketing)/blog/page.tsx
import type { Metadata } from 'next'
import { getAllPosts } from '@/sanity/queries/posts'
import { PostCard } from '@/components/sections/post-card'
import { Section, Container } from '@/components/ui/section'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Blog — Conseils bien-être pour votre chien',
  description: "Conseils, bien-être, éducation et produits pour chiens par l'équipe merci murphy®.",
  openGraph: {
    images: [{ url: '/og/og-home.jpg', width: 1200, height: 630, alt: 'Blog — Merci Murphy' }],
  },
}

export default async function BlogPage() {
  const posts = await getAllPosts()

  const [featured, secondary, ...rest] = posts

  return (
    <>
      {/* Hero header */}
      <div className="bg-cream border-b border-charcoal/10 py-14">
        <Container className="max-w-6xl">
          <div className="flex items-center gap-3 mb-4">
            <span className="block w-6 h-px bg-terracotta-dark flex-shrink-0" />
            <span className="text-xs font-semibold tracking-widest uppercase text-terracotta-dark">
              Le blog merci murphy®
            </span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-normal text-charcoal">
            Conseils &amp; bien-être
          </h1>
        </Container>
      </div>

      <Section>
        <Container className="max-w-6xl">
          {posts.length === 0 && (
            <p className="text-charcoal/50 text-center py-20">Les articles arrivent bientôt…</p>
          )}

          {posts.length === 1 && featured && (
            <div className="max-w-xl mx-auto">
              <PostCard post={featured} variant="featured" />
            </div>
          )}

          {posts.length >= 2 && featured && (
            <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-12 lg:gap-16">
              {/* Left column */}
              <div className="flex flex-col gap-10">
                <PostCard post={featured} variant="featured" />
                {secondary && <PostCard post={secondary} variant="secondary" />}
              </div>

              {/* Right column — compact list */}
              <div className="flex flex-col gap-6 lg:border-l lg:border-charcoal/10 lg:pl-10">
                <p className="text-xs font-semibold uppercase tracking-widest text-charcoal/40">
                  À lire aussi
                </p>
                {rest.map((p) => (
                  <PostCard key={p._id} post={p} variant="secondary" />
                ))}
                {rest.length === 0 && (
                  <p className="text-sm text-charcoal/40">
                    D&apos;autres articles arrivent bientôt.
                  </p>
                )}
              </div>
            </div>
          )}
        </Container>
      </Section>
    </>
  )
}
