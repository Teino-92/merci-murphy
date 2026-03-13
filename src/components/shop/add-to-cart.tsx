'use client'

import { useState } from 'react'
import { ShoppingBag, Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/context/cart-context'
import type { ShopifyProductVariant } from '@/lib/shopify'

interface AddToCartProps {
  variant: ShopifyProductVariant
}

export function AddToCart({ variant }: AddToCartProps) {
  const { addItem, isLoading } = useCart()
  const [quantity, setQuantity] = useState(1)

  const handleAdd = async () => {
    for (let i = 0; i < quantity; i++) {
      await addItem(variant.id)
    }
  }

  return (
    <div className="flex gap-3">
      {/* Quantity picker */}
      <div className="flex items-center rounded-xl border border-charcoal/20">
        <button
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          disabled={quantity <= 1 || isLoading}
          className="px-3 py-3 text-charcoal hover:text-terracotta disabled:opacity-30 transition-colors"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="w-8 text-center text-sm font-medium text-charcoal">{quantity}</span>
        <button
          onClick={() => setQuantity((q) => q + 1)}
          disabled={isLoading}
          className="px-3 py-3 text-charcoal hover:text-terracotta disabled:opacity-30 transition-colors"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Add to cart */}
      <Button
        onClick={handleAdd}
        disabled={!variant.availableForSale || isLoading}
        size="lg"
        className="flex-1 bg-terracotta-dark text-white hover:bg-terracotta-dark/90 disabled:opacity-50"
      >
        <ShoppingBag className="mr-2 h-5 w-5" />
        {!variant.availableForSale
          ? 'Indisponible'
          : isLoading
            ? 'Ajout en cours…'
            : 'Ajouter au panier'}
      </Button>
    </div>
  )
}
