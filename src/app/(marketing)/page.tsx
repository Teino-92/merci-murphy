export const revalidate = 3600

import type { Metadata } from 'next'

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://mercimurphy.com',
  },
}

import { Hero } from '@/components/sections/hero'
import { ServicesGrid } from '@/components/sections/services-grid'
import { Values } from '@/components/sections/values'
import { ShopTeaser } from '@/components/sections/shop-teaser'
import { InstagramFeed } from '@/components/sections/instagram-feed'
import { InfoPratiques } from '@/components/sections/info-pratiques'
import { FeaturedPost } from '@/components/sections/featured-post'

import { getAllServices } from '@/sanity/queries/services'
import { getSiteSettings } from '@/sanity/queries/site-settings'
import { getLatestPost } from '@/sanity/queries/posts'
import { getProductsByHandles, getCollectionByHandle } from '@/lib/shopify'

const SHOP_TEASER_HANDLES = [
  'bonnet-cat-mom-marine',
  'le-murphy-week-end-cabas-ecru-its-never-just-a-dog',
  'bougie-merci-murphy-sans-un-mot-grand-format-copy',
  'mug-dog-mom',
  'le-murphy-week-end-cabas-caramel-my-dog-is-my-therapist-copy',
  'casquette-dog-mom',
]

export default async function HomePage() {
  const [services, settings, shopProducts, petloversCollection, latestPost] = await Promise.all([
    getAllServices(),
    getSiteSettings(),
    getProductsByHandles(SHOP_TEASER_HANDLES),
    getCollectionByHandle('petlovers'),
    getLatestPost(),
  ])

  const usedHandles = new Set(shopProducts.map((p) => p.handle))

  const fallbackPool = (petloversCollection?.products.nodes ?? []).filter(
    (p) => p.availableForSale && !usedHandles.has(p.handle)
  )

  const pickedFallbackHandles = new Set<string>()

  const finalProducts = shopProducts.map((p) => {
    if (p.availableForSale) return p
    if (fallbackPool.length === 0) return p

    const hash = p.handle.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
    const available = fallbackPool.filter((f) => !pickedFallbackHandles.has(f.handle))

    if (available.length === 0) return p

    const fallback = available[hash % available.length]
    pickedFallbackHandles.add(fallback.handle)

    return fallback
  })

  /* ---------------------------
     LOCAL BUSINESS
  ---------------------------- */
  const localBusinessLd = {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'PetStore'],
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

  /* ---------------------------
     SERVICES
  ---------------------------- */
  const servicesLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        name: 'Toilettage maison POILUS®',
        description: 'Bain et mise en beauté par des experts en pratiques sans stress.',
        provider: {
          '@type': 'LocalBusiness',
          name: 'Merci Murphy',
          url: 'https://mercimurphy.com',
        },
        areaServed: {
          '@type': 'City',
          name: 'Paris',
        },
        url: 'https://mercimurphy.com/services/le-toilettage-maison-poilus',
      },
      {
        '@type': 'Service',
        name: 'La crèche',
        description: 'Jeux et socialisation supervisés par un éducateur canin.',
        provider: {
          '@type': 'LocalBusiness',
          name: 'Merci Murphy',
          url: 'https://mercimurphy.com',
        },
        areaServed: {
          '@type': 'City',
          name: 'Paris',
        },
        url: 'https://mercimurphy.com/services/la-creche',
      },
      {
        '@type': 'Service',
        name: "L'éducation",
        description: 'Les bases pour un chien équilibré et bien dans ses pattes.',
        provider: {
          '@type': 'LocalBusiness',
          name: 'Merci Murphy',
          url: 'https://mercimurphy.com',
        },
        areaServed: {
          '@type': 'City',
          name: 'Paris',
        },
        url: 'https://mercimurphy.com/services/leducation',
      },
      {
        '@type': 'Service',
        name: "L'ostéopathie",
        description: 'Équilibre, mobilité et soulagement des tensions.',
        provider: {
          '@type': 'LocalBusiness',
          name: 'Merci Murphy',
          url: 'https://mercimurphy.com',
        },
        areaServed: {
          '@type': 'City',
          name: 'Paris',
        },
        url: 'https://mercimurphy.com/services/losteopathie',
      },
      {
        '@type': 'Service',
        name: 'Bain libre-service',
        description: 'Bichonnez vous-même votre chien dans des cabines équipées.',
        provider: {
          '@type': 'LocalBusiness',
          name: 'Merci Murphy',
          url: 'https://mercimurphy.com',
        },
        areaServed: {
          '@type': 'City',
          name: 'Paris',
        },
        url: 'https://mercimurphy.com/services/le-bain-libre-service',
      },
      {
        '@type': 'Service',
        name: 'Balnéo',
        description: 'Expérience bien-être aux multiples bienfaits.',
        provider: {
          '@type': 'LocalBusiness',
          name: 'Merci Murphy',
          url: 'https://mercimurphy.com',
        },
        areaServed: {
          '@type': 'City',
          name: 'Paris',
        },
        url: 'https://mercimurphy.com/services/la-balneo',
      },
      {
        '@type': 'Service',
        name: 'Massage bien-être',
        description: 'Détente et relâchement des tensions entre mains expertes.',
        provider: {
          '@type': 'LocalBusiness',
          name: 'Merci Murphy',
          url: 'https://mercimurphy.com',
        },
        areaServed: {
          '@type': 'City',
          name: 'Paris',
        },
      },
    ],
  }

  /* ---------------------------
     WEBSITE
  ---------------------------- */
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

  /* ---------------------------
     BREADCRUMBS
  ---------------------------- */
  const sitelinksBreadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Services',
        item: 'https://mercimurphy.com/services',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Boutique',
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(servicesLd) }}
      />
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
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(sitelinksBreadcrumbLd),
        }}
      />

      <Hero
        subtitle="Vivre heureux avec son chien et son chat à Paris."
        imageSrc="/concept-hero.jpg"
      />

      <ShopTeaser products={finalProducts} />

      {services.length > 0 && <ServicesGrid services={services} preview />}

      <Values />

      {latestPost && <FeaturedPost post={latestPost} />}

      {process.env.NEXT_PUBLIC_BEHOLD_FEED_ID && (
        <InstagramFeed feedId={process.env.NEXT_PUBLIC_BEHOLD_FEED_ID} />
      )}

      {settings && <InfoPratiques settings={settings} />}
    </>
  )
}
