'use client'

import { useState } from 'react'
import Link from 'next/link'
import { BeforeAfterSlider } from '@/components/sections/before-after-slider'

interface PolaroidItem {
  before: string
  after: string
  name: string
  zoom?: number
}

const ITEMS: PolaroidItem[] = [
  { before: '/avant-apres-1-avant.jpg', after: '/avant-apres-1-apres.jpg', name: 'Maui' },
  { before: '/avant-apres-2-avant.jpg', after: '/avant-apres-2-apres.jpg', name: 'Samy' },
  { before: '/ariel-avant.jpg', after: '/ariel-apres.jpg', name: 'Ariel' },
]

const ROTATIONS = [-7, -1.5, 5]
const HOVER_ROTATIONS = [-10, 0, 8]
const OFFSETS = [-80, 0, 80] // décalage horizontal

export function PolaroidFan() {
  const [hovered, setHovered] = useState<number | null>(null)

  return (
    <div
      className="relative mx-auto mt-10 hidden sm:flex items-center justify-center"
      style={{ height: 640, width: 660 }}
    >
      {ITEMS.map((item, i) => {
        const isHovered = hovered === i
        const rot = isHovered ? HOVER_ROTATIONS[i] : ROTATIONS[i]
        const zIndex = isHovered ? 30 : i === 1 ? 20 : 10
        const tx = isHovered ? OFFSETS[i] * 1.3 : OFFSETS[i]

        return (
          <div
            key={i}
            className="absolute cursor-pointer"
            style={{
              transform: `translateX(${tx}px) rotate(${rot}deg)`,
              zIndex,
              transition: 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1)',
              width: 360,
            }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            <div className="bg-white shadow-xl" style={{ padding: '10px 10px 44px 10px' }}>
              <BeforeAfterSlider
                before={{ src: item.before, alt: 'Avant' }}
                after={{ src: item.after, alt: 'Après' }}
                zoom={item.zoom ?? 1}
                className="rounded-none"
              />
              <div className="mt-2 text-center">
                <p
                  className="text-lg font-semibold text-charcoal tracking-wide"
                  style={{ fontFamily: 'var(--font-display, serif)', fontStyle: 'italic' }}
                >
                  {item.name}
                </p>
                <Link
                  href="/services/le-toilettage-maison-poilus-r"
                  className="mt-1 block text-xs text-charcoal/50 hover:text-terracotta transition-colors font-medium tracking-wide"
                  style={{ fontFamily: 'var(--font-display, serif)', fontStyle: 'italic' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  Voir toutes les transformations →
                </Link>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
