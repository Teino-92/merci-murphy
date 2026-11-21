/**
 * Global Organization JSON-LD for merci murphy®.
 * Rendered once in the marketing layout so every page reinforces the brand
 * entity. `alternateName` covers the spellings people actually type
 * ("merci murphy", "Merci Murphy") - helps Google tie the bare brand query
 * to this site (navigational intent → sitelinks).
 */
export const ORGANIZATION_ID = 'https://mercimurphy.com/#organization'

export function OrganizationSchema() {
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: 'merci murphy®',
    alternateName: ['Merci Murphy', 'merci murphy'],
    legalName: 'Merci Murphy',
    url: 'https://mercimurphy.com',
    logo: {
      '@type': 'ImageObject',
      url: 'https://mercimurphy.com/logo.avif',
    },
    sameAs: ['https://www.instagram.com/mercimurphy/'],
    brand: {
      '@type': 'Brand',
      name: 'maison POILUS®',
      url: 'https://mercimurphy.com/concept#maison-poilus',
      description:
        'Gamme de soins naturels pour chiens fabriqués en France par un partenaire et utilisés pour le toilettage, les bains et le dog wash (shampoings, démêlants à base de plantes, huiles essentielles et élixirs floraux) et méthode de toilettage sans stress de merci murphy®.',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+33 9 78 81 04 21',
      email: 'bonjour@mercimurphy.com',
      contactType: 'customer service',
      availableLanguage: 'French',
    },
  }

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
  )
}
