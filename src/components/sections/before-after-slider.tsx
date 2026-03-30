'use client'

import { useRef, useState, useCallback } from 'react'
import Image from 'next/image'

interface BeforeAfterSliderProps {
  before?: { src: string; alt?: string }
  after?: { src: string; alt?: string }
  beforeColor?: string
  afterColor?: string
  zoom?: number
}

export function BeforeAfterSlider({
  before,
  after,
  beforeColor,
  afterColor,
  zoom = 1,
}: BeforeAfterSliderProps) {
  const [position, setPosition] = useState(50)
  const [active, setActive] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const updateFromClient = useCallback((clientX: number) => {
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width))
    setPosition((x / rect.width) * 100)
  }, [])

  const onMouseMove = (e: React.MouseEvent) => updateFromClient(e.clientX)
  const onTouchMove = (e: React.TouchEvent) => updateFromClient(e.touches[0].clientX)

  const isPhoto = !!(before?.src || after?.src)

  return (
    <div
      ref={containerRef}
      // Portrait 3:4 for real photos, square for color placeholders
      className={`relative w-full overflow-hidden rounded-2xl cursor-none select-none bg-[#F5F0E8] ${isPhoto ? 'aspect-[3/4]' : 'aspect-square'}`}
      onMouseMove={onMouseMove}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      onTouchMove={onTouchMove}
    >
      {/* After (base layer) */}
      <div className="absolute inset-0">
        {after ? (
          <Image
            src={after.src}
            alt={after.alt ?? 'Après'}
            fill
            className="object-cover object-center"
            style={{ transform: `scale(${zoom})` }}
            sizes="(max-width: 640px) 100vw, 25vw"
          />
        ) : (
          <div
            className="h-full w-full flex items-center justify-center"
            style={{ background: afterColor }}
          >
            <span className="text-white/60 text-sm font-medium">Après</span>
          </div>
        )}
      </div>

      {/* Before (clipped layer) — clips the full-width container, not just a narrow div */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0 round 16px 0 0 16px)` }}
      >
        {before ? (
          <Image
            src={before.src}
            alt={before.alt ?? 'Avant'}
            fill
            className="object-cover object-center"
            style={{ transform: `scale(${zoom})` }}
            sizes="(max-width: 640px) 100vw, 25vw"
          />
        ) : (
          <div
            className="h-full w-full flex items-center justify-center"
            style={{ background: beforeColor }}
          >
            <span className="text-white/60 text-sm font-medium">Avant</span>
          </div>
        )}
      </div>

      {/* Divider line */}
      <div
        className="absolute inset-y-0 z-10 w-0.5 bg-white/90 pointer-events-none shadow-sm"
        style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
      />

      {/* Handle */}
      <div
        className="absolute z-20 pointer-events-none flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-lg transition-opacity duration-200"
        style={{
          left: `${position}%`,
          top: '50%',
          transform: 'translate(-50%, -50%)',
          opacity: active ? 1 : 0.7,
        }}
      >
        <svg
          className="h-4 w-4 text-charcoal"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l-4 3 4 3M16 9l4 3-4 3" />
        </svg>
      </div>

      {/* Avant / Après labels */}
      {isPhoto && (
        <>
          <span
            className="absolute bottom-3 left-3 z-10 rounded-full bg-black/40 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm pointer-events-none"
            style={{ opacity: position > 15 ? 1 : 0, transition: 'opacity 0.2s' }}
          >
            Avant
          </span>
          <span
            className="absolute bottom-3 right-3 z-10 rounded-full bg-black/40 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm pointer-events-none"
            style={{ opacity: position < 85 ? 1 : 0, transition: 'opacity 0.2s' }}
          >
            Après
          </span>
        </>
      )}
    </div>
  )
}
