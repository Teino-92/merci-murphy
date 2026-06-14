export const revalidate = 3600

import Link from 'next/link'
import type { Metadata } from 'next'
import { Section, Container } from '@/components/ui/section'
import { Reveal } from '@/components/ui/reveal'
import { getAllPublishedSeoPages, type SeoPageSummary } from '@/sanity/queries/seo-pages'

const SITE_URL = 'https://mercimurphy.com'

const GABARIT_ORDER = ['très petit', 'petit', 'moyen', 'grand', 'très grand'] as const

export const metadata: Metadata = {
  title: 'Toilettage chien à Paris par race — merci murphy®',
  description:
    'Découvrez nos soins de toilettage adaptés à chaque race à Paris 9e. Golden Retriever, Caniche, Yorkshire, Berger Australien et plus encore.',
  alternates: { canonical: `${SITE_URL}/toilettage` },
  openGraph: {
    title: 'Toilettage chien à Paris par race — merci murphy®',
    description:
      'Soins de toilettage adaptés à chaque race à Paris 9e. Approche premium, savoir-faire reconnu.',
    url: `${SITE_URL}/toilettage`,
    type: 'website',
  },
}

function groupByGabarit(pages: SeoPageSummary[]): [string, SeoPageSummary[]][] {
  const buckets: Record<string, SeoPageSummary[]> = {}
  for (const g of GABARIT_ORDER) buckets[g] = []
  const other: SeoPageSummary[] = []
  for (const p of pages) {
    const g = p.gabarit ?? ''
    if (g in buckets) buckets[g].push(p)
    else other.push(p)
  }
  const ordered: [string, SeoPageSummary[]][] = GABARIT_ORDER.filter(
    (g) => buckets[g].length > 0
  ).map((g) => [g, buckets[g]])
  if (other.length > 0) ordered.push(['autres', other])
  return ordered
}

function buildJsonLd(pages: SeoPageSummary[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Toilettage chien à Paris par race — merci murphy®',
    itemListElement: pages.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${SITE_URL}/toilettage/${p.slugRace}`,
      name: `Toilettage ${p.race} à Paris`,
    })),
  }
}

export default async function ToilettageHubPage() {
  const pages = await getAllPublishedSeoPages()
  const grouped = groupByGabarit(pages)
  const jsonLd = buildJsonLd(pages)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <Section className="bg-charcoal pt-20 pb-12 lg:pt-28 lg:pb-16">
        <Container className="max-w-3xl text-center">
          <Reveal>
            <p className="mb-4 text-sm uppercase tracking-widest text-cream/60">
              Spa canin · Paris 9e
            </p>
            <h1 className="font-display text-4xl font-bold text-cream sm:text-5xl lg:text-6xl">
              Toilettage chien à Paris par race
            </h1>
            <p className="mt-6 text-cream/70 sm:text-lg">
              Chaque race a son pelage, ses besoins, son rythme. Trouvez le soin adapté à votre
              loulou.
            </p>
          </Reveal>
        </Container>
      </Section>

      {/* Grille par gabarit */}
      <Section className="bg-cream">
        <Container className="max-w-5xl">
          {pages.length === 0 ? (
            <p className="text-center text-charcoal/60">
              Les pages races sont en cours de publication. Revenez bientôt.
            </p>
          ) : (
            <div className="space-y-12">
              {grouped.map(([gabarit, list]) => (
                <Reveal key={gabarit}>
                  <h2 className="font-display text-2xl font-bold text-charcoal capitalize sm:text-3xl">
                    {gabarit === 'autres' ? 'Autres races' : `Chiens ${gabarit}s`}
                  </h2>
                  <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
                    {list.map((p) => (
                      <Link
                        key={p._id}
                        href={`/toilettage/${p.slugRace}`}
                        className="group rounded-2xl border border-charcoal/10 bg-white p-5 transition hover:border-terracotta-dark/40 hover:shadow-sm"
                      >
                        <p className="font-display text-lg font-semibold text-charcoal group-hover:text-terracotta-dark">
                          {p.race}
                        </p>
                        {p.typePoil && (
                          <p className="mt-1 text-xs text-charcoal/50 capitalize">
                            Pelage {p.typePoil}
                          </p>
                        )}
                      </Link>
                    ))}
                  </div>
                </Reveal>
              ))}
            </div>
          )}
        </Container>
      </Section>

      {/* CTA vers page service principale */}
      <div style={{ backgroundColor: '#B5A89A' }}>
        <Section className="text-charcoal">
          <Container className="max-w-2xl text-center">
            <Reveal>
              <h2 className="font-display text-2xl font-bold sm:text-3xl">
                Une question sur le toilettage ?
              </h2>
              <p className="mt-4 text-charcoal/70">
                Consultez la page complète de notre service toilettage avec tarifs et déroulé.
              </p>
              <Link
                href="/services/le-toilettage-maison-poilus-r"
                className="mt-8 inline-block rounded-full bg-charcoal px-8 py-3 font-semibold text-cream transition hover:bg-charcoal/90"
              >
                Voir le service toilettage
              </Link>
            </Reveal>
          </Container>
        </Section>
      </div>
    </>
  )
}
