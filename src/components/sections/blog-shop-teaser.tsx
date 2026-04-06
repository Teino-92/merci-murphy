import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Section, Container } from '@/components/ui/section'
import { ProductCard } from '@/components/shop/product-card'
import type { ShopifyProduct } from '@/lib/shopify'

export function BlogShopTeaser({ products }: { products: ShopifyProduct[] }) {
  if (products.length === 0) return null

  return (
    <Section className="bg-rose/30">
      <Container>
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="block w-6 h-px bg-terracotta-dark flex-shrink-0" />
              <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-terracotta-dark">
                Éco-shop
              </span>
            </div>
            <h2 className="font-display text-2xl font-bold text-charcoal sm:text-3xl">
              Nos coups de cœur
            </h2>
          </div>
          <Link
            href="/shop"
            className="hidden sm:flex items-center gap-1 text-sm font-medium text-terracotta-dark hover:gap-2 transition-all"
          >
            Voir tout <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Scrollable carousel */}
        <div
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
          style={{ touchAction: 'pan-x' }}
        >
          {products.map((product) => (
            <div key={product.id} className="w-48 shrink-0 sm:w-56">
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        <div className="mt-6 text-center sm:hidden">
          <Link href="/shop" className="text-sm font-medium text-terracotta-dark hover:underline">
            Voir toute la boutique →
          </Link>
        </div>
      </Container>
    </Section>
  )
}
