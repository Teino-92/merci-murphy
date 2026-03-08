'use client'

import { useRef, useState, useCallback } from 'react'
import Image from 'next/image'

interface BeforeAfterSliderProps {
  before?: { src: string; alt?: string }
  after?: { src: string; alt?: string }
  beforeColor?: string
  afterColor?: string
}

export function BeforeAfterSlider({
  before,
  after,
  beforeColor,
  afterColor,
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

  return (
    <div
      ref={containerRef}
      className="relative aspect-square w-full overflow-hidden rounded-2xl cursor-none select-none"
      onMouseMove={onMouseMove}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      onTouchMove={onTouchMove}
    >
      {/* After (base layer) */}
      <div className="absolute inset-0">
        {after ? (
          <Image src={after.src} alt={after.alt ?? 'Après'} fill className="object-cover" />
        ) : (
          <div
            className="h-full w-full flex items-center justify-center"
            style={{ background: afterColor }}
          >
            <span className="text-white/60 text-sm font-medium">Après</span>
          </div>
        )}
      </div>

      {/* Before (clipped layer) */}
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${position}%` }}>
        <div
          className="absolute inset-0"
          style={{ width: containerRef.current?.offsetWidth ?? 400 }}
        >
          {before ? (
            <Image src={before.src} alt={before.alt ?? 'Avant'} fill className="object-cover" />
          ) : (
            <div
              className="h-full w-full flex items-center justify-center"
              style={{ background: beforeColor }}
            >
              <span className="text-white/60 text-sm font-medium">Avant</span>
            </div>
          )}
        </div>
      </div>

      {/* Divider */}
      <div
        className="absolute inset-y-0 z-10 w-0.5 bg-white/80 pointer-events-none"
        style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
      />

      {/* Custom cursor dot */}
      <div
        className="absolute z-20 pointer-events-none flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-lg transition-opacity duration-200"
        style={{
          left: `${position}%`,
          top: '50%',
          transform: 'translate(-50%, -50%)',
          opacity: active ? 1 : 0,
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
    </div>
  )
}
