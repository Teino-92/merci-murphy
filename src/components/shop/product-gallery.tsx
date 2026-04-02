'use client'

import { useState } from 'react'
import Image from 'next/image'
import { BLUR_PLACEHOLDER } from '@/lib/utils'
import type { ShopifyImage } from '@/lib/shopify'

interface ProductGalleryProps {
  images: ShopifyImage[]
  title: string
}

export function ProductGallery({ images, title }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const active = images[activeIndex]

  return (
    <div className="space-y-4">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-rose/20">
        {active && (
          <Image
            src={active.url}
            alt={active.altText ?? title}
            fill
            priority
            placeholder="blur"
            blurDataURL={BLUR_PLACEHOLDER}
            className="object-cover transition-opacity duration-300"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        )}
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.slice(0, 8).map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`relative aspect-square overflow-hidden rounded-xl bg-rose/20 transition-opacity ${
                i === activeIndex ? 'ring-2 ring-terracotta-dark' : 'opacity-60 hover:opacity-100'
              }`}
            >
              <Image
                src={img.url}
                alt={img.altText ?? title}
                fill
                placeholder="blur"
                blurDataURL={BLUR_PLACEHOLDER}
                className="object-cover"
                sizes="25vw"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
