'use client'

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { createCart, addToCart, removeFromCart, updateCartLine, getCart } from '@/lib/shopify'
import type { Cart } from '@/lib/shopify'

interface CartContextValue {
  cart: Cart | null
  isOpen: boolean
  isLoading: boolean
  openCart: () => void
  closeCart: () => void
  addItem: (variantId: string) => Promise<void>
  removeItem: (lineId: string) => Promise<void>
  updateItem: (lineId: string, quantity: number) => Promise<void>
}

const CartContext = createContext<CartContextValue | null>(null)

const CART_ID_KEY = 'merci-murphy-cart-id'

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Restore cart from localStorage on mount
  useEffect(() => {
    const savedCartId = localStorage.getItem(CART_ID_KEY)
    if (!savedCartId) return
    getCart(savedCartId).then((c) => {
      if (c) setCart(c)
      else localStorage.removeItem(CART_ID_KEY)
    })
  }, [])

  const openCart = useCallback(() => setIsOpen(true), [])
  const closeCart = useCallback(() => setIsOpen(false), [])

  const addItem = useCallback(async (variantId: string) => {
    setIsLoading(true)
    try {
      const cartId = localStorage.getItem(CART_ID_KEY)
      let updatedCart: Cart
      if (cartId) {
        updatedCart = await addToCart(cartId, variantId)
      } else {
        updatedCart = await createCart(variantId)
        localStorage.setItem(CART_ID_KEY, updatedCart.id)
      }
      setCart(updatedCart)
      setIsOpen(true)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const removeItem = useCallback(
    async (lineId: string) => {
      if (!cart) return
      setIsLoading(true)
      try {
        const updatedCart = await removeFromCart(cart.id, lineId)
        setCart(updatedCart)
      } finally {
        setIsLoading(false)
      }
    },
    [cart]
  )

  const updateItem = useCallback(
    async (lineId: string, quantity: number) => {
      if (!cart) return
      setIsLoading(true)
      try {
        const updatedCart = await updateCartLine(cart.id, lineId, quantity)
        setCart(updatedCart)
      } finally {
        setIsLoading(false)
      }
    },
    [cart]
  )

  return (
    <CartContext.Provider
      value={{ cart, isOpen, isLoading, openCart, closeCart, addItem, removeItem, updateItem }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
