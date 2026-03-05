import type { Metadata } from 'next'
import { getAllCollections, getAllProducts } from '@/lib/shopify'
import { ProductCard } from '@/components/shop/product-card'
import { Section, Container } from '@/components/ui/section'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Boutique',
  description:
    'Produits premium pour chiens — marque merci murphy et sélection de marques partenaires.',
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: { collection?: string }
}) {
  const [collections, allProducts] = await Promise.all([getAllCollections(), getAllProducts()])

  const HIDDEN_COLLECTIONS = ['homepage', 'all', 'frontpage']
  const visibleCollections = collections.filter((c) => !HIDDEN_COLLECTIONS.includes(c.handle))

  const activeCollection = searchParams.collection
  const collection = collections.find((c) => c.handle === activeCollection)
  const products = collection ? collection.products.nodes : allProducts

  return (
    <>
      <Section className="bg-charcoal text-cream py-20">
        <Container className="text-center">
          <h1 className="font-display text-4xl font-bold sm:text-5xl">Boutique</h1>
          <p className="mt-4 text-lg text-cream/70">
            Produits premium sélectionnés pour le bien-être de votre chien.
          </p>
        </Container>
      </Section>

      <Section className="bg-cream">
        <Container>
          {/* Collection filters */}
          {visibleCollections.length > 0 && (
            <div className="mb-10 flex flex-wrap gap-2">
              <Link
                href="/shop"
                className={cn(
                  'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
                  !activeCollection
                    ? 'border-terracotta bg-terracotta text-white'
                    : 'border-charcoal/20 text-charcoal hover:border-terracotta hover:text-terracotta'
                )}
              >
                Tout voir
              </Link>
              {visibleCollections.map((c) => (
                <Link
                  key={c.handle}
                  href={`/shop?collection=${c.handle}`}
                  className={cn(
                    'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
                    activeCollection === c.handle
                      ? 'border-terracotta bg-terracotta text-white'
                      : 'border-charcoal/20 text-charcoal hover:border-terracotta hover:text-terracotta'
                  )}
                >
                  {c.title}
                </Link>
              ))}
            </div>
          )}

          {/* Products grid */}
          {products.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <p className="text-center text-charcoal/50">Aucun produit disponible.</p>
          )}
        </Container>
      </Section>
    </>
  )
}
