'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Reveal } from '@/components/ui/reveal'
import { InstagramLightbox } from './instagram-lightbox'
import { noOrphan } from '@/lib/typo'

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
  prunedCaption?: string
  colorPalette?: { dominant?: string; mutedDark?: string }
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

// Desktop: 4-col × 3-row grid
const GRID_SLOTS_DESKTOP = [
  { col: '1 / 2', row: '1 / 2' }, // small
  { col: '2 / 3', row: '1 / 4' }, // full tall (same as video)
  { col: '3 / 4', row: '1 / 2' }, // small
  { col: '4 / 5', row: '1 / 4' }, // video - full portrait
  { col: '1 / 2', row: '2 / 4' }, // tall
  { col: '3 / 4', row: '2 / 4' }, // tall
]

// Mobile: 2-col × 3-row grid, 4 posts only
// col1: tall (rows 1-2), small (row 3)
// col2: small (row 1), tall-video (rows 2-3)
const GRID_SLOTS_MOBILE = [
  { col: '1 / 2', row: '1 / 3' }, // tall portrait
  { col: '2 / 3', row: '1 / 2' }, // small square
  { col: '1 / 2', row: '3 / 4' }, // small square
  { col: '2 / 3', row: '2 / 4' }, // tall (video)
]

function getImgSrc(post: FeedPost, size: 'medium' | 'large' = 'medium') {
  if (post.sizes?.[size]?.mediaUrl) return post.sizes[size].mediaUrl
  if (post.sizes?.medium?.mediaUrl) return post.sizes.medium.mediaUrl
  // Vidéo : mediaUrl est le fichier vidéo, pas une image
  return post.mediaType === 'VIDEO' ? (post.thumbnailUrl ?? '') : post.mediaUrl
}

function getCaption(post: FeedPost) {
  return post.prunedCaption ?? post.caption?.replace(/#\w+/g, '').trim() ?? ''
}

// Couleur dominante Behold ("r,g,b") en fond pendant le chargement
function getPlaceholderStyle(post: FeedPost) {
  const rgb = post.colorPalette?.dominant
  return rgb ? { backgroundColor: `rgb(${rgb})` } : undefined
}

function PlayIcon() {
  return (
    <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <span className="rounded-full bg-black/45 p-3 backdrop-blur-sm">
        <svg
          className="h-5 w-5 translate-x-px text-white"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden
        >
          <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" />
        </svg>
      </span>
    </span>
  )
}

export function InstagramGrid({ posts }: { posts: FeedPost[] }) {
  const [active, setActive] = useState<ActivePost | null>(null)

  return (
    <>
      {/* Mobile grid: 2-col, 4 posts */}
      <div
        className="mt-8 grid gap-2 sm:hidden"
        style={{
          gridTemplateColumns: 'repeat(2, 1fr)',
          gridTemplateRows: 'repeat(3, 160px)',
        }}
      >
        {posts.slice(0, 4).map((post, i) => {
          const slot = GRID_SLOTS_MOBILE[i]
          const imgSrc = getImgSrc(post)
          if (!imgSrc || !slot) return null

          const handleClick = () => {
            setActive({
              src: getImgSrc(post, 'large'),
              alt: post.caption?.slice(0, 80) ?? 'merci murphy® Instagram',
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
              {/* Mobile : pas d'autoplay, vignette + lecture au tap (lightbox) */}
              <button
                onClick={handleClick}
                aria-label={isVideo ? 'Lire la vidéo' : 'Agrandir la photo'}
                style={getPlaceholderStyle(post)}
                className="group relative block w-full h-full overflow-hidden rounded-2xl bg-white/5 cursor-pointer"
              >
                <Image
                  unoptimized
                  src={imgSrc}
                  alt={getCaption(post).slice(0, 80) || 'merci murphy® Instagram'}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="50vw"
                />
                {isVideo && <PlayIcon />}
              </button>
            </Reveal>
          )
        })}
      </div>

      {/* Desktop grid: 4-col, 6 posts */}
      <div
        className="mt-8 hidden sm:grid gap-2"
        style={{
          gridTemplateColumns: 'repeat(4, 1fr)',
          gridTemplateRows: 'repeat(3, 200px)',
        }}
      >
        {posts.slice(0, 6).map((post, i) => {
          const slot = GRID_SLOTS_DESKTOP[i]
          const imgSrc = getImgSrc(post)
          if (!imgSrc || !slot) return null

          const handleClick = () => {
            setActive({
              src: getImgSrc(post, 'large'),
              alt: post.caption?.slice(0, 80) ?? 'merci murphy® Instagram',
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
                <div
                  style={getPlaceholderStyle(post)}
                  className="group relative w-full h-full overflow-hidden rounded-2xl bg-black"
                >
                  <video
                    src={post.mediaUrl}
                    poster={imgSrc}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <a
                    href={post.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Voir sur Instagram"
                    className="absolute inset-0 bg-[#4F6072]/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3"
                  >
                    {getCaption(post) && (
                      <p className="text-cream text-xs leading-relaxed line-clamp-3">
                        {noOrphan(getCaption(post))}
                      </p>
                    )}
                  </a>
                </div>
              ) : (
                <button
                  onClick={handleClick}
                  style={getPlaceholderStyle(post)}
                  className="group relative block w-full h-full overflow-hidden rounded-2xl bg-white/5 cursor-pointer"
                >
                  <Image
                    unoptimized
                    src={imgSrc}
                    alt={getCaption(post).slice(0, 80) || 'merci murphy® Instagram'}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, 25vw"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-[#4F6072]/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                    {getCaption(post) && (
                      <p className="text-cream text-xs leading-relaxed line-clamp-3 text-left">
                        {noOrphan(getCaption(post))}
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
