export const revalidate = 3600

import type { PortableTextBlock } from '@portabletext/react'
import { toPlainText } from '@portabletext/toolkit'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { BookingCta } from '@/components/sections/booking-cta'
import { FaqV2 } from '@/components/sections/faq-v2'
import { PageHeaderV2 } from '@/components/sections/page-header-v2'
import { PortableText } from '@/components/sections/portable-text'
import { CONTAINER, DisplayTitle, FOCUS_RING, TEXT_LINK } from '@/components/ui/editorial'
import { cn, stripBrandSuffix } from '@/lib/utils'
import {
  getAllPublishedSeoPages,
  getRelatedSeoPages,
  getSeoPageBySlugRace,
} from '@/sanity/queries/seo-pages'
import { getSiteSettings } from '@/sanity/queries/site-settings'
import { noOrphan } from '@/lib/typo'

interface Props {
  params: { race: string }
}

const SITE_URL = 'https://mercimurphy.com'

const SPLIT = cn(
  CONTAINER,
  'grid grid-cols-1 gap-y-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,2.1fr)] lg:gap-x-16'
)
const STICKY = 'lg:sticky lg:top-28 lg:self-start'
const BODY = 'max-w-2xl text-base lg:text-lg'

export async function generateStaticParams() {
  const pages = await getAllPublishedSeoPages()
  return pages.map((p) => ({ race: p.slugRace }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await getSeoPageBySlugRace(params.race)
  if (!page) return {}

  const url = `${SITE_URL}/toilettage/${page.slugRace}`
  // Suffixe Sanity « merci murphy® … Paris 9e » retiré : il faisait ranker les
  // pages races sur « toiletteur paris 9 » (réservé home/pilier) et doublait la
  // marque avec le template du layout.
  const title = `${stripBrandSuffix(page.metaTitle)} | merci murphy®`

  return {
    title: { absolute: title },
    description: page.metaDescription,
    alternates: { canonical: url },
    openGraph: {
      title,
      description: page.metaDescription,
      url,
      type: 'article',
    },
  }
}

// JSON-LD identique à la prod : les URL restent canoniques.
function buildJsonLd(page: {
  race: string
  slugRace: string
  title: string
  metaDescription: string
  faq: { question: string; reponse: PortableTextBlock[] }[]
}) {
  const url = `${SITE_URL}/toilettage/${page.slugRace}`
  const service = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: page.title,
    description: page.metaDescription,
    url,
    serviceType: `Toilettage canin pour ${page.race}`,
    areaServed: { '@type': 'City', name: 'Paris' },
    provider: {
      '@type': 'LocalBusiness',
      name: 'merci murphy®',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '18 rue Victor Massé',
        addressLocality: 'Paris',
        postalCode: '75009',
        addressCountry: 'FR',
      },
      url: SITE_URL,
    },
  }
  const faqPage = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: page.faq.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: toPlainText(f.reponse),
      },
    })),
  }
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Toilettage', item: `${SITE_URL}/toilettage` },
      { '@type': 'ListItem', position: 3, name: page.race, item: url },
    ],
  }
  return [service, faqPage, breadcrumb]
}

/**
 * Page race. Même
 * charpente que la page service : titre de section collant à gauche, texte à
 * droite ; l'encart tarifs et les cartes « autres races » perdent leurs coins
 * arrondis au profit des filets.
 */
export default async function RacePage({ params }: Props) {
  const page = await getSeoPageBySlugRace(params.race)
  if (!page) notFound()

  const related = await getRelatedSeoPages(page.slugRace, page.gabarit, page.typePoil)
  const settings = await getSiteSettings()
  const jsonLd = buildJsonLd(page)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PageHeaderV2 title={page.title} sub="Toilettage canin, Paris 9e">
        <BookingCta className="h-12 self-start px-8 text-[15px] sm:self-auto" />
        <Link href="#tarifs" className={cn(TEXT_LINK.light, 'self-start sm:self-auto')}>
          Voir les tarifs
        </Link>
      </PageHeaderV2>

      {page.intro && page.intro.length > 0 && (
        <section className="bg-white py-16 lg:py-24">
          <div className={SPLIT}>
            <div aria-hidden="true" className="hidden lg:block" />
            <PortableText value={page.intro} className={BODY} />
          </div>
        </section>
      )}

      {page.approche && page.approche.length > 0 && (
        <section className="bg-[#4F6072] py-16 lg:py-24">
          <div className={SPLIT}>
            <div className={STICKY}>
              <DisplayTitle size="compact" surface="slate">
                Notre approche pour {page.race}
              </DisplayTitle>
            </div>
            <PortableText value={page.approche} light className={BODY} />
          </div>
        </section>
      )}

      {page.frequence && page.frequence.length > 0 && (
        <section className="bg-white py-16 lg:py-24">
          <div className={SPLIT}>
            <div className={STICKY}>
              <DisplayTitle size="compact">
                À quelle fréquence faire toiletter un {page.race} à Paris ?
              </DisplayTitle>
            </div>
            <PortableText value={page.frequence} className={BODY} />
          </div>
        </section>
      )}

      <section className="bg-cream py-16 lg:py-24">
        <div className={SPLIT}>
          <div className={STICKY}>
            <DisplayTitle id="tarifs" size="compact" className="scroll-mt-28">
              Tarifs détaillés par gabarit
            </DisplayTitle>
          </div>
          <div className="max-w-2xl border-t border-charcoal/15 pt-6 lg:pt-8">
            <p className="text-base leading-relaxed text-charcoal/80 lg:text-lg">
              Nos tarifs varient selon le gabarit, l&apos;état du pelage et les prestations
              choisies. Retrouvez la grille complète sur notre page toilettage.
            </p>
            <Link
              href="/services/le-toilettage-maison-poilus-r#tarifs"
              className={cn(TEXT_LINK.light, 'mt-6 inline-block')}
            >
              Voir les tarifs
            </Link>
          </div>
        </div>
      </section>

      {page.faq && page.faq.length > 0 && (
        <FaqV2 items={page.faq} title={`Questions fréquentes — ${page.race}`} />
      )}

      {related.length > 0 && (
        <section className="bg-white py-16 lg:py-24">
          <div className={SPLIT}>
            <div className={STICKY}>
              <DisplayTitle size="compact">Autres races à découvrir</DisplayTitle>
              <Link href="/toilettage" className={cn(TEXT_LINK.light, 'mt-8 inline-block')}>
                Voir toutes les races
              </Link>
            </div>

            <ul className="grid grid-cols-2 gap-x-5 border-b border-charcoal/15 sm:gap-x-10 xl:grid-cols-3">
              {related.map((r) => (
                <li key={r._id} className="border-t border-charcoal/15">
                  <Link
                    href={`/toilettage/${r.slugRace}`}
                    className={cn('group block rounded-sm py-5 lg:py-6', FOCUS_RING)}
                  >
                    <span className="block font-display text-xl leading-snug text-charcoal transition-colors group-hover:text-terracotta-dark lg:text-2xl">
                      {r.race}
                    </span>
                    {noOrphan(
                      r.gabarit && (
                        <span className="mt-1 block text-sm text-charcoal/60 first-letter:uppercase">
                          {r.gabarit}
                        </span>
                      )
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="bg-[#B5A89A] py-16 lg:py-24">
        <div className={CONTAINER}>
          <DisplayTitle size="compact" surface="taupe" className="max-w-4xl">
            Prêt.e à prendre rendez-vous pour votre {page.race} ?
          </DisplayTitle>
          <p className="mt-5 text-base text-charcoal/80 lg:text-lg">
            Réservez en ligne en quelques clics.
          </p>
          <div className="mt-8">
            <BookingCta className="h-12 bg-charcoal px-8 text-[15px] text-cream hover:bg-charcoal/90" />
          </div>
        </div>
      </section>

      <BookingCta mobile phone={settings?.telephone} />

      {/* Espace pour la barre mobile + filet avant le footer (même fond) */}
      <div className="bg-[#B5A89A]">
        <div className="h-20 lg:hidden" />
        <div className={CONTAINER}>
          <div className="border-t-2 border-charcoal/20" />
        </div>
      </div>
    </>
  )
}
