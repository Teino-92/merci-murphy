import type { Metadata } from 'next'
import Image from 'next/image'
import { getAllCollections, getAllProducts } from '@/lib/shopify'
import { Section, Container } from '@/components/ui/section'
import { Leaf, Heart, Globe, RefreshCw } from 'lucide-react'
import { Reveal } from '@/components/ui/reveal'
import { ShopCatalog } from '@/components/shop/shop-catalog'

export const metadata: Metadata = {
  title: 'Boutique éthique pour chiens à Paris',
  description:
    'Produits éco-responsables et éthiques pour chiens — fabrication française, matières biologiques, second-hand. La boutique Merci Murphy à Paris.',
}

export default async function ShopPage() {
  const [collections, allProducts] = await Promise.all([getAllCollections(), getAllProducts()])

  return (
    <>
      {/* Manifesto */}
      <Section className="bg-charcoal text-cream py-12">
        <Container className="max-w-6xl">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[2fr_1fr] lg:items-end">
            {/* Right — stacked photos */}
            <Reveal className="hidden lg:flex lg:flex-col lg:gap-3 lg:order-2">
              {/* Tall portrait */}
              <div className="relative w-full aspect-[3/4] overflow-hidden rounded-2xl">
                <Image
                  src="/boutique-hero.jpg"
                  alt="La boutique merci murphy®"
                  fill
                  className="object-cover object-center"
                  sizes="25vw"
                />
              </div>
              {/* Short landscape — exact 3:2 ratio, no crop */}
              <div className="relative w-full aspect-[3/1] overflow-hidden rounded-2xl">
                <Image
                  src="/boutique-products.jpg"
                  alt="Produits merci murphy®"
                  fill
                  className="object-cover object-[center_calc(50%+40px)]"
                  sizes="25vw"
                />
              </div>
            </Reveal>

            {/* Mobile only — products shelf */}
            <div className="lg:hidden relative w-full aspect-[3/1] overflow-hidden rounded-2xl">
              <Image
                src="/boutique-products.jpg"
                alt="Produits merci murphy®"
                fill
                className="object-cover object-[center_calc(50%+40px)]"
                sizes="100vw"
              />
            </div>

            {/* Left — full text */}
            <Reveal className="text-center lg:text-left lg:order-1">
              <h1 className="mt-3 font-display text-4xl font-bold sm:text-6xl">
                Boutique éthique & éco-responsable pour chiens
              </h1>
              <h2 className="mt-2 text-sm font-medium uppercase tracking-widest text-terracotta">
                Une seule planète
              </h2>
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
            </Reveal>
          </div>
        </Container>
      </Section>

      <Section className="bg-cream">
        <Container>
          <ShopCatalog collections={collections} allProducts={allProducts} />
        </Container>
      </Section>
    </>
  )
}
