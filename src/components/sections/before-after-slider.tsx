'use client'

import { useRef, useState, useCallback } from 'react'
import Image from 'next/image'

interface BeforeAfterSliderProps {
  before?: { src: string; alt?: string; position?: string }
  after?: { src: string; alt?: string; position?: string }
  beforeColor?: string
  afterColor?: string
  zoom?: number
  beforeZoom?: number
  afterZoom?: number
  className?: string
}

export function BeforeAfterSlider({
  before,
  after,
  beforeColor,
  afterColor,
  zoom = 1,
  beforeZoom,
  afterZoom,
  className,
}: BeforeAfterSliderProps) {
  const isPhoto = !!(before?.src || after?.src)
  const aspect = isPhoto ? 'aspect-[3/4]' : 'aspect-square'

  return (
    <div className={`w-full ${className ?? ''}`}>
      {/* Mobile: tap-to-flip card (slider drag fights page scroll on touch) */}
      <div className={`lg:hidden ${aspect} w-full`}>
        <BeforeAfterFlip
          before={before}
          after={after}
          beforeColor={beforeColor}
          afterColor={afterColor}
          zoom={zoom}
          beforeZoom={beforeZoom}
          afterZoom={afterZoom}
          isPhoto={isPhoto}
        />
      </div>

      {/* Desktop: drag slider */}
      <div className="hidden lg:block">
        <BeforeAfterDragSlider
          before={before}
          after={after}
          beforeColor={beforeColor}
          afterColor={afterColor}
          zoom={zoom}
          beforeZoom={beforeZoom}
          afterZoom={afterZoom}
          isPhoto={isPhoto}
          aspect={aspect}
        />
      </div>
    </div>
  )
}

interface FaceProps {
  before?: { src: string; alt?: string; position?: string }
  after?: { src: string; alt?: string; position?: string }
  beforeColor?: string
  afterColor?: string
  zoom: number
  beforeZoom?: number
  afterZoom?: number
  isPhoto: boolean
}

function Face({
  image,
  fallbackColor,
  fallbackLabel,
  zoom,
}: {
  image?: { src: string; alt?: string; position?: string }
  fallbackColor?: string
  fallbackLabel: string
  zoom: number
}) {
  if (image) {
    return (
      <Image
        src={image.src}
        alt={image.alt ?? fallbackLabel}
        fill
        className="object-cover"
        style={{ transform: `scale(${zoom})`, objectPosition: image.position ?? 'center' }}
        sizes="(max-width: 640px) 100vw, 25vw"
      />
    )
  }
  return (
    <div
      className="h-full w-full flex items-center justify-center"
      style={{ background: fallbackColor }}
    >
      <span className="text-white/60 text-sm font-medium">{fallbackLabel}</span>
    </div>
  )
}

function BeforeAfterFlip({
  before,
  after,
  beforeColor,
  afterColor,
  zoom,
  beforeZoom,
  afterZoom,
  isPhoto,
}: FaceProps) {
  const [flipped, setFlipped] = useState(false)

  return (
    <button
      type="button"
      onClick={() => setFlipped((f) => !f)}
      aria-label={flipped ? "Revenir à l'avant" : "Voir l'après"}
      aria-pressed={flipped}
      className="group relative block h-full w-full select-none rounded-2xl bg-[#F5F0E8] [perspective:1200px]"
    >
      {/* Rotating + breathing scale/shadow for a tactile flip effect.
          Each face is shown/hidden by opacity at mid-flip rather than relying
          on backface-visibility, which is unreliable on iOS Safari with filled
          images and would otherwise show a mirrored face. */}
      <div
        className="relative h-full w-full rounded-2xl transition-[transform,box-shadow] duration-500 ease-out [transform-style:preserve-3d]"
        style={{
          transform: `rotateY(${flipped ? 180 : 0}deg) scale(${flipped ? 1.04 : 1})`,
          boxShadow: flipped
            ? '0 20px 40px -12px rgba(58,42,38,0.35)'
            : '0 6px 16px -8px rgba(58,42,38,0.2)',
        }}
      >
        {/* Front — Avant */}
        <div
          className="absolute inset-0 overflow-hidden rounded-2xl transition-opacity duration-200"
          style={{ opacity: flipped ? 0 : 1 }}
        >
          <Face
            image={before}
            fallbackColor={beforeColor}
            fallbackLabel="Avant"
            zoom={beforeZoom ?? zoom}
          />
          {isPhoto && (
            <span className="absolute inset-x-0 bottom-3 z-10 mx-auto flex w-fit items-center gap-1.5 rounded-full bg-terracotta-dark/90 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
              <RotateIcon />
              Voir l&apos;après
            </span>
          )}
        </div>

        {/* Back — Après. Counter-rotated so its content reads correctly. */}
        <div
          className="absolute inset-0 overflow-hidden rounded-2xl transition-opacity duration-200 [transform:rotateY(180deg)]"
          style={{ opacity: flipped ? 1 : 0 }}
        >
          <Face
            image={after}
            fallbackColor={afterColor}
            fallbackLabel="Après"
            zoom={afterZoom ?? zoom}
          />
          {isPhoto && (
            <span className="absolute bottom-3 right-3 z-10 rounded-full bg-black/40 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
              Après
            </span>
          )}
        </div>
      </div>
    </button>
  )
}

function RotateIcon() {
  return (
    <svg
      className="h-3.5 w-3.5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
      />
    </svg>
  )
}

function BeforeAfterDragSlider({
  before,
  after,
  beforeColor,
  afterColor,
  zoom,
  beforeZoom,
  afterZoom,
  isPhoto,
  aspect,
}: FaceProps & { aspect: string }) {
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

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden rounded-2xl cursor-none select-none bg-[#F5F0E8] ${aspect}`}
      onMouseMove={(e) => updateFromClient(e.clientX)}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
    >
      {/* After (base layer) */}
      <div className="absolute inset-0">
        <Face
          image={after}
          fallbackColor={afterColor}
          fallbackLabel="Après"
          zoom={afterZoom ?? zoom}
        />
      </div>

      {/* Before (clipped layer) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0 round 16px 0 0 16px)` }}
      >
        <Face
          image={before}
          fallbackColor={beforeColor}
          fallbackLabel="Avant"
          zoom={beforeZoom ?? zoom}
        />
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
