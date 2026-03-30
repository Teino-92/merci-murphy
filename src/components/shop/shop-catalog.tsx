'use client'

import { useState, useRef, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ProductCard } from '@/components/shop/product-card'
import type { ShopifyCollection, ShopifyProduct } from '@/lib/shopify'

interface ShopCatalogProps {
  collections: ShopifyCollection[]
  allProducts: ShopifyProduct[]
}

export function ShopCatalog({ collections, allProducts }: ShopCatalogProps) {
  const [activeHandle, setActiveHandle] = useState<string | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

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
      ? allProducts.filter((p) => p.collections.nodes.some((c) => c.handle === activeHandle))
      : allProducts

  return (
    <>
      <div className="mb-10 flex flex-wrap items-center gap-2">
        {!searchOpen && (
          <>
            <button
              onClick={() => setActiveHandle(null)}
              className={cn(
                'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
                !activeHandle
                  ? 'border-terracotta-dark bg-terracotta-dark text-white'
                  : 'border-charcoal/20 text-charcoal hover:border-terracotta-dark hover:text-terracotta-dark'
              )}
            >
              Tout voir
            </button>
            {visibleCollections.map((c) => (
              <button
                key={c.handle}
                onClick={() => setActiveHandle(c.handle)}
                className={cn(
                  'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
                  activeHandle === c.handle
                    ? 'border-terracotta-dark bg-terracotta-dark text-white'
                    : 'border-charcoal/20 text-charcoal hover:border-terracotta-dark hover:text-terracotta-dark'
                )}
              >
                {c.title}
              </button>
            ))}
          </>
        )}

        {/* Search bubble / expanded field */}
        <div className={cn('flex items-center transition-all', searchOpen ? 'flex-1' : '')}>
          {searchOpen ? (
            <div className="flex flex-1 items-center gap-2 rounded-full border border-terracotta-dark px-4 py-1.5">
              <Search className="h-4 w-4 shrink-0 text-terracotta-dark" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher un produit..."
                className="flex-1 bg-transparent text-sm text-charcoal outline-none placeholder:text-charcoal/40"
              />
              <button onClick={closeSearch}>
                <X className="h-4 w-4 text-charcoal/40 hover:text-charcoal transition-colors" />
              </button>
            </div>
          ) : (
            <button
              onClick={openSearch}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-charcoal/20 text-charcoal hover:border-terracotta-dark hover:text-terracotta-dark transition-colors"
              aria-label="Rechercher"
            >
              <Search className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="text-center text-charcoal/50">Aucun produit trouvé.</p>
      )}
    </>
  )
}
