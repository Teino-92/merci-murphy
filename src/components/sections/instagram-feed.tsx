import Image from 'next/image'
import Link from 'next/link'
import { Instagram } from 'lucide-react'
import { Section, Container } from '@/components/ui/section'
import { Reveal } from '@/components/ui/reveal'

interface BeholdPost {
  id: string
  mediaType: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'
  mediaUrl: string
  thumbnailUrl?: string
  permalink: string
  caption?: string
  sizes?: {
    medium?: { mediaUrl: string }
  }
}

async function getInstagramPosts(feedId: string): Promise<BeholdPost[]> {
  try {
    const res = await fetch(`https://feeds.behold.so/${feedId}`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return []
    const data = await res.json()
    const posts = data?.posts ?? (Array.isArray(data) ? data : [])
    return posts.slice(0, 6)
  } catch {
    return []
  }
}

interface InstagramFeedProps {
  feedId: string
}

export async function InstagramFeed({ feedId }: InstagramFeedProps) {
  const posts = await getInstagramPosts(feedId)

  if (posts.length === 0) return null

  return (
    <Section className="bg-[#1D164E]">
      <Container>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold text-cream sm:text-4xl">
              Sur Instagram
            </h2>
            <p className="mt-2 text-cream/60">La vie de Merci Murphy au quotidien.</p>
          </div>
          <a
            href="https://instagram.com/mercimurphy"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm font-medium text-terracotta hover:gap-2.5 transition-all"
          >
            <Instagram className="h-4 w-4" />
            Nous suivre
          </a>
        </div>
        <Reveal
          stagger=":scope > *"
          className="mt-8 grid grid-cols-3 gap-2 sm:grid-cols-6 sm:gap-3"
        >
          {posts.map((post) => {
            // Prefer stable Behold CDN URL over expiring Instagram CDN
            const imgSrc = post.sizes?.medium?.mediaUrl ?? post.mediaUrl
            if (!imgSrc) return null
            return (
              <Link
                key={post.id}
                href={post.permalink}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative aspect-square overflow-hidden rounded-xl bg-rose/20"
              >
                <Image
                  src={imgSrc}
                  alt={post.caption?.slice(0, 80) ?? 'Merci Murphy Instagram'}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 33vw, 16vw"
                />
                {post.mediaType === 'VIDEO' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="rounded-full bg-black/30 p-2">
                      <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                )}
              </Link>
            )
          })}
        </Reveal>
      </Container>
    </Section>
  )
}
