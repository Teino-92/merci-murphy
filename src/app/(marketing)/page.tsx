export const revalidate = 3600

import { Hero } from '@/components/sections/hero'
import { ServicesGrid } from '@/components/sections/services-grid'
import { Values } from '@/components/sections/values'
import { ShopTeaser } from '@/components/sections/shop-teaser'
import { InstagramFeed } from '@/components/sections/instagram-feed'
import { InfoPratiques } from '@/components/sections/info-pratiques'
import { getAllServices } from '@/sanity/queries/services'
import { getSiteSettings } from '@/sanity/queries/site-settings'
import { getProductsByHandles, getCollectionByHandle } from '@/lib/shopify'

// Handles in the exact order you want them in the carousel
const SHOP_TEASER_HANDLES = [
  'bonnet-cat-mom-marine', // Bonnet cat mom marine
  'le-murphy-week-end-cabas-ecru-its-never-just-a-dog', // Cabas écru
  'bougie-merci-murphy-sans-un-mot-grand-format-copy', // Bougie petit format
  'mug-dog-mom', // Mug dog mom
  'le-murphy-week-end-cabas-caramel-my-dog-is-my-therapist-copy', // Cabas vert
  'casquette-dog-mom', // Casquette
]

export default async function HomePage() {
  const [services, settings, shopProducts, petloversCollection] = await Promise.all([
    getAllServices(),
    getSiteSettings(),
    getProductsByHandles(SHOP_TEASER_HANDLES),
    getCollectionByHandle('petlovers'),
  ])

  // Replace out-of-stock items with random in-stock products from petlovers
  const usedHandles = new Set(shopProducts.map((p) => p.handle))
  const fallbackPool = (petloversCollection?.products.nodes ?? []).filter(
    (p) => p.availableForSale && !usedHandles.has(p.handle)
  )
  // Shuffle fallback pool
  for (let i = fallbackPool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[fallbackPool[i], fallbackPool[j]] = [fallbackPool[j], fallbackPool[i]]
  }
  let fallbackIndex = 0
  const finalProducts = shopProducts.map((p) => {
    if (!p.availableForSale && fallbackIndex < fallbackPool.length) {
      return fallbackPool[fallbackIndex++]
    }
    return p
  })

  const localBusinessLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Merci Murphy',
    description:
      'Boutique premium de bien-être pour chiens à Paris. Toilettage, spa, crèche, éducation et ostéopathie.',
    url: 'https://mercimurphy.com',
    image: 'https://mercimurphy.com/logo.avif',
    telephone: settings?.telephone,
    email: settings?.email,
    address: settings
      ? {
          '@type': 'PostalAddress',
          streetAddress: settings.adresse,
          postalCode: settings.codePostal,
          addressLocality: settings.ville,
          addressCountry: 'FR',
        }
      : undefined,
    openingHoursSpecification: settings?.horairesGroupes?.flatMap(
      (g) =>
        g.lignes?.map((h) => ({
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: h.jour,
          opens: h.heures.split('-')[0]?.trim(),
          closes: h.heures.split('-')[1]?.trim(),
        })) ?? []
    ),
    sameAs: [settings?.instagram].filter(Boolean),
  }

  const websiteLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Merci Murphy',
    url: 'https://mercimurphy.com',
    inLanguage: 'fr-FR',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://mercimurphy.com/boutique?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  }

  const sitelinksBreadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Nos services',
        item: 'https://mercimurphy.com/services',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'La boutique',
        item: 'https://mercimurphy.com/boutique',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Réserver',
        item: 'https://mercimurphy.com/reserver',
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: 'Contact',
        item: 'https://mercimurphy.com/contact',
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(sitelinksBreadcrumbLd) }}
      />
      <Hero
        subtitle="Vivre heureux avec son chien et son chat à Paris. Toute l'attention et l'expertise que votre animal mérite, dans un lieu responsable, chaleureux et bienveillant."
        imageSrc="/concept-hero.jpg"
      />
      <ShopTeaser products={finalProducts} />
      {services.length > 0 && <ServicesGrid services={services} preview />}
      <Values />
      {process.env.NEXT_PUBLIC_BEHOLD_FEED_ID && (
        <InstagramFeed feedId={process.env.NEXT_PUBLIC_BEHOLD_FEED_ID} />
      )}
      {settings && <InfoPratiques settings={settings} />}
    </>
  )
}
