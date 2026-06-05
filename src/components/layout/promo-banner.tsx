'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'
import { isPromoLive, type PromoBanner as PromoBannerData } from '@/sanity/queries/site-settings'

const STORAGE_KEY = 'mm-promo-banner-dismissed'

const THEME_CLASSES: Record<NonNullable<PromoBannerData['theme']>, string> = {
  terracotta: 'bg-terracotta-dark text-white',
  charcoal: 'bg-charcoal text-cream',
  rose: 'bg-rose text-charcoal',
}

interface Props {
  banner: PromoBannerData
}

export function PromoBanner({ banner }: Props) {
  const [dismissed, setDismissed] = useState(true)
  const [live, setLive] = useState(() => isPromoLive(banner))

  useEffect(() => {
    if (!banner.message) return
    const stored = window.localStorage.getItem(STORAGE_KEY)
    setDismissed(stored === banner.message)
  }, [banner.message])

  // Auto-hide when endDate passes without needing a page reload.
  useEffect(() => {
    setLive(isPromoLive(banner))
    if (!banner.endDate) return
    const ms = new Date(banner.endDate).getTime() - Date.now()
    if (ms <= 0 || ms > 2_147_483_647) return
    const t = setTimeout(() => setLive(false), ms)
    return () => clearTimeout(t)
  }, [banner])

  if (!live || !banner.message || dismissed) return null

  const theme = banner.theme ?? 'terracotta'
  const themeClass = THEME_CLASSES[theme]
  const hasCta = Boolean(banner.ctaLabel && banner.ctaHref)

  const handleDismiss = () => {
    if (banner.message) window.localStorage.setItem(STORAGE_KEY, banner.message)
    setDismissed(true)
  }

  const segment = (
    <span className="mx-8 inline-flex items-center gap-3 text-sm font-medium">
      <span>{banner.message}</span>
      {hasCta && (
        <Link
          href={banner.ctaHref!}
          className="underline-offset-4 hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {banner.ctaLabel} →
        </Link>
      )}
      <span aria-hidden="true" className="opacity-60">
        •
      </span>
    </span>
  )

  return (
    <div className={`relative overflow-hidden ${themeClass}`} role="region" aria-label="Promotion">
      <div className="flex items-center">
        <div
          className="flex-1 overflow-hidden py-2.5"
          style={{
            maskImage: 'linear-gradient(to right, transparent, black 4%, black 96%, transparent)',
            WebkitMaskImage:
              'linear-gradient(to right, transparent, black 4%, black 96%, transparent)',
          }}
        >
          <div className="promo-marquee flex w-max whitespace-nowrap">
            <div className="flex">
              {segment}
              {segment}
              {segment}
              {segment}
            </div>
            <div className="flex" aria-hidden="true">
              {segment}
              {segment}
              {segment}
              {segment}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Fermer le bandeau promo"
          className="mr-3 shrink-0 rounded p-1 opacity-80 transition-opacity hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <style jsx>{`
        .promo-marquee {
          animation: promo-scroll 40s linear infinite;
        }
        .promo-marquee:hover {
          animation-play-state: paused;
        }
        @keyframes promo-scroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .promo-marquee {
            animation: none;
          }
        }
      `}</style>
    </div>
  )
}
