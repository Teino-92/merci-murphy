import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Section, Container } from '@/components/ui/section'
import { ProductCard } from '@/components/shop/product-card'
import type { ShopifyProduct } from '@/lib/shopify'

interface ShopTeaserProps {
  products: ShopifyProduct[]
}

export function ShopTeaser({ products }: ShopTeaserProps) {
  if (products.length === 0) return null

  return (
    <Section className="bg-cream">
      <Container>
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold text-charcoal sm:text-4xl">
              La boutique
            </h2>
            <p className="mt-2 text-charcoal/60">Produits premium sélectionnés pour votre chien.</p>
          </div>
          <Link
            href="/shop"
            className="hidden items-center gap-1 text-sm font-medium text-terracotta hover:gap-2 transition-all sm:flex"
          >
            Voir tout <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="mt-8 text-center sm:hidden">
          <Link href="/shop" className="text-sm font-medium text-terracotta hover:underline">
            Voir toute la boutique →
          </Link>
        </div>
      </Container>
    </Section>
  )
}
