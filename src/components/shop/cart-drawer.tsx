'use client'

import Image from 'next/image'
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { useCart } from '@/context/cart-context'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/shopify'

export function CartDrawer() {
  const { cart, isOpen, isLoading, closeCart, removeItem, updateItem } = useCart()

  const lines = cart?.lines.nodes ?? []
  const isEmpty = lines.length === 0

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={closeCart} />
      )}

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-cream shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-charcoal/10 px-6 py-4">
          <h2 className="font-display text-xl font-bold text-charcoal">Mon panier</h2>
          <button
            onClick={closeCart}
            className="rounded-full p-1.5 text-charcoal/50 hover:bg-charcoal/10 hover:text-charcoal transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        {isEmpty ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <ShoppingBag className="h-16 w-16 text-charcoal/20" />
            <p className="text-charcoal/50">Votre panier est vide.</p>
            <Button
              onClick={closeCart}
              variant="outline"
              className="border-terracotta text-terracotta hover:bg-terracotta hover:text-white"
            >
              Continuer mes achats
            </Button>
          </div>
        ) : (
          <>
            {/* Lines */}
            <ul className="flex-1 overflow-y-auto divide-y divide-charcoal/10 px-6">
              {lines.map((line) => (
                <li key={line.id} className="flex gap-4 py-5">
                  {/* Image */}
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-rose/20">
                    {line.merchandise.product.featuredImage && (
                      <Image
                        src={line.merchandise.product.featuredImage.url}
                        alt={
                          line.merchandise.product.featuredImage.altText ??
                          line.merchandise.product.title
                        }
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex flex-1 flex-col">
                    <p className="font-medium text-charcoal leading-snug">
                      {line.merchandise.product.title}
                    </p>
                    {line.merchandise.title !== 'Default Title' && (
                      <p className="mt-0.5 text-sm text-charcoal/50">{line.merchandise.title}</p>
                    )}
                    <p className="mt-1 font-semibold text-terracotta">
                      {formatPrice(line.merchandise.price)}
                    </p>

                    {/* Qty controls */}
                    <div className="mt-3 flex items-center gap-3">
                      <button
                        onClick={() =>
                          line.quantity > 1
                            ? updateItem(line.id, line.quantity - 1)
                            : removeItem(line.id)
                        }
                        disabled={isLoading}
                        className="rounded-full border border-charcoal/20 p-1 text-charcoal hover:border-terracotta hover:text-terracotta transition-colors disabled:opacity-40"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-5 text-center text-sm font-medium">{line.quantity}</span>
                      <button
                        onClick={() => updateItem(line.id, line.quantity + 1)}
                        disabled={isLoading}
                        className="rounded-full border border-charcoal/20 p-1 text-charcoal hover:border-terracotta hover:text-terracotta transition-colors disabled:opacity-40"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>

                      <button
                        onClick={() => removeItem(line.id)}
                        disabled={isLoading}
                        className="ml-auto text-charcoal/30 hover:text-red-500 transition-colors disabled:opacity-40"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {/* Footer */}
            <div className="border-t border-charcoal/10 px-6 py-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-charcoal/70">Total</span>
                <span className="text-xl font-bold text-charcoal">
                  {cart?.cost.totalAmount && formatPrice(cart.cost.totalAmount)}
                </span>
              </div>
              <p className="text-xs text-charcoal/40 text-center">
                Frais de livraison calculés à la commande
              </p>
              <a
                href={cart?.checkoutUrl}
                className="block w-full rounded-xl bg-terracotta py-3.5 text-center font-semibold text-white transition-colors hover:bg-terracotta/90"
              >
                Passer la commande
              </a>
            </div>
          </>
        )}
      </div>
    </>
  )
}
