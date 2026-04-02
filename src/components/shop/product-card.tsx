'use client'

import Link from 'next/link'
import Image from 'next/image'
import { formatPrice, type ShopifyProduct } from '@/lib/shopify'
import { cn, BLUR_PLACEHOLDER } from '@/lib/utils'

interface ProductCardProps {
  product: ShopifyProduct
  className?: string
  imageOverride?: [number, number] // [defaultIndex, hoverIndex] into images.nodes
}

export function ProductCard({ product, className, imageOverride }: ProductCardProps) {
  const price = product.priceRange.minVariantPrice
  const nodes = product.images?.nodes ?? []
  const firstImage = imageOverride
    ? (nodes[imageOverride[0]] ?? product.featuredImage)
    : product.featuredImage
  const secondImage = imageOverride ? (nodes[imageOverride[1]] ?? null) : (nodes[1] ?? null)

  return (
    <Link href={`/shop/${product.handle}`} className={cn('group flex flex-col', className)}>
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-rose/20">
        {firstImage ? (
          <>
            <Image
              src={firstImage.url}
              alt={firstImage.altText ?? product.title}
              fill
              placeholder="blur"
              blurDataURL={BLUR_PLACEHOLDER}
              className={cn(
                'object-cover transition-opacity duration-500',
                secondImage
                  ? 'opacity-100 group-hover:opacity-0'
                  : 'group-hover:scale-105 transition-transform duration-300'
              )}
              sizes="(max-width: 640px) 256px, 320px"
            />
            {secondImage && (
              <Image
                src={secondImage.url}
                alt={secondImage.altText ?? product.title}
                fill
                placeholder="blur"
                blurDataURL={BLUR_PLACEHOLDER}
                className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                sizes="(max-width: 640px) 256px, 320px"
              />
            )}
          </>
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-charcoal/30">Pas de photo</p>
          </div>
        )}
        {!product.availableForSale && (
          <div className="absolute inset-0 bg-charcoal/40 flex items-center justify-center rounded-2xl">
            <span className="bg-charcoal/80 text-cream text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full">
              Rupture de stock
            </span>
          </div>
        )}
      </div>
      <div className="mt-3">
        <p className="text-sm font-medium text-charcoal line-clamp-2 group-hover:text-terracotta-dark transition-colors">
          {product.title}
        </p>
        <p className="mt-1 text-sm font-semibold text-terracotta-dark">{formatPrice(price)}</p>
      </div>
    </Link>
  )
}
