'use client'

import { useEffect, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'

import { ProductCard } from '@/components/shop/product-card'
import { FOCUS_RING } from '@/components/ui/editorial'
import type { ShopifyCollection, ShopifyProduct } from '@/lib/shopify'
import { cn } from '@/lib/utils'
import { noOrphan } from '@/lib/typo'

interface ShopCatalogV2Props {
  collections: ShopifyCollection[]
  allProducts: ShopifyProduct[]
  collectionProducts?: Record<string, ShopifyProduct[]>
}

const HIDDEN_HANDLES = [
  'homepage',
  'all',
  'frontpage',
  'all-products',
  'tous-les-produits',
  'tout-voir',
  'all-collection',
]
const HIDDEN_TITLES = ['all collection', 'tout voir', 'all products', 'tous les produits']
const COLLECTION_ORDER = ['merci murphy®', 'chien', 'chat', 'petshop']

const FILTER =
  'rounded-sm font-display text-lg text-charcoal/55 underline decoration-transparent decoration-1 underline-offset-[6px] transition-colors hover:text-charcoal sm:text-xl'
const FILTER_ACTIVE = 'text-charcoal decoration-terracotta'

/**
 *Catalogue boutique v2.
 * Logique de filtrage et de recherche identique à ShopCatalog (prod). Seul
 * l'habillage change : filtres en Playfair souligné à la place des pastilles,
 * recherche sur un filet, visuels à coins quasi vifs.
 */
export function ShopCatalogV2({
  collections,
  allProducts,
  collectionProducts,
}: ShopCatalogV2Props) {
  const defaultHandle =
    collections.find((c) => c.title.toLowerCase().includes('merci murphy'))?.handle ?? null
  const [activeHandle, setActiveHandle] = useState<string | null>(defaultHandle)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const visibleCollections = collections
    .filter(
      (c) => !HIDDEN_HANDLES.includes(c.handle) && !HIDDEN_TITLES.includes(c.title.toLowerCase())
    )
    .sort((a, b) => {
      const ai = COLLECTION_ORDER.findIndex((t) => a.title.toLowerCase().includes(t.toLowerCase()))
      const bi = COLLECTION_ORDER.findIndex((t) => b.title.toLowerCase().includes(t.toLowerCase()))
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
    })

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus()
  }, [searchOpen])

  function openSearch() {
    setSearchOpen(true)
    setActiveHandle(null)
  }

  function closeSearch() {
    setSearchOpen(false)
    setQuery('')
  }

  const products = query.trim()
    ? allProducts.filter((p) => p.title.toLowerCase().includes(query.toLowerCase()))
    : activeHandle
      ? (collectionProducts?.[activeHandle] ??
        allProducts.filter((p) => p.collections.nodes.some((c) => c.handle === activeHandle)))
      : allProducts

  const filters = [
    ...visibleCollections.map((c) => ({ key: c.handle, label: c.title, handle: c.handle })),
    { key: 'tout-voir', label: 'Tout voir', handle: null },
  ]

  return (
    <>
      <div className="flex flex-col gap-6 border-b border-charcoal/15 pb-6 lg:flex-row lg:items-end lg:justify-between">
        {searchOpen ? (
          <div className="flex w-full max-w-xl items-center gap-3 border-b border-charcoal pb-2">
            <Search aria-hidden="true" className="h-5 w-5 shrink-0 text-charcoal/50" />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un produit"
              aria-label="Rechercher un produit"
              className="min-w-0 flex-1 bg-transparent font-display text-xl text-charcoal outline-none placeholder:text-charcoal/40"
            />
            <button
              type="button"
              onClick={closeSearch}
              aria-label="Fermer la recherche"
              className={cn('rounded-sm p-1 text-charcoal/50 hover:text-charcoal', FOCUS_RING)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <ul className="flex flex-wrap gap-x-6 gap-y-2 sm:gap-x-8">
            {filters.map((f) => {
              const active = activeHandle === f.handle

              return (
                <li key={f.key}>
                  <button
                    type="button"
                    aria-pressed={active}
                    onClick={() => setActiveHandle(f.handle)}
                    className={cn(FILTER, active && FILTER_ACTIVE, FOCUS_RING)}
                  >
                    {f.label}
                  </button>
                </li>
              )
            })}
          </ul>
        )}

        <div className="flex items-center gap-6 text-sm text-charcoal/60">
          <p aria-live="polite">
            {products.length} {noOrphan(products.length > 1 ? 'produits' : 'produit')}
          </p>
          {!searchOpen && (
            <button
              type="button"
              onClick={openSearch}
              className={cn(
                'inline-flex items-center gap-2 rounded-sm text-charcoal underline decoration-terracotta decoration-1 underline-offset-4 hover:text-terracotta-dark',
                FOCUS_RING
              )}
            >
              <Search aria-hidden="true" className="h-4 w-4" />
              Rechercher
            </button>
          )}
        </div>
      </div>

      {products.length > 0 ? (
        <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:mt-14 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-14 [&_.rounded-2xl]:rounded-[3px]">
          {products.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-10 text-charcoal/60">
          {noOrphan(
            query.trim()
              ? `Aucun produit ne correspond à « ${query.trim()} ».`
              : 'Aucun produit dans cette collection pour le moment.'
          )}
        </p>
      )}
    </>
  )
}
