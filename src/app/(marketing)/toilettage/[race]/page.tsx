export const revalidate = 3600

import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { toPlainText } from '@portabletext/toolkit'
import { Section, Container } from '@/components/ui/section'
import { Reveal } from '@/components/ui/reveal'
import { PortableText } from '@/components/sections/portable-text'
import { FaqAccordion } from '@/components/sections/faq-accordion'
import { BookingCta } from '@/components/sections/booking-cta'
import {
  getAllPublishedSeoPages,
  getSeoPageBySlugRace,
  getRelatedSeoPages,
} from '@/sanity/queries/seo-pages'
import { getSiteSettings } from '@/sanity/queries/site-settings'

interface Props {
  params: { race: string }
}

const SITE_URL = 'https://mercimurphy.com'

export async function generateStaticParams() {
  const pages = await getAllPublishedSeoPages()
  return pages.map((p) => ({ race: p.slugRace }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await getSeoPageBySlugRace(params.race)
  if (!page) return {}
  const url = `${SITE_URL}/toilettage/${page.slugRace}`
  return {
    title: page.metaTitle,
    description: page.metaDescription,
    alternates: { canonical: url },
    openGraph: {
      title: page.metaTitle,
      description: page.metaDescription,
      url,
      type: 'article',
    },
  }
}

function buildJsonLd(page: {
  race: string
  slugRace: string
  title: string
  metaDescription: string
  faq: { question: string; reponse: import('@portabletext/react').PortableTextBlock[] }[]
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

      {/* Hero — H1 sans image, fond charcoal */}
      <Section className="bg-charcoal pt-20 pb-12 lg:pt-28 lg:pb-16">
        <Container className="max-w-3xl text-center">
          <Reveal>
            <p className="mb-4 text-sm uppercase tracking-widest text-cream/60">
              Toilettage canin · Paris 9e
            </p>
            <h1 className="font-display text-4xl font-bold text-cream sm:text-5xl lg:text-6xl">
              {page.title}
            </h1>
          </Reveal>
        </Container>
      </Section>

      {/* Intro */}
      {page.intro && page.intro.length > 0 && (
        <Section className="bg-cream">
          <Container className="max-w-3xl">
            <Reveal>
              <PortableText value={page.intro} />
            </Reveal>
          </Container>
        </Section>
      )}

      {/* Notre approche — fond slate (même que déroulé des services) */}
      {page.approche && page.approche.length > 0 && (
        <Section className="bg-[#4F6072]">
          <Container className="max-w-3xl">
            <Reveal>
              <h2 className="font-display text-2xl font-bold text-cream sm:text-3xl">
                Notre approche pour {page.race}
              </h2>
              <PortableText value={page.approche} className="mt-6" light />
            </Reveal>
          </Container>
        </Section>
      )}

      {/* Fréquence */}
      {page.frequence && page.frequence.length > 0 && (
        <Section className="bg-cream">
          <Container className="max-w-3xl">
            <Reveal>
              <h2 className="font-display text-2xl font-bold text-charcoal sm:text-3xl">
                À quelle fréquence faire toiletter un {page.race} à Paris ?
              </h2>
              <PortableText value={page.frequence} className="mt-6" />
            </Reveal>
          </Container>
        </Section>
      )}

      {/* Lien vers tarifs */}
      <Section className="bg-cream pt-0">
        <Container className="max-w-3xl">
          <Reveal>
            <div className="rounded-2xl border border-charcoal/10 bg-white px-6 py-6 sm:px-8 sm:py-8">
              <h2 className="font-display text-xl font-bold text-charcoal sm:text-2xl">
                Tarifs détaillés par gabarit
              </h2>
              <p className="mt-2 text-charcoal/70">
                Nos tarifs varient selon le gabarit, l&apos;état du pelage et les prestations
                choisies. Retrouvez la grille complète sur notre page toilettage.
              </p>
              <Link
                href="/services/le-toilettage-maison-poilus-r"
                className="mt-4 inline-block font-semibold text-terracotta-dark underline-offset-4 hover:underline"
              >
                Voir les tarifs →
              </Link>
            </div>
          </Reveal>
        </Container>
      </Section>

      {/* FAQ */}
      {page.faq && page.faq.length > 0 && (
        <Section className="bg-rose/20">
          <Container className="max-w-3xl">
            <Reveal>
              <h2 className="font-display text-2xl font-bold text-charcoal sm:text-3xl">
                Questions fréquentes — {page.race}
              </h2>
              <div className="mt-8">
                <FaqAccordion items={page.faq} />
              </div>
            </Reveal>
          </Container>
        </Section>
      )}

      {/* Maillage — autres races */}
      {related.length > 0 && (
        <Section className="bg-cream">
          <Container className="max-w-3xl">
            <Reveal>
              <h2 className="font-display text-2xl font-bold text-charcoal sm:text-3xl">
                Autres races à découvrir
              </h2>
              <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
                {related.map((r) => (
                  <Link
                    key={r._id}
                    href={`/toilettage/${r.slugRace}`}
                    className="group rounded-2xl border border-charcoal/10 bg-white p-5 transition hover:border-terracotta-dark/40 hover:shadow-sm"
                  >
                    <p className="font-medium text-charcoal group-hover:text-terracotta-dark">
                      {r.race}
                    </p>
                    {r.gabarit && (
                      <p className="mt-1 text-xs text-charcoal/50 capitalize">{r.gabarit}</p>
                    )}
                  </Link>
                ))}
              </div>
              <p className="mt-6 text-sm text-charcoal/60">
                <Link href="/toilettage" className="underline-offset-4 hover:underline">
                  ← Voir toutes les races
                </Link>
              </p>
            </Reveal>
          </Container>
        </Section>
      )}

      {/* CTA desktop */}
      <div style={{ backgroundColor: '#B5A89A' }}>
        <Section className="text-charcoal">
          <Container className="max-w-2xl text-center">
            <Reveal>
              <h2 className="font-display text-2xl font-bold sm:text-3xl">
                Prêt.e à prendre rendez-vous pour votre {page.race} ?
              </h2>
              <p className="mt-4 text-charcoal/70">Réservez en ligne en quelques clics.</p>
              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <BookingCta />
              </div>
            </Reveal>
          </Container>
        </Section>
      </div>

      {/* Mobile sticky CTA */}
      <BookingCta mobile phone={settings?.telephone} />

      {/* Spacer for mobile CTA + divider before footer (same bg color) */}
      <div style={{ backgroundColor: '#B5A89A' }}>
        <div className="h-20 lg:hidden" />
      </div>
    </>
  )
}
