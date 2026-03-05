import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getAllProducts, getProductByHandle, formatPrice } from '@/lib/shopify'
import { AddToCart } from '@/components/shop/add-to-cart'
import { Section, Container } from '@/components/ui/section'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft } from 'lucide-react'

interface Props {
  params: { handle: string }
}

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

export default async function ProductPage({ params }: Props) {
  const product = await getProductByHandle(params.handle)
  if (!product) notFound()

  const firstVariant = product.variants.nodes[0]
  const images = product.images.nodes

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image: images.map((i) => i.url),
    url: `https://mercimurphy.com/shop/${product.handle}`,
    offers: {
      '@type': 'Offer',
      price: firstVariant.price.amount,
      priceCurrency: firstVariant.price.currencyCode,
      availability: firstVariant.availableForSale
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url: `https://mercimurphy.com/shop/${product.handle}`,
    },
  }

  const isOnSale =
    firstVariant.compareAtPrice &&
    parseFloat(firstVariant.compareAtPrice.amount) > parseFloat(firstVariant.price.amount)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Section className="bg-cream">
        <Container>
          <Link
            href="/shop"
            className="mb-8 inline-flex items-center gap-1 text-sm text-charcoal/50 hover:text-terracotta"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à la boutique
          </Link>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            {/* Images */}
            <div className="space-y-4">
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-rose/20">
                {images[0] && (
                  <Image
                    src={images[0].url}
                    alt={images[0].altText ?? product.title}
                    fill
                    priority
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                )}
              </div>
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {images.slice(1, 5).map((img, i) => (
                    <div
                      key={i}
                      className="relative aspect-square overflow-hidden rounded-xl bg-rose/20"
                    >
                      <Image
                        src={img.url}
                        alt={img.altText ?? product.title}
                        fill
                        className="object-cover"
                        sizes="25vw"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex flex-col">
              {product.collections.nodes.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {product.collections.nodes.map((c) => (
                    <Badge key={c.handle} variant="secondary" className="text-xs">
                      {c.title}
                    </Badge>
                  ))}
                </div>
              )}

              <h1 className="font-display text-3xl font-bold text-charcoal sm:text-4xl">
                {product.title}
              </h1>

              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-2xl font-bold text-terracotta">
                  {formatPrice(firstVariant.price)}
                </span>
                {isOnSale && firstVariant.compareAtPrice && (
                  <span className="text-base text-charcoal/40 line-through">
                    {formatPrice(firstVariant.compareAtPrice)}
                  </span>
                )}
              </div>

              {product.description && (
                <div
                  className="mt-6 text-sm leading-relaxed text-charcoal/70"
                  dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
                />
              )}

              {/* Stock indicator */}
              <div className="mt-6">
                {!firstVariant.availableForSale ? (
                  <p className="text-sm font-medium text-red-500">Rupture de stock</p>
                ) : firstVariant.quantityAvailable <= 5 ? (
                  <p className="text-sm font-medium text-terracotta">
                    Plus que {firstVariant.quantityAvailable} en stock
                  </p>
                ) : (
                  <p className="text-sm text-charcoal/40">En stock</p>
                )}
              </div>

              <div className="mt-4">
                <AddToCart variant={firstVariant} />
              </div>

              <p className="mt-4 text-xs text-charcoal/40 text-center">
                Vous serez redirigé(e) vers notre boutique Shopify sécurisée pour finaliser votre
                commande.
              </p>
            </div>
          </div>
        </Container>
      </Section>
    </>
  )
}
