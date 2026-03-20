import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Section, Container } from '@/components/ui/section'
import { Reveal } from '@/components/ui/reveal'
import { ProductCard } from '@/components/shop/product-card'
import type { ShopifyProduct } from '@/lib/shopify'

interface ServiceShopTeaserProps {
  products: ShopifyProduct[]
  title?: string
  subtitle?: string
}

export function ServiceShopTeaser({
  products,
  title = 'Vous avez aimé nos produits maison POILUS ?',
  subtitle = 'Retrouvez-les dans notre éco-shop pour continuer le soin à la maison.',
}: ServiceShopTeaserProps) {
  if (products.length === 0) return null

  return (
    <Section className="bg-rose/30">
      <Container>
        <Reveal>
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold text-charcoal sm:text-3xl">{title}</h2>
              <p className="mt-2 text-charcoal/60">{subtitle}</p>
            </div>
            <Link
              href="/shop"
              className="hidden items-center gap-1 text-sm font-medium text-terracotta-dark hover:gap-2 transition-all sm:flex shrink-0 ml-6"
            >
              Voir tout <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
      </Container>

      <Container className="mt-10 !overflow-visible">
        <div
          className="-mr-4 sm:-mr-6 lg:-mr-8 overflow-x-auto overflow-y-hidden scrollbar-hide"
          style={{ touchAction: 'pan-x' }}
        >
          <div className="flex gap-4 pr-4">
            {products.map((product) => (
              <div key={product.id} className="w-56 shrink-0 sm:w-64">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </Container>

      <Container>
        <div className="mt-8 text-center sm:hidden">
          <Link href="/shop" className="text-sm font-medium text-terracotta-dark hover:underline">
            Voir toute la boutique →
          </Link>
        </div>
      </Container>
    </Section>
  )
}
