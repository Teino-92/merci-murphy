export const revalidate = 300

import type { Metadata } from 'next'

export const metadata: Metadata = {
  // Home = pilier "toiletteur Paris" généraliste (chien + chat), qui chapeaute
  // les satellites /toilettage-chien-paris et /toilettage-chat-paris. On garde
  // "chien" en tête (rank #1 acquis) mais on élargit l'entité au chat pour
  // capter la requête large "toiletteur Paris" (aujourd'hui rank 5-6).
  title: 'Toiletteur chien & chat à Paris 9e — merci murphy® · Spa Paris 75009',
  description:
    'Toiletteur pour chien et chat à Paris 9e (75009), rue Victor Massé. Salon de toilettage premium, bain, spa, crèche et bien-être animal. Sans stress, par des experts.',
  keywords: [
    'toiletteur Paris',
    'toiletteur chien Paris',
    'toiletteur chat Paris',
    'salon de toilettage Paris',
    'toilettage chien Paris',
    'toilettage chat Paris',
    'spa chien Paris',
  ],
  alternates: {
    canonical: 'https://mercimurphy.com',
  },
}

import { GroomingSpotlightV2 } from '@/components/sections/grooming-spotlight-v2'
import { HeroV2 } from '@/components/sections/hero-v2'
import { HomeBlogV2 } from '@/components/sections/home-blog-v2'
import { InfoPratiquesV2 } from '@/components/sections/info-pratiques-v2'
import { InstagramFeedV2 } from '@/components/sections/instagram-feed-v2'
import { ServicesV2 } from '@/components/sections/services-v2'
import { ShopTeaserV2 } from '@/components/sections/shop-teaser-v2'
import { ValuesV2 } from '@/components/sections/values-v2'
import { getCollectionByHandle } from '@/lib/shopify'
import { getLatestPosts } from '@/sanity/queries/posts'
import { getAllServices } from '@/sanity/queries/services'
import { PopUpGaleriesLafayette } from '@/components/sections/popup-galeries-lafayette'
import { getSiteSettings } from '@/sanity/queries/site-settings'
import { getGroomingTestimonials } from '@/sanity/queries/testimonials'

export default async function HomePage() {
  const [services, petlovers, settings, latestPosts, groomingTestimonials] = await Promise.all([
    getAllServices(),
    getCollectionByHandle('petlovers'),
    getSiteSettings(),
    getLatestPosts(3),
    getGroomingTestimonials(),
  ])

  const products = (petlovers?.products.nodes ?? []).filter((p) => p.availableForSale).slice(0, 6)
  const instagramFeedId = process.env.NEXT_PUBLIC_BEHOLD_FEED_ID

  /* ---------------------------
     LOCAL BUSINESS
  ---------------------------- */
  const localBusinessLd = {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'PetStore'],
    name: 'merci murphy®',
    description:
      'Toilettage, spa, crèche et bien-être pour chiens à Paris 75009. Un lieu premium et engagé pour prendre soin de votre compagnon.',
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
          name: 'merci murphy®',
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
          name: 'merci murphy®',
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
          name: 'merci murphy®',
          url: 'https://mercimurphy.com',
        },
        areaServed: {
          '@type': 'City',
          name: 'Paris',
        },
        url: 'https://mercimurphy.com/services/l-education',
      },
      {
        '@type': 'Service',
        name: "L'ostéopathie",
        description: 'Équilibre, mobilité et soulagement des tensions.',
        provider: {
          '@type': 'LocalBusiness',
          name: 'merci murphy®',
          url: 'https://mercimurphy.com',
        },
        areaServed: {
          '@type': 'City',
          name: 'Paris',
        },
        url: 'https://mercimurphy.com/services/l-osteopathie',
      },
      {
        '@type': 'Service',
        name: 'LE BAIN EN LIBRE-SERVICE maison POILUS®',
        description: 'Bichonnez vous-même votre chien dans des cabines équipées.',
        provider: {
          '@type': 'LocalBusiness',
          name: 'merci murphy®',
          url: 'https://mercimurphy.com',
        },
        areaServed: {
          '@type': 'City',
          name: 'Paris',
        },
        url: 'https://mercimurphy.com/services/le-bain-en-libre-service-maison-poilus-r',
      },
      {
        '@type': 'Service',
        name: 'BALNÉO maison POILUS®',
        description: 'Expérience bien-être aux multiples bienfaits.',
        provider: {
          '@type': 'LocalBusiness',
          name: 'merci murphy®',
          url: 'https://mercimurphy.com',
        },
        areaServed: {
          '@type': 'City',
          name: 'Paris',
        },
        url: 'https://mercimurphy.com/services/balneo-maison-poilus-r',
      },
      {
        '@type': 'Service',
        name: 'LE MASSAGE BIEN-ÊTRE maison POILUS® & Le Petit Nénuphar',
        description: 'Détente et relâchement des tensions entre de bonnes et douces mains.',
        provider: {
          '@type': 'LocalBusiness',
          name: 'merci murphy®',
          url: 'https://mercimurphy.com',
        },
        areaServed: {
          '@type': 'City',
          name: 'Paris',
        },
        url: 'https://mercimurphy.com/services/le-massage-bien-etre-maison-poilus-r-and-le-petit-nenuphar',
      },
    ],
  }

  /* ---------------------------
     WEBSITE
  ---------------------------- */
  const websiteLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'merci murphy®',
    alternateName: ['Merci Murphy', 'merci murphy'],
    url: 'https://mercimurphy.com',
    inLanguage: 'fr-FR',
    publisher: { '@id': 'https://mercimurphy.com/#organization' },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://mercimurphy.com/shop?q={search_term_string}',
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
        item: 'https://mercimurphy.com/shop',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Réserver',
        item: 'https://mercimurphy.com/reservation',
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

      <HeroV2 subtitle="merci murphy® propose des services de toilettage, spa et crèche pour chiens et chats à Paris 9, dans un cadre premium dédié au bien-être animal." />

      <ShopTeaserV2 products={products} />

      <ServicesV2 services={services} />

      <GroomingSpotlightV2
        testimonials={groomingTestimonials}
        googleUrl={settings?.google_maps_url}
      />

      <ValuesV2 />

      <HomeBlogV2 posts={latestPosts} />

      <PopUpGaleriesLafayette />

      {instagramFeedId && <InstagramFeedV2 feedId={instagramFeedId} />}

      {settings && <InfoPratiquesV2 settings={settings} />}
    </>
  )
}
