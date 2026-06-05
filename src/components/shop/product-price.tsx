'use client'

import { useProductPromoPrice } from '@/context/promo-context'
import { formatPrice, type ShopifyPrice } from '@/lib/shopify'

interface Props {
  tags: string[]
  catalogPrice: ShopifyPrice
  compareAtPrice?: ShopifyPrice | null
}

export function ProductPrice({ tags, catalogPrice, compareAtPrice }: Props) {
  const promoPrice = useProductPromoPrice(tags, catalogPrice.amount)

  const displayPrice = promoPrice
    ? { amount: promoPrice.discountedAmount, currencyCode: catalogPrice.currencyCode }
    : catalogPrice

  const compareAt = promoPrice
    ? { amount: promoPrice.compareAtAmount, currencyCode: catalogPrice.currencyCode }
    : compareAtPrice && parseFloat(compareAtPrice.amount) > parseFloat(catalogPrice.amount)
      ? compareAtPrice
      : null

  return (
    <div className="mt-4 flex items-baseline gap-3">
      <span className="text-2xl font-bold text-terracotta-dark">{formatPrice(displayPrice)}</span>
      {compareAt && (
        <span className="text-base text-charcoal/40 line-through">{formatPrice(compareAt)}</span>
      )}
    </div>
  )
}
