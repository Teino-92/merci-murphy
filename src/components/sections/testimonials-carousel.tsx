'use client'

import { useRef, useState, useCallback } from 'react'
import type { Testimonial } from '@/sanity/queries/testimonials'

function StarRating({ note }: { note: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className="h-4 w-4"
          viewBox="0 0 20 20"
          fill={i < note ? '#C4845A' : 'none'}
          stroke={i < note ? '#C4845A' : '#1A1A1A33'}
          strokeWidth={1}
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

export function TestimonialsCarousel({ testimonials }: { testimonials: Testimonial[] }) {
  const [current, setCurrent] = useState(0)
  const trackRef = useRef<HTMLDivElement>(null)

  const goTo = (index: number) => {
    const el = trackRef.current
    if (!el) return
    el.scrollTo({ left: el.clientWidth * index, behavior: 'smooth' })
    setCurrent(index)
  }

  const handleScroll = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    const index = Math.round(el.scrollLeft / el.clientWidth)
    setCurrent(index)
  }, [])

  const prev = () => goTo(Math.max(0, current - 1))
  const next = () => goTo(Math.min(testimonials.length - 1, current + 1))

  return (
    <div className="mt-12">
      {/* Track — chaque slide = 100% de la largeur du conteneur */}
      <div
        ref={trackRef}
        onScroll={handleScroll}
        className="overflow-x-auto scrollbar-hide flex snap-x snap-mandatory"
      >
        {testimonials.map((t) => (
          <div key={t._id} className="snap-start shrink-0 w-full px-4 sm:px-6 lg:px-8 pb-2">
            {/* La carte avec les flèches positionnées dedans */}
            <div className="relative mx-auto max-w-7xl bg-white rounded-2xl shadow-sm p-8 flex flex-col gap-4">
              {/* Flèche gauche */}
              {current > 0 && (
                <button
                  onClick={prev}
                  aria-label="Témoignage précédent"
                  className="absolute left-4 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-cream border border-charcoal/10 text-charcoal shadow-sm transition hover:border-charcoal/30"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}

              {/* Flèche droite */}
              {current < testimonials.length - 1 && (
                <button
                  onClick={next}
                  aria-label="Témoignage suivant"
                  className="absolute right-4 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-cream border border-charcoal/10 text-charcoal shadow-sm transition hover:border-charcoal/30"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}

              <StarRating note={t.note} />
              <p className="text-base leading-relaxed text-charcoal/80 px-8">{t.texte}</p>
              <div className="mt-auto pt-2 px-8">
                <p className="text-sm font-semibold text-charcoal">{t.auteur}</p>
                {t.service && <p className="text-xs text-terracotta mt-0.5">{t.service.title}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Points */}
      <div className="mt-4 flex items-center justify-center gap-2">
        {testimonials.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Aller au témoignage ${i + 1}`}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === current ? 'w-6 bg-terracotta' : 'w-2 bg-charcoal/20 hover:bg-charcoal/40'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
