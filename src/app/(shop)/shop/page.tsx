import type { Metadata } from 'next'
import Image from 'next/image'
import { getAllCollections, getAllProducts } from '@/lib/shopify'
import { Section, Container } from '@/components/ui/section'
import { ShopCatalog } from '@/components/shop/shop-catalog'
import { ShopManifesto } from '@/components/shop/shop-manifesto'
import { BLUR_PLACEHOLDER } from '@/lib/utils'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Boutique éthique pour chiens à Paris',
  description:
    'Produits éco-responsables et éthiques pour chiens — fabrication française, matières biologiques, second-hand. La boutique merci murphy® à Paris.',
  openGraph: {
    images: [{ url: '/og/og-shop.jpg', width: 1200, height: 630, alt: 'Boutique — Merci Murphy' }],
  },
}

export default async function ShopPage() {
  const [collections, allProducts] = await Promise.all([getAllCollections(), getAllProducts()])

  return (
    <>
      {/* Manifesto */}
      <div style={{ backgroundColor: '#B5A89A' }}>
        <Section className="text-charcoal py-12">
          <Container className="max-w-6xl">
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-[2fr_1fr] lg:items-end">
              {/* Right — desktop only: boutique-hero full height */}
              <div className="hidden lg:block lg:order-2 lg:self-stretch">
                <div className="relative w-full h-full min-h-[600px] overflow-hidden rounded-2xl">
                  <Image
                    src="/boutique-hero.jpg"
                    alt="La boutique merci murphy®"
                    fill
                    placeholder="blur"
                    blurDataURL={BLUR_PLACEHOLDER}
                    className="object-cover object-center"
                    sizes="33vw"
                  />
                </div>
              </div>

              <ShopManifesto />

              {/* Mobile only — products shelf below manifesto */}
              <div className="lg:hidden mt-6 relative w-full aspect-[3/1] overflow-hidden rounded-2xl lg:order-3">
                <Image
                  src="/boutique-products.jpg"
                  alt="Produits merci murphy®"
                  fill
                  placeholder="blur"
                  blurDataURL={BLUR_PLACEHOLDER}
                  className="object-cover object-[center_calc(50%+40px)]"
                  sizes="100vw"
                />
              </div>
            </div>
          </Container>
        </Section>
      </div>

      <Section className="bg-cream">
        <Container>
          <ShopCatalog collections={collections} allProducts={allProducts} />
        </Container>
      </Section>
    </>
  )
}
