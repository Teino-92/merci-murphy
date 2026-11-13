import type { FeedPost } from '@/components/sections/instagram-grid'
import { InstagramGridLazy } from '@/components/sections/instagram-grid-lazy'
import { CONTAINER, DisplayTitle, TEXT_LINK } from '@/components/ui/editorial'
import { cn } from '@/lib/utils'

interface InstagramFeedV2Props {
  feedId: string
}

type BeholdResponse = { posts?: FeedPost[] } | FeedPost[] | null

// Même source que la section actuelle (dupliquée le temps du BAT pour ne pas
// toucher au composant en production).
async function getInstagramPosts(feedId: string): Promise<FeedPost[]> {
  try {
    const res = await fetch(`https://feeds.behold.so/${feedId}`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return []

    const data = (await res.json()) as BeholdResponse
    const posts = Array.isArray(data) ? data : (data?.posts ?? [])

    return posts.slice(0, 6)
  } catch {
    return []
  }
}

/**
 *Instagram v2.
 * Seul l'en-tête change (titre à l'échelle des autres sections, lien souligné
 * sans icône) ; la grille existante est conservée, coins resserrés.
 */
export async function InstagramFeedV2({ feedId }: InstagramFeedV2Props) {
  const posts = await getInstagramPosts(feedId)

  if (posts.length === 0) return null

  return (
    <section className="bg-[#4F6072] py-16 lg:py-24">
      <div className={CONTAINER}>
        <div className="flex flex-col gap-y-8 lg:flex-row lg:items-end lg:justify-between lg:gap-x-16">
          <div>
            <DisplayTitle surface="slate">Sur Instagram</DisplayTitle>
            <p className="mt-5 text-base leading-relaxed text-cream/85 lg:text-lg">
              La vie de merci murphy® au quotidien.
            </p>
          </div>

          <a
            href="https://instagram.com/mercimurphy"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(TEXT_LINK.slate, 'self-start lg:mb-2 lg:self-auto')}
          >
            Nous suivre
          </a>
        </div>

        <div className="mt-4 lg:mt-8 [&_.rounded-2xl]:rounded-[3px]">
          <InstagramGridLazy posts={posts} />
        </div>
      </div>
    </section>
  )
}
