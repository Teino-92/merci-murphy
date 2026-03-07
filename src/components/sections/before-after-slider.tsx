'use client'

import { useRef, useState, useCallback } from 'react'
import Image from 'next/image'
import { GripVertical } from 'lucide-react'

interface BeforeAfterSliderProps {
  before: { src: string; alt?: string }
  after: { src: string; alt?: string }
}

export function BeforeAfterSlider({ before, after }: BeforeAfterSliderProps) {
  const [position, setPosition] = useState(50)
  const containerRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const updatePosition = useCallback((clientX: number) => {
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width))
    setPosition((x / rect.width) * 100)
  }, [])

  const onMouseDown = () => {
    dragging.current = true
  }
  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging.current) return
    updatePosition(e.clientX)
  }
  const onMouseUp = () => {
    dragging.current = false
  }

  const onTouchMove = (e: React.TouchEvent) => {
    updatePosition(e.touches[0].clientX)
  }

  return (
    <div
      ref={containerRef}
      className="relative aspect-square w-full overflow-hidden rounded-2xl cursor-col-resize select-none"
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onTouchMove={onTouchMove}
    >
      {/* After (base layer) */}
      <div className="absolute inset-0">
        <Image src={after.src} alt={after.alt ?? 'Après'} fill className="object-cover" />
        <span className="absolute bottom-3 right-3 rounded-full bg-black/40 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
          Après
        </span>
      </div>

      {/* Before (clipped layer) */}
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${position}%` }}>
        <div
          className="absolute inset-0"
          style={{ width: containerRef.current?.offsetWidth ?? 400 }}
        >
          <Image src={before.src} alt={before.alt ?? 'Avant'} fill className="object-cover" />
        </div>
        <span className="absolute bottom-3 left-3 rounded-full bg-black/40 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
          Avant
        </span>
      </div>

      {/* Divider line */}
      <div
        className="absolute inset-y-0 z-10 flex items-center"
        style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
        onMouseDown={onMouseDown}
        onTouchStart={onMouseDown}
      >
        <div className="w-0.5 h-full bg-white/80" />
        <div className="absolute flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-lg -translate-x-1/2 left-0">
          <GripVertical className="h-4 w-4 text-charcoal" />
        </div>
      </div>
    </div>
  )
}
