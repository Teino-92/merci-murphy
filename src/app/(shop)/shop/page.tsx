import type { Metadata } from 'next'
import Image from 'next/image'
import { getAllCollections, getAllProducts } from '@/lib/shopify'
import { ProductCard } from '@/components/shop/product-card'
import { Section, Container } from '@/components/ui/section'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Leaf, Heart, Globe, RefreshCw } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Boutique éthique pour chiens à Paris',
  description:
    'Produits éco-responsables et éthiques pour chiens — fabrication française, matières biologiques, second-hand. La boutique Merci Murphy à Paris.',
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
      {/* Manifesto */}
      <Section className="bg-charcoal text-cream py-12">
        <Container className="max-w-6xl">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-start">
            {/* Left — full text */}
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-terracotta">
                Une seule planète
              </p>
              <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
                Boutique éthique & éco-responsable pour chiens
              </h1>
              <p className="mt-3 text-cream/50 text-sm">
                merci murphy®, c&apos;est aussi un dog shop engagé. Nos achats ont un sens — pour
                nos poilus et pour la planète.
              </p>

              <div className="mt-8 space-y-5 text-sm text-cream/70 leading-relaxed">
                <div className="flex gap-3">
                  <Globe className="mt-0.5 h-4 w-4 shrink-0 text-terracotta" />
                  <p>
                    Le collectif <span className="text-cream font-medium">merci murphy®</span> vous
                    propose une offre resserrée de produits, choisis strictement pour leurs
                    bénéfices pour votre chien et selon des critères exigeants éco-responsables et
                    éthiques. Cela signifie questionner la composition, toutes les étapes de
                    réalisation et la durabilité de chaque produit.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Heart className="mt-0.5 h-4 w-4 shrink-0 text-terracotta" />
                  <p>
                    <span className="text-cream font-medium">merci murphy®</span> aime le vrai et
                    les savoir-faire des passionnés. La plupart de nos fournisseurs-partenaires sont
                    des artisans locaux. Nos produits voyagent le moins possible — fabrication
                    française ou dans certains pays européens voisins.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Leaf className="mt-0.5 h-4 w-4 shrink-0 text-terracotta" />
                  <p>
                    Seuls les produits éco-responsables — matières premières biologiques, recyclées
                    et innovantes, sans compromis sur leur origine et leur traçabilité — entrent
                    dans la sélection. Pas de souffrance animale : vous ne trouverez pas de cuir
                    animal chez <span className="text-cream font-medium">merci murphy®</span>.
                  </p>
                </div>
                <div className="flex gap-3">
                  <RefreshCw className="mt-0.5 h-4 w-4 shrink-0 text-terracotta" />
                  <p>
                    La durabilité est un critère essentiel.{' '}
                    <span className="text-cream font-medium">merci murphy®</span> est la première
                    boutique pour chien à proposer du{' '}
                    <span className="text-cream font-medium">second-hand</span> et une consommation
                    en vrac. Réutiliser est la meilleure option pour la planète — pour une
                    consommation éclairée et responsable.
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-cream/10 bg-cream/5 px-5 py-4">
                <p className="text-xs text-cream/50 italic">
                  <span className="not-italic font-medium text-cream">merci murphy®</span> est
                  engagé pour favoriser la mixité dans l&apos;entreprenariat. Nous favorisons les
                  marques dirigées par des femmes.
                </p>
              </div>
            </div>

            {/* Right — 3 photos stacked */}
            <div className="grid grid-cols-3 gap-3 lg:grid-cols-1 lg:gap-4">
              <div className="relative aspect-video overflow-hidden rounded-xl lg:aspect-[16/7]">
                <Image
                  src="/shop-shelves.webp"
                  alt="Sélection merci murphy"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 33vw, 50vw"
                />
              </div>
              <div className="relative aspect-video overflow-hidden rounded-xl lg:aspect-[16/7]">
                <Image
                  src="/shop-candles.webp"
                  alt="Bougies merci murphy"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 33vw, 50vw"
                />
              </div>
              <div className="relative aspect-video overflow-hidden rounded-xl lg:aspect-[16/7]">
                <Image
                  src="/shop-bulk.webp"
                  alt="Vrac merci murphy"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 33vw, 50vw"
                />
              </div>
            </div>
          </div>
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
