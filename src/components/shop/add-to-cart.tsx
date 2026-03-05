'use client'

import { ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/context/cart-context'
import type { ShopifyProductVariant } from '@/lib/shopify'

interface AddToCartProps {
  variant: ShopifyProductVariant
}

export function AddToCart({ variant }: AddToCartProps) {
  const { addItem, isLoading } = useCart()

  return (
    <Button
      onClick={() => addItem(variant.id)}
      disabled={!variant.availableForSale || isLoading}
      size="lg"
      className="w-full bg-terracotta text-white hover:bg-terracotta/90 disabled:opacity-50"
    >
      <ShoppingBag className="mr-2 h-5 w-5" />
      {!variant.availableForSale
        ? 'Indisponible'
        : isLoading
          ? 'Ajout en cours…'
          : 'Ajouter au panier'}
    </Button>
  )
}
