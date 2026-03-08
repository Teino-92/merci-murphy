'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Reveal } from '@/components/ui/reveal'
import { InstagramLightbox } from './instagram-lightbox'

interface BeholdSize {
  mediaUrl: string
  height: number
  width: number
}

export interface FeedPost {
  id: string
  mediaType: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'
  mediaUrl: string
  thumbnailUrl?: string
  permalink: string
  caption?: string
  sizes?: {
    small?: BeholdSize
    medium?: BeholdSize
    large?: BeholdSize
    full?: BeholdSize
  }
}

interface ActivePost {
  src: string
  alt: string
  permalink: string
  isVideo: boolean
  videoSrc?: string
}

// 4-col × 3-row grid, all portrait/square — no wide landscape slots
// Post 3 (video) = full-height portrait on right col
const GRID_SLOTS = [
  { col: '1 / 2', row: '1 / 2' }, // small
  { col: '2 / 3', row: '1 / 3' }, // tall
  { col: '3 / 4', row: '1 / 2' }, // small
  { col: '4 / 5', row: '1 / 4' }, // video — full portrait
  { col: '1 / 2', row: '2 / 4' }, // tall
  { col: '3 / 4', row: '2 / 4' }, // tall
]

function getImgSrc(post: FeedPost, size: 'medium' | 'large' = 'medium') {
  return post.sizes?.[size]?.mediaUrl ?? post.sizes?.medium?.mediaUrl ?? post.mediaUrl
}

export function InstagramGrid({ posts }: { posts: FeedPost[] }) {
  const [active, setActive] = useState<ActivePost | null>(null)

  return (
    <>
      <div
        className="mt-8 grid gap-2"
        style={{
          gridTemplateColumns: 'repeat(4, 1fr)',
          gridTemplateRows: 'repeat(3, 200px)',
        }}
      >
        {posts.slice(0, 6).map((post, i) => {
          const slot = GRID_SLOTS[i]
          const imgSrc = getImgSrc(post)
          if (!imgSrc || !slot) return null

          const handleClick = () => {
            setActive({
              src: getImgSrc(post, 'large'),
              alt: post.caption?.slice(0, 80) ?? 'Merci Murphy Instagram',
              permalink: post.permalink,
              isVideo: post.mediaType === 'VIDEO',
              videoSrc: post.mediaType === 'VIDEO' ? post.mediaUrl : undefined,
            })
          }

          const isVideo = post.mediaType === 'VIDEO'

          return (
            <Reveal
              key={post.id}
              delay={i * 80}
              style={{ gridColumn: slot.col, gridRow: slot.row }}
              className="h-full"
            >
              {isVideo ? (
                // Video plays inline in the card
                <div className="group relative w-full h-full overflow-hidden rounded-2xl bg-black">
                  <video
                    src={post.mediaUrl}
                    poster={post.thumbnailUrl ?? imgSrc}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  {/* Link to Instagram on hover */}
                  <a
                    href={post.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 bg-[#1D164E]/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3"
                  >
                    {post.caption && (
                      <p className="text-cream text-xs leading-relaxed line-clamp-3">
                        {post.caption.replace(/#\w+/g, '').trim()}
                      </p>
                    )}
                  </a>
                </div>
              ) : (
                <button
                  onClick={handleClick}
                  className="group relative block w-full h-full overflow-hidden rounded-2xl bg-white/5 cursor-pointer"
                >
                  <Image
                    src={imgSrc}
                    alt={post.caption?.slice(0, 80) ?? 'Merci Murphy Instagram'}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-[#1D164E]/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                    {post.caption && (
                      <p className="text-cream text-xs leading-relaxed line-clamp-3 text-left">
                        {post.caption.replace(/#\w+/g, '').trim()}
                      </p>
                    )}
                  </div>
                  {post.mediaType === 'CAROUSEL_ALBUM' && (
                    <div className="absolute top-2 right-2">
                      <div className="rounded-full bg-black/50 p-1.5">
                        <svg
                          className="h-3 w-3 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <rect x="2" y="7" width="14" height="14" rx="2" />
                          <path d="M16 3h3a2 2 0 0 1 2 2v3" />
                        </svg>
                      </div>
                    </div>
                  )}
                </button>
              )}
            </Reveal>
          )
        })}
      </div>

      {active && (
        <InstagramLightbox
          src={active.src}
          alt={active.alt}
          permalink={active.permalink}
          isVideo={active.isVideo}
          videoSrc={active.videoSrc}
          onClose={() => setActive(null)}
        />
      )}
    </>
  )
}
