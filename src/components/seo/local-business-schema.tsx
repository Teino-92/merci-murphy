import type { SiteSettings } from '@/sanity/queries/site-settings'

/**
 * Canonical LocalBusiness JSON-LD for merci murphy®.
 * Use the same @id on every page that mentions the business so Google
 * deduplicates into a single entity (boosts Local Pack signal).
 */
export const LOCAL_BUSINESS_ID = 'https://mercimurphy.com/#localbusiness'

interface Props {
  settings: SiteSettings | null
  /** Optional canonical page URL for `mainEntityOfPage` linkage. */
  pageUrl?: string
  /** Extra @types beyond LocalBusiness/PetStore (e.g. 'AnimalShelter'). */
  extraTypes?: string[]
}

export function LocalBusinessSchema({ settings, pageUrl, extraTypes = [] }: Props) {
  const types = ['LocalBusiness', 'PetStore', ...extraTypes]

  const openingHours = settings?.horairesGroupes?.flatMap(
    (g) =>
      g.lignes?.map((h) => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: h.jour,
        opens: h.heures.split('-')[0]?.trim(),
        closes: h.heures.split('-')[1]?.trim(),
      })) ?? []
  )

  const ld = {
    '@context': 'https://schema.org',
    '@type': types,
    '@id': LOCAL_BUSINESS_ID,
    name: 'merci murphy®',
    legalName: 'Merci Murphy',
    description:
      'Toilettage, spa, crèche et bien-être pour chiens à Paris 75009. Un lieu premium et engagé pour prendre soin de votre compagnon.',
    url: 'https://mercimurphy.com',
    logo: 'https://mercimurphy.com/logo.avif',
    image: 'https://mercimurphy.com/og/og-home.jpg',
    telephone: settings?.telephone ?? '+33 9 78 81 04 21',
    email: settings?.email ?? 'bonjour@mercimurphy.com',
    priceRange: '€€',
    currenciesAccepted: 'EUR',
    paymentAccepted: 'Cash, Credit Card',
    address: {
      '@type': 'PostalAddress',
      streetAddress: settings?.adresse ?? '18 rue Victor Massé',
      postalCode: settings?.codePostal ?? '75009',
      addressLocality: settings?.ville ?? 'Paris',
      addressRegion: 'Île-de-France',
      addressCountry: 'FR',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 48.880805,
      longitude: 2.338646,
    },
    hasMap:
      settings?.google_maps_url ?? 'https://maps.google.com/?q=18+rue+Victor+Mass%C3%A9+Paris',
    openingHoursSpecification: openingHours,
    sameAs: [settings?.instagram, 'https://www.instagram.com/mercimurphy/'].filter(
      (v, i, a) => v && a.indexOf(v) === i
    ),
    areaServed: [
      { '@type': 'City', name: 'Paris' },
      { '@type': 'AdministrativeArea', name: 'Paris 9ème' },
      { '@type': 'AdministrativeArea', name: 'Paris 18ème' },
      { '@type': 'AdministrativeArea', name: 'Paris 10ème' },
      { '@type': 'AdministrativeArea', name: 'Paris 2ème' },
      { '@type': 'AdministrativeArea', name: 'Paris 1er' },
    ],
    ...(pageUrl ? { mainEntityOfPage: pageUrl } : {}),
  }

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
  )
}
