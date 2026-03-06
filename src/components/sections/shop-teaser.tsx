import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Section, Container } from '@/components/ui/section'
import { Reveal } from '@/components/ui/reveal'
import { ProductCard } from '@/components/shop/product-card'
import type { ShopifyProduct } from '@/lib/shopify'

// [defaultImageIndex, hoverImageIndex] — 0-based, uses images.nodes array
const IMAGE_OVERRIDES: Record<string, [number, number]> = {
  'bougie-merci-murphy-grand-format-copy': [2, 0], // image 3 → packshot on hover
  'bougie-merci-murphy-sans-un-mot-grand-format-copy': [1, 0], // image 2 → image 1 on hover
}

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
      </Container>

      {/* Scrollable carousel — full width, no Container clipping */}
      <Reveal stagger=":scope > *" className="mt-10 overflow-x-auto scrollbar-hide">
        <div className="flex gap-4 px-4 sm:px-6 lg:px-8 xl:px-[max(2rem,calc((100vw-1280px)/2+2rem))]">
          {products.map((product) => (
            <div key={product.id} className="w-64 shrink-0 sm:w-80">
              <ProductCard product={product} imageOverride={IMAGE_OVERRIDES[product.handle]} />
            </div>
          ))}
        </div>
      </Reveal>

      <Container>
        <div className="mt-8 text-center sm:hidden">
          <Link href="/shop" className="text-sm font-medium text-terracotta hover:underline">
            Voir toute la boutique →
          </Link>
        </div>
      </Container>
    </Section>
  )
}
