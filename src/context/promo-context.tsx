'use client'

import { createContext, useContext, type ReactNode } from 'react'
import { isPromoLive, type PromoBanner } from '@/sanity/queries/site-settings'

const PromoContext = createContext<PromoBanner | null>(null)

interface ProviderProps {
  banner: PromoBanner | null
  children: ReactNode
}

export function PromoProvider({ banner, children }: ProviderProps) {
  return <PromoContext.Provider value={banner}>{children}</PromoContext.Provider>
}

export function usePromo(): PromoBanner | null {
  return useContext(PromoContext)
}

function matchesPromo(promo: PromoBanner | null, productTags: string[] | undefined): boolean {
  if (!isPromoLive(promo) || !promo?.productTag) return false
  if (!productTags?.length) return false
  const normalized = promo.productTag.trim().toLowerCase()
  return productTags.some((t) => t.trim().toLowerCase() === normalized)
}

/**
 * Returns the badge label to render on a product if it matches the active
 * promo tag, otherwise null.
 */
export function useProductPromoBadge(productTags: string[] | undefined): string | null {
  const promo = usePromo()
  if (!promo?.badgeLabel) return null
  return matchesPromo(promo, productTags) ? promo.badgeLabel : null
}

/**
 * Returns the discounted (promo) price to display, plus the original price as
 * compareAt. Shopify Storefront API returns the catalog price (no auto
 * discount applied), so we compute discounted = catalog * (1 - %).
 */
export function useProductPromoPrice(
  productTags: string[] | undefined,
  catalogPriceAmount: string | number
): { discountedAmount: string; compareAtAmount: string; discountPercent: number } | null {
  const promo = usePromo()
  if (!promo?.discountPercent || promo.discountPercent <= 0 || promo.discountPercent >= 100) {
    return null
  }
  if (!matchesPromo(promo, productTags)) return null
  const catalog =
    typeof catalogPriceAmount === 'string' ? parseFloat(catalogPriceAmount) : catalogPriceAmount
  if (!isFinite(catalog) || catalog <= 0) return null
  const ratio = 1 - promo.discountPercent / 100
  const discounted = catalog * ratio
  return {
    discountedAmount: discounted.toFixed(2),
    compareAtAmount: catalog.toFixed(2),
    discountPercent: promo.discountPercent,
  }
}
