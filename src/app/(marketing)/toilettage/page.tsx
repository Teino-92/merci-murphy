export const revalidate = 3600

import type { Metadata } from 'next'
import Link from 'next/link'

import { PageHeaderV2 } from '@/components/sections/page-header-v2'
import { Button } from '@/components/ui/button'
import { CONTAINER, DisplayTitle, FOCUS_RING } from '@/components/ui/editorial'
import { cn } from '@/lib/utils'
import { getAllPublishedSeoPages, type SeoPageSummary } from '@/sanity/queries/seo-pages'
import { noOrphan } from '@/lib/typo'

const SITE_URL = 'https://mercimurphy.com'

export const metadata: Metadata = {
  title: { absolute: 'Toilettage chien à Paris par race — merci murphy®' },
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

const GABARIT_ORDER = ['très petit', 'petit', 'moyen', 'grand', 'très grand'] as const

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

// JSON-LD identique à la prod : les URL restent canoniques.
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

/**
 * Hub toilettage par race. Le surtitre
 * est la ligne italique ; les cartes arrondies deviennent un index à
 * filets, un gabarit par rangée, le titre à gauche et les races à droite.
 */
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

      <PageHeaderV2
        title="Toilettage chien à Paris par race"
        sub="Spa canin, Paris 9e"
        intro="Chaque race a son pelage, ses besoins, son rythme. Trouvez le soin adapté à votre loulou."
        image={{
          src: '/avant-apres-2-apres.jpg',
          alt: 'Un chien tout juste toiletté chez merci murphy®',
          position: 'center 30%',
        }}
      />

      <section className="bg-white py-16 lg:py-24">
        <div className={CONTAINER}>
          {pages.length === 0 ? (
            <p className="max-w-lg text-base leading-relaxed text-charcoal/70">
              Les pages races sont en cours de publication. Revenez bientôt.
            </p>
          ) : (
            <div className="border-b border-charcoal/15">
              {grouped.map(([gabarit, list]) => (
                <div
                  key={gabarit}
                  className="grid grid-cols-1 gap-y-6 border-t border-charcoal/15 py-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,2.2fr)] lg:gap-x-16 lg:py-14"
                >
                  <h2 className="font-display text-3xl font-normal leading-tight tracking-[-0.01em] text-charcoal sm:text-4xl lg:sticky lg:top-28 lg:self-start">
                    {noOrphan(gabarit === 'autres' ? 'Autres races' : `Chiens ${gabarit}s`)}
                  </h2>

                  <ul className="grid grid-cols-2 gap-x-5 sm:gap-x-10 xl:grid-cols-3">
                    {list.map((p) => (
                      <li
                        key={p._id}
                        className="border-t border-charcoal/15 [&:nth-child(-n+2)]:border-t-0 xl:[&:nth-child(-n+3)]:border-t-0"
                      >
                        <Link
                          href={`/toilettage/${p.slugRace}`}
                          className={cn(
                            'group block rounded-sm py-4 transition-colors lg:py-5',
                            FOCUS_RING
                          )}
                        >
                          <span className="block font-display text-xl leading-snug text-charcoal transition-colors group-hover:text-terracotta-dark lg:text-2xl">
                            {noOrphan(p.race, 28, true)}
                          </span>
                          {noOrphan(
                            p.typePoil && (
                              <span className="mt-1 block text-sm text-charcoal/60">
                                Pelage {p.typePoil}
                              </span>
                            )
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-[#B5A89A] py-16 lg:py-24">
        <div
          className={cn(
            CONTAINER,
            'flex flex-col gap-y-8 lg:flex-row lg:items-end lg:justify-between lg:gap-x-16'
          )}
        >
          <div className="max-w-2xl">
            <DisplayTitle size="compact" surface="taupe">
              Une question sur le toilettage ?
            </DisplayTitle>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-charcoal/80 lg:text-lg">
              Consultez la page complète de notre service toilettage avec tarifs et déroulé.
            </p>
          </div>
          <Button
            asChild
            size="lg"
            className="h-12 self-start bg-charcoal px-8 text-[15px] text-cream hover:bg-charcoal/90 lg:self-auto"
          >
            <Link href="/services/le-toilettage-maison-poilus-r">Voir le service toilettage</Link>
          </Button>
        </div>
      </section>
    </>
  )
}
