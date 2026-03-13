'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { ProductCard } from '@/components/shop/product-card'
import { Reveal } from '@/components/ui/reveal'
import type { ShopifyCollection, ShopifyProduct } from '@/lib/shopify'

interface ShopCatalogProps {
  collections: ShopifyCollection[]
  allProducts: ShopifyProduct[]
}

export function ShopCatalog({ collections, allProducts }: ShopCatalogProps) {
  const [activeHandle, setActiveHandle] = useState<string | null>(null)

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

  const activeCollection = collections.find((c) => c.handle === activeHandle)
  const products = activeCollection ? activeCollection.products.nodes : allProducts

  return (
    <>
      {visibleCollections.length > 0 && (
        <div className="mb-10 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveHandle(null)}
            className={cn(
              'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
              !activeHandle
                ? 'border-terracotta-dark bg-terracotta-dark text-white'
                : 'border-charcoal/20 text-charcoal hover:border-terracotta hover:text-terracotta'
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
                  : 'border-charcoal/20 text-charcoal hover:border-terracotta hover:text-terracotta'
              )}
            >
              {c.title}
            </button>
          ))}
        </div>
      )}

      {products.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
          {products.map((product, i) => (
            <Reveal key={product.id} delay={(i % 4) * 80}>
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>
      ) : (
        <p className="text-center text-charcoal/50">Aucun produit disponible.</p>
      )}
    </>
  )
}
