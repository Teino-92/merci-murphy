import type { Metadata } from 'next'

import { PageHeaderV2 } from '@/components/sections/page-header-v2'
import { ProBanner } from '@/components/shop/pro-banner'
import { ShopCatalogV2 } from '@/components/shop/shop-catalog-v2'
import { ShopManifestoV2 } from '@/components/shop/shop-manifesto-v2'
import { CONTAINER, SUB_LINE, SUB_TONE, TEXT_LINK } from '@/components/ui/editorial'
import { getAllCollections, getCollectionByHandle } from '@/lib/shopify'
import { cn } from '@/lib/utils'

export const revalidate = 3600

export const metadata: Metadata = {
  title: { absolute: 'Boutique merci murphy® — shampoings & soins naturels pour chien' },
  description:
    'La boutique merci murphy® : produits de toilettage sélectionnés par nos toiletteurs — shampoings doux, sprays démêlants, soins sans sulfate. Fabrication française, livraison en France.',
  openGraph: {
    images: [{ url: '/og/og-shop.jpg', width: 1200, height: 630, alt: 'Boutique — Merci Murphy' }],
  },
}

const COLLECTION_ORDER = ['merci murphy', 'chien', 'chat', 'petshop']

export default async function ShopPage() {
  const collections = await getAllCollections()
  const collectionsWithProducts = await Promise.all(
    collections.map((c) => getCollectionByHandle(c.handle))
  )

  const sortedCollections = [...collectionsWithProducts].sort((a, b) => {
    const ai = COLLECTION_ORDER.findIndex((t) => a?.title.toLowerCase().includes(t))
    const bi = COLLECTION_ORDER.findIndex((t) => b?.title.toLowerCase().includes(t))
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
  })
  const seen = new Set<string>()
  const allProducts = sortedCollections
    .flatMap((c) => c?.products.nodes ?? [])
    .filter((p) => {
      if (seen.has(p.id)) return false
      seen.add(p.id)
      return true
    })

  const collectionProducts = Object.fromEntries(
    collectionsWithProducts.flatMap((c) => (c ? [[c.handle, c.products.nodes]] : []))
  )

  // <main> : fourni en prod par le layout (shop), pas de <main> ici.
  return (
    <>
      <PageHeaderV2
        // Même texte de h1 qu'en prod ; la seconde moitié passe en ligne italique.
        title={
          <>
            Boutique merci murphy®{' '}
            <span className={cn(SUB_LINE, SUB_TONE.light, 'mt-4 lg:mt-6')}>
              éthique &amp; éco-responsable pour chiens et chats
            </span>
          </>
        }
        intro={
          // La suite du texte prod (« Nos achats ont un sens… ») ouvre la section engagements.
          <p>merci murphy®, c&apos;est aussi un dog shop engagé.</p>
        }
        image={{
          src: '/boutique-hero.jpg',
          alt: 'La boutique merci murphy®',
        }}
        imageDesktopOnly
      >
        <a href="#engagements" className={cn(TEXT_LINK.light, 'self-start')}>
          Nos engagements
        </a>
      </PageHeaderV2>

      <section className="border-t border-charcoal/15 bg-white pb-20 pt-10 lg:pb-28 lg:pt-14">
        <div className={CONTAINER}>
          <ShopCatalogV2
            collections={collections}
            allProducts={allProducts}
            collectionProducts={collectionProducts}
          />
        </div>
      </section>

      <ShopManifestoV2 />

      <ProBanner />
    </>
  )
}
