export const revalidate = 3600
export const dynamicParams = false

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { AddToCart } from '@/components/shop/add-to-cart'
import { ProductCard } from '@/components/shop/product-card'
import { ProductGallery } from '@/components/shop/product-gallery'
import { ProductPrice } from '@/components/shop/product-price'
import { ProductPromoBadge } from '@/components/shop/promo-badge'
import {
  CONTAINER,
  DisplayTitle,
  INLINE_LINK,
  RULED_ITEM,
  RULED_LIST,
} from '@/components/ui/editorial'
import { getAllProducts, getCollectionByHandle, getProductByHandle } from '@/lib/shopify'
import { cn } from '@/lib/utils'
import { noOrphan, noOrphanHtml } from '@/lib/typo'

interface Props {
  params: { handle: string }
}

// Composants prod repris tels quels : seul leur habillage change, depuis ces
// wrappers (coins vifs, prix en Playfair normal, bouton plus haut).
const GALLERY_SKIN = '[&_.rounded-2xl]:rounded-[3px] [&_.rounded-xl]:rounded-[2px]'
const PRICE_SKIN =
  '[&>div]:mt-6 [&_.font-bold]:font-display [&_.font-bold]:text-3xl [&_.font-bold]:font-normal'
const CART_SKIN = '[&_.h-10]:h-12 [&_.rounded-md]:rounded-none [&_.rounded-xl]:rounded-none'
const GRID_SKIN = '[&_.rounded-2xl]:rounded-[3px]'

const HIDDEN_COLLECTION_TITLES = [
  'all collection',
  'tout voir',
  'all products',
  'tous les produits',
]

// Description Shopify en HTML : paragraphes et listes espacés, sans plugin typo.
const DESCRIPTION =
  'mt-8 max-w-prose text-base leading-relaxed text-charcoal/70 [&_li]:mt-1 [&_p+p]:mt-4 [&_strong]:font-medium [&_strong]:text-charcoal [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-5'

export async function generateStaticParams() {
  const products = await getAllProducts()
  return products.map((p) => ({ handle: p.handle }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProductByHandle(params.handle)
  if (!product) return {}

  const url = `https://mercimurphy.com/shop/${product.handle}`
  const image = product.featuredImage?.url

  return {
    title: product.title,
    description: product.description.slice(0, 160),
    alternates: { canonical: url },
    openGraph: {
      title: product.title,
      description: product.description.slice(0, 160),
      url,
      type: 'website',
      images: image ? [{ url: image, alt: product.title }] : [],
    },
  }
}

/**
 * Fiche produit. La colonne d'achat reste visible pendant le défilement de
 * la galerie.
 */
export default async function ProductPage({ params }: Props) {
  const product = await getProductByHandle(params.handle)
  if (!product) notFound()

  // Related products — from first collection, in-stock, excluding current
  const firstCollectionHandle = product.collections.nodes[0]?.handle
  const relatedCollection = firstCollectionHandle
    ? await getCollectionByHandle(firstCollectionHandle)
    : null
  const relatedProducts = (relatedCollection?.products.nodes ?? [])
    .filter((p) => p.handle !== product.handle && p.availableForSale)
    .slice(0, 4)

  const firstVariant = product.variants.nodes[0]
  const images = product.images.nodes
  // Les collections techniques (« All collection »…) sont masquées, comme dans le catalogue.
  const collectionTitles = product.collections.nodes
    .map((c) => c.title)
    .filter((t) => !HIDDEN_COLLECTION_TITLES.includes(t.toLowerCase()))
    .join(', ')

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image: images.map((i) => i.url),
    url: `https://mercimurphy.com/shop/${product.handle}`,
    brand: {
      '@type': 'Brand',
      name: product.vendor?.trim() || 'Merci Murphy',
    },
    offers: {
      '@type': 'Offer',
      price: firstVariant.price.amount,
      priceCurrency: firstVariant.price.currencyCode,
      availability: firstVariant.availableForSale
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url: `https://mercimurphy.com/shop/${product.handle}`,
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'FR',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 14,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/ReturnShippingFees',
        returnShippingFeesAmount: {
          '@type': 'MonetaryAmount',
          value: 7,
          currency: 'EUR',
        },
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: 7,
          currency: 'EUR',
        },
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'FR',
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 0,
            maxValue: 2,
            unitCode: 'DAY',
          },
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 2,
            maxValue: 5,
            unitCode: 'DAY',
          },
        },
      },
    },
  }

  // <main> : fourni en prod par le layout (shop), pas de <main> ici.
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="bg-white pb-16 pt-8 lg:pb-24 lg:pt-12">
        <div className={CONTAINER}>
          <Link href="/shop" className={cn(INLINE_LINK, 'text-sm')}>
            Retour à la boutique
          </Link>

          <div className="mt-8 grid grid-cols-1 gap-y-10 lg:mt-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-x-16">
            <div className={GALLERY_SKIN}>
              <ProductGallery images={images} title={product.title} />
            </div>

            <div className="lg:sticky lg:top-28 lg:self-start">
              {(collectionTitles || product.tags.length > 0) && (
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  {collectionTitles && (
                    <p className="text-sm text-charcoal/60">{noOrphan(collectionTitles)}</p>
                  )}
                  <ProductPromoBadge
                    tags={product.tags}
                    className="rounded-[2px] bg-terracotta-dark px-2 py-0.5 text-xs font-medium text-white"
                  />
                </div>
              )}

              <DisplayTitle as="h1" size="compact" className="mt-4">
                {product.title}
              </DisplayTitle>

              <div className={PRICE_SKIN}>
                <ProductPrice
                  tags={product.tags}
                  catalogPrice={firstVariant.price}
                  compareAtPrice={firstVariant.compareAtPrice}
                />
              </div>

              {product.description && (
                <div
                  className={DESCRIPTION}
                  dangerouslySetInnerHTML={{ __html: noOrphanHtml(product.descriptionHtml) }}
                />
              )}

              <div className="mt-10 border-t border-charcoal/15 pt-6">
                {!firstVariant.availableForSale ? (
                  <p className="text-sm font-medium text-terracotta-dark">Rupture de stock</p>
                ) : firstVariant.quantityAvailable <= 5 ? (
                  <p className="text-sm font-medium text-terracotta-dark">
                    Plus que {firstVariant.quantityAvailable} en stock
                  </p>
                ) : (
                  <p className="text-sm text-charcoal/60">En stock</p>
                )}

                <div className={cn(CART_SKIN, 'mt-4')}>
                  <AddToCart variant={firstVariant} />
                </div>

                <p className="mt-4 text-sm text-charcoal/60">
                  Vous serez redirigé(e) vers notre boutique Shopify sécurisée pour finaliser
                  votre commande.
                </p>
              </div>

              {/* Tarif et délais alignés sur le JSON-LD ; retours repris des CGV (article 9). */}
              <dl className={cn(RULED_LIST, 'mt-8 text-sm')}>
                <div
                  className={cn(RULED_ITEM, 'grid gap-1 py-4 sm:grid-cols-[7rem_minmax(0,1fr)]')}
                >
                  <dt className="text-charcoal">Livraison</dt>
                  <dd className="text-charcoal/60">
                    7 € en France. Expédition sous 2 jours, livraison en 2 à 5 jours.
                  </dd>
                </div>
                <div
                  className={cn(RULED_ITEM, 'grid gap-1 py-4 sm:grid-cols-[7rem_minmax(0,1fr)]')}
                >
                  <dt className="text-charcoal">Retours</dt>
                  <dd className="text-charcoal/60">
                    14 jours après la livraison pour retourner un article, frais de retour à votre
                    charge.{' '}
                    <Link href="/cgv" className={INLINE_LINK}>
                      Lire les CGV
                    </Link>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </section>

      {relatedProducts.length > 0 && (
        <section className="border-t border-charcoal/15 bg-cream py-16 lg:py-24">
          <div className={CONTAINER}>
            <DisplayTitle>Murphy aime aussi</DisplayTitle>
            <ul
              className={cn(
                GRID_SKIN,
                'mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-4 lg:mt-14 lg:gap-x-6'
              )}
            >
              {relatedProducts.map((p) => (
                <li key={p.handle}>
                  <ProductCard product={p} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  )
}
