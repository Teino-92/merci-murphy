import Link from 'next/link'
import Image from 'next/image'
import { formatPrice, type ShopifyProduct } from '@/lib/shopify'
import { cn } from '@/lib/utils'

interface ProductCardProps {
  product: ShopifyProduct
  className?: string
}

export function ProductCard({ product, className }: ProductCardProps) {
  const price = product.priceRange.minVariantPrice

  return (
    <Link href={`/shop/${product.handle}`} className={cn('group flex flex-col', className)}>
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-rose/20">
        {product.featuredImage ? (
          <Image
            src={product.featuredImage.url}
            alt={product.featuredImage.altText ?? product.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-charcoal/30">Pas de photo</p>
          </div>
        )}
      </div>
      <div className="mt-3">
        <p className="text-sm font-medium text-charcoal line-clamp-2 group-hover:text-terracotta transition-colors">
          {product.title}
        </p>
        <p className="mt-1 text-sm font-semibold text-terracotta">{formatPrice(price)}</p>
      </div>
    </Link>
  )
}
