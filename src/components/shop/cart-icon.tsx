'use client'

import { ShoppingBag } from 'lucide-react'
import { useCart } from '@/context/cart-context'

export function CartIcon() {
  const { cart, openCart } = useCart()
  const count = cart?.totalQuantity ?? 0

  return (
    <button
      onClick={openCart}
      className="relative p-2 text-charcoal hover:text-terracotta-dark transition-colors"
      aria-label="Ouvrir le panier"
    >
      <ShoppingBag className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-terracotta-dark text-[10px] font-bold text-white">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </button>
  )
}
