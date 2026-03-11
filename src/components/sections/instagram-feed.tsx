import { Instagram } from 'lucide-react'
import { Section, Container } from '@/components/ui/section'
import { InstagramGrid, type FeedPost } from './instagram-grid'

async function getInstagramPosts(feedId: string): Promise<FeedPost[]> {
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display text-3xl font-bold text-cream sm:text-4xl">
              Sur Instagram
            </h2>
            <p className="mt-2 text-cream/60">La vie de merci murphy® au quotidien.</p>
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

        <InstagramGrid posts={posts} />
      </Container>
    </Section>
  )
}
