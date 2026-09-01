import { getAllServicesForLlmsTxt } from '@/sanity/queries/services'
import { getAllPublishedSeoPagesForLlmsTxt } from '@/sanity/queries/seo-pages'
import { getSiteSettings } from '@/sanity/queries/site-settings'
import { getAllProducts } from '@/lib/shopify'

export const revalidate = 3600

const BASE = 'https://mercimurphy.com'

/** Collapses whitespace and trims a Sanity/Shopify description to one clean line. */
function oneLine(text: string | null | undefined, max = 160) {
  if (!text) return ''
  const flat = text.replace(/\s+/g, ' ').trim()
  return flat.length > max ? `${flat.slice(0, max - 1).trimEnd()}…` : flat
}

/** `- [Label](url): description` — the link format llms.txt expects. */
function entry(label: string, path: string, description?: string | null) {
  const desc = oneLine(description)
  return `- [${label}](${BASE}${path})${desc ? `: ${desc}` : ''}`
}

export async function GET() {
  const [services, seoPages, products, settings] = await Promise.all([
    getAllServicesForLlmsTxt().catch(() => []),
    getAllPublishedSeoPagesForLlmsTxt().catch(() => []),
    getAllProducts().catch(() => []),
    getSiteSettings().catch(() => null),
  ])

  // Each group is a distinct set of opening hours (salon, boutique…), so keep
  // its title — flattening them together produces contradictory ranges.
  const horaires = (settings?.horairesGroupes ?? [])
    .map((g) => {
      const lignes = g.lignes.map((l) => `${l.jour} : ${l.heures}`).join(' · ')
      return lignes ? `- **${g.titre}** : ${lignes}` : ''
    })
    .filter(Boolean)
    .join('\n')

  const coordonnees = settings
    ? [
        `- **Adresse** : ${settings.adresse}, ${settings.codePostal} ${settings.ville}`,
        `- **Téléphone** : ${settings.telephone}`,
        `- **Email** : ${settings.email}`,
        horaires,
      ]
        .filter(Boolean)
        .join('\n')
    : ''

  const sections = [
    `# merci murphy®`,
    `> Salon de toilettage et boutique de bien-être canin à Paris 9e. Toilettage chien et chat, balnéothérapie, massage, crèche canine, éducation et ostéopathie, ainsi qu'une boutique de produits naturels pour chiens.`,
    `merci murphy® est une adresse indépendante située au 18 rue Victor Massé, dans le 9e arrondissement de Paris. Les prestations se réservent par téléphone ou via le formulaire de réservation en ligne ; la boutique vend en ligne et sur place.`,
    coordonnees && `## Informations pratiques\n\n${coordonnees}`,
    `## Pages principales

${entry('Accueil', '/', 'Présentation du salon, des services et de la boutique.')}
${entry('Le concept', '/concept', 'La démarche de merci murphy® et son approche du bien-être canin.')}
${entry('Nos services', '/services', "L'ensemble des prestations proposées au salon.")}
${entry('Toilettage', '/toilettage', 'Le toilettage chien et chat : approche, déroulé et tarifs.')}
${entry('Réservation', '/reservation', 'Formulaire de demande de rendez-vous.')}
${entry('Contact', '/contact', 'Coordonnées, horaires et accès au salon.')}
${entry('Boutique', '/shop', 'Produits naturels, soins et accessoires pour chiens.')}
${entry('Revendeurs', '/revendeurs', 'Les points de vente partenaires.')}`,
    `## Pages de référence

${entry('Toilettage chien à Paris', '/toilettage-chien-paris', 'Prestations de toilettage canin à Paris 9e.')}
${entry('Toilettage chat à Paris', '/toilettage-chat-paris', 'Prestations de toilettage félin à Paris 9e.')}
${entry('Crèche canine à Paris', '/creche-canine-paris', 'Garde et crèche pour chiens à Paris 9e.')}`,
    services.length > 0 &&
      `## Services

${services.map((s) => entry(s.title, `/services/${s.slug.current}`, s.description)).join('\n')}`,
    seoPages.length > 0 &&
      `## Toilettage par race

${seoPages.map((p) => entry(p.race, `/toilettage/${p.slugRace}`, p.metaDescription)).join('\n')}`,
    products.length > 0 &&
      `## Boutique

${products.map((p) => entry(p.title, `/shop/${p.handle}`, p.description)).join('\n')}`,
    `## Optional

${entry('Mentions légales', '/mentions-legales')}
${entry('Politique de confidentialité', '/confidentialite')}
${entry('Plan du site', '/sitemap.xml')}`,
  ]

  const body = `${sections.filter(Boolean).join('\n\n')}\n`

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
