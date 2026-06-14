export const revalidate = 3600

import { notFound } from 'next/navigation'
import { toPlainText } from '@portabletext/toolkit'
import { SanityImage as Image } from '@/components/ui/sanity-image'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllServices, getServiceBySlug } from '@/sanity/queries/services'
import { getSiteSettings } from '@/sanity/queries/site-settings'
import { getAllPublishedSeoPages } from '@/sanity/queries/seo-pages'
import { urlFor } from '@/sanity/client'
import { getProductsByHandles } from '@/lib/shopify'
import { BLUR_PLACEHOLDER } from '@/lib/utils'
import { Section, Container } from '@/components/ui/section'
import { PortableText } from '@/components/sections/portable-text'
import { FaqAccordion } from '@/components/sections/faq-accordion'
import { TarifsToilettageTable } from '@/components/sections/tarifs-toilettage'
import { ServiceShopTeaser } from '@/components/sections/service-shop-teaser'
import { BookingCta } from '@/components/sections/booking-cta'
import { BeforeAfterSlider } from '@/components/sections/before-after-slider'
import { Reveal } from '@/components/ui/reveal'

const BAINS_SHOP_HANDLES = [
  'shampoing',
  'shampoing-sec',
  'spray-demelant-pour-chiens-et-chats',
  'apres-shampooing-adoucissant-et-demelant-pour-chiens-et-chats',
  'dog-cologne',
]

// Avant/après pour Maison Poilus
const BEFORE_AFTER_PAIRS = [
  {
    before: { src: '/avant-apres-1-avant.jpg', alt: 'Avant toilettage' },
    after: { src: '/avant-apres-1-apres.jpg', alt: 'Après toilettage' },
  },
  {
    before: { src: '/avant-apres-2-avant.jpg', alt: 'Avant toilettage' },
    after: { src: '/avant-apres-2-apres.jpg', alt: 'Après toilettage' },
  },
  {
    before: { src: '/avant-apres-3-avant.jpg', alt: 'Avant toilettage' },
    after: { src: '/avant-apres-3-apres.jpg', alt: 'Après toilettage' },
    zoom: 1.3,
    afterZoom: 1.6,
  },
  {
    before: { src: '/avant-apres-4-avant.jpg', alt: 'Avant toilettage' },
    after: { src: '/avant-apres-4-apres.jpg', alt: 'Après toilettage' },
    zoom: 1,
    beforeZoom: 1.15,
  },
  {
    before: { src: '/avant-apres-5-avant.jpg', alt: 'Avant toilettage', position: 'center 65%' },
    after: { src: '/avant-apres-5-apres.jpg', alt: 'Après toilettage' },
    zoom: 1.3,
    afterZoom: 1.5,
  },
  {
    before: { src: '/avant-apres-6-avant.jpg', alt: 'Avant toilettage' },
    after: { src: '/avant-apres-6-apres.jpg', alt: 'Après toilettage', position: 'center 20%' },
    zoom: 1.3,
  },
]

interface Props {
  params: { slug: string }
}

export async function generateStaticParams() {
  const services = await getAllServices()
  return services.map((s) => ({ slug: s.slug.current }))
}

// Override SEO meta par slug : injection mots-clés pour pages stratégiques.
// H1 visible reste le titre Sanity (identité marque), seul le <title> et la
// description SERP changent.
const SEO_META_OVERRIDES: Record<string, { title: string; description: string }> = {
  'le-toilettage-maison-poilus-r': {
    title: 'Toiletteur chien Paris 9e, merci murphy® · La Maison Poilus®',
    description:
      'Toiletteur pour chien à Paris 9e, rue Victor Massé. Bain, brossage, coupe et soin du pelage par des experts. Spa canin premium, sans stress, par des experts.',
  },
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const service = await getServiceBySlug(params.slug)
  if (!service) return {}
  const url = `https://mercimurphy.com/services/${params.slug}`
  const image = service.image ? urlFor(service.image).width(1200).height(630).url() : undefined

  const override = SEO_META_OVERRIDES[params.slug]
  const title = override?.title ?? service.title
  const description = override?.description ?? service.description

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      images: image ? [{ url: image, alt: service.title }] : [],
    },
  }
}

export default async function ServicePage({ params }: Props) {
  const isBains =
    params.slug === 'le-bain-en-libre-service-maison-poilus-r' ||
    params.slug === 'les-bains-en-libre-service-maison-poilus-r'

  const isToilettage = params.slug === 'le-toilettage-maison-poilus-r'

  const [service, settings, bainsProducts, seoRaces] = await Promise.all([
    getServiceBySlug(params.slug),
    getSiteSettings(),
    isBains ? getProductsByHandles(BAINS_SHOP_HANDLES) : Promise.resolve([]),
    isToilettage ? getAllPublishedSeoPages() : Promise.resolve([]),
  ])

  if (!service) notFound()

  const imageUrl = service.image
    ? urlFor(service.image).width(1200).auto('format').quality(80).url()
    : null

  const pageUrl = `https://mercimurphy.com/services/${params.slug}`

  const serviceLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.title,
    description: service.description,
    serviceType: service.title,
    url: pageUrl,
    ...(imageUrl ? { image: imageUrl } : {}),
    provider: {
      '@type': 'LocalBusiness',
      name: 'merci murphy®',
      url: 'https://mercimurphy.com',
      telephone: '+33 9 78 81 04 21',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '18 rue Victor Massé',
        postalCode: '75009',
        addressLocality: 'Paris',
        addressCountry: 'FR',
      },
    },
    areaServed: { '@type': 'City', name: 'Paris' },
  }

  const faqLd =
    service.faq && service.faq.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: service.faq.map((f) => ({
            '@type': 'Question',
            name: f.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: toPlainText(f.reponse),
            },
          })),
        }
      : null

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://mercimurphy.com' },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Services',
        item: 'https://mercimurphy.com/services',
      },
      { '@type': 'ListItem', position: 3, name: service.title, item: pageUrl },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      {faqLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
      )}

      {/* Header */}
      <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] overflow-hidden bg-charcoal-light">
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={service.title}
            fill
            priority
            placeholder="blur"
            blurDataURL={BLUR_PLACEHOLDER}
            sizes="100vw"
            className={`object-cover opacity-80 ${params.slug === 'le-toilettage-maison-poilus-r' ? 'object-top' : 'object-center'}`}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/50 via-charcoal/10 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal/20 to-transparent" />
        <div className="absolute bottom-0 left-0 px-8 pb-10 sm:px-14 sm:pb-14 max-w-2xl">
          <h1 className="font-display text-4xl font-bold text-cream sm:text-6xl drop-shadow-sm">
            {service.title}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-cream/80 sm:text-lg drop-shadow-sm">
            {service.description}
          </p>
        </div>
      </div>

      {/* Approche */}
      {service.approche && service.approche.length > 0 && (
        <Section className="bg-cream">
          <Container className="max-w-3xl">
            <Reveal>
              <h2 className="font-display text-2xl font-bold text-charcoal sm:text-3xl">
                {isBains
                  ? 'Prenez soin de votre loulou à votre rythme'
                  : params.slug === 'la-creche'
                    ? "Vous bossez, il s'éclate !"
                    : params.slug === 'balneo-maison-poilus-r'
                      ? 'Offrez à votre chien un moment de bien-être profond grâce à la balnéothérapie'
                      : params.slug === 'le-massage-bien-etre-maison-poilus-r-and-le-petit-nenuphar'
                        ? 'Offrez à votre chien un véritable moment de bien-être'
                        : params.slug === 'l-osteopathie'
                          ? 'Ostéopathie structurelle, fonctionnelle, viscérale et crânienne'
                          : 'Notre approche'}
              </h2>
              <PortableText value={service.approche} className="mt-6" />
            </Reveal>
          </Container>
        </Section>
      )}

      {/* Déroulé */}
      {service.deroule && service.deroule.length > 0 && (
        <Section className="bg-[#4F6072] pb-8 lg:pb-12">
          <Container className="max-w-3xl">
            <Reveal>
              <h2 className="font-display text-2xl font-bold text-cream sm:text-3xl">
                {isBains
                  ? 'Partagez un vrai moment de complicité avec votre chien'
                  : params.slug === 'la-creche'
                    ? "Les conditions d'admission"
                    : 'Le déroulé du rendez-vous'}
              </h2>
              <PortableText value={service.deroule} className="mt-6" light />
            </Reveal>
          </Container>
        </Section>
      )}

      {/* Avant / Après — Maison Poilus uniquement */}
      {params.slug === 'le-toilettage-maison-poilus-r' && (
        <Section className="bg-cream py-8 lg:py-12">
          <Container>
            <Reveal>
              <h2 className="font-display text-2xl font-bold text-charcoal sm:text-3xl text-center">
                Avant & après
              </h2>
              <p className="mt-2 text-center text-charcoal/50 text-sm">
                <span className="lg:hidden">
                  Touchez une photo pour découvrir la transformation.
                </span>
                <span className="hidden lg:inline">
                  Glissez le curseur pour découvrir la transformation.
                </span>
              </p>
            </Reveal>
            <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
              {BEFORE_AFTER_PAIRS.map((pair, i) => (
                <Reveal key={i} delay={i * 100}>
                  <BeforeAfterSlider
                    before={'before' in pair ? pair.before : undefined}
                    after={'after' in pair ? pair.after : undefined}
                    beforeColor={'beforeColor' in pair ? (pair.beforeColor as string) : undefined}
                    afterColor={'afterColor' in pair ? (pair.afterColor as string) : undefined}
                    zoom={'zoom' in pair ? (pair.zoom as number) : undefined}
                    beforeZoom={'beforeZoom' in pair ? (pair.beforeZoom as number) : undefined}
                    afterZoom={'afterZoom' in pair ? (pair.afterZoom as number) : undefined}
                  />
                </Reveal>
              ))}
            </div>
          </Container>
        </Section>
      )}

      {/* Tarifs toilettage — grouped table */}
      {service.tarifsToilettage && (
        <Section className="bg-cream">
          <Container className="max-w-3xl">
            <Reveal>
              <h2 className="font-display text-2xl font-bold text-charcoal sm:text-3xl">Tarifs</h2>
              <TarifsToilettageTable data={service.tarifsToilettage} />
              <p className="mt-4 text-xs text-charcoal/50 italic">
                Merci de noter que toute prestation annulée moins de 24h à l&apos;avance est due.
              </p>
            </Reveal>
          </Container>
        </Section>
      )}

      {/* Tarifs standard (all other services) */}
      {!service.tarifsToilettage && service.tarifs && service.tarifs.length > 0 && (
        <Section className="bg-cream">
          <Container className="max-w-3xl">
            <Reveal>
              <h2 className="font-display text-2xl font-bold text-charcoal sm:text-3xl">Tarifs</h2>
              <div className="mt-8 divide-y divide-charcoal/10 rounded-2xl border border-charcoal/10 bg-white">
                {service.tarifs.map((tarif, i) => (
                  <div key={i} className="flex items-start justify-between px-6 py-4">
                    <div>
                      <p className="font-medium text-charcoal">{tarif.label}</p>
                      {tarif.disclaimer && (
                        <p className="mt-0.5 text-xs text-charcoal/40">{tarif.disclaimer}</p>
                      )}
                    </div>
                    <p className="ml-4 shrink-0 font-semibold text-terracotta-dark">{tarif.prix}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </Container>
        </Section>
      )}

      {/* Toilettage par race — maillage SEO */}
      {isToilettage && seoRaces.length > 0 && (
        <Section className="bg-white">
          <Container className="max-w-5xl">
            <Reveal>
              <h2 className="font-display text-2xl font-bold text-charcoal sm:text-3xl">
                Toilettage par race
              </h2>
              <p className="mt-4 max-w-2xl text-charcoal/70">
                Chaque race a son pelage, ses besoins, son rythme. Découvrez nos conseils adaptés.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
                {seoRaces.map((p) => (
                  <Link
                    key={p._id}
                    href={`/toilettage/${p.slugRace}`}
                    className="group rounded-2xl border border-charcoal/10 bg-cream px-5 py-4 transition hover:border-terracotta-dark/40 hover:shadow-sm"
                  >
                    <p className="font-display text-base font-semibold text-charcoal group-hover:text-terracotta-dark">
                      {p.race}
                    </p>
                    {p.typePoil && (
                      <p className="mt-0.5 text-xs text-charcoal/50 capitalize">
                        Pelage {p.typePoil}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
              <Link
                href="/toilettage"
                className="mt-8 inline-block text-sm font-semibold text-terracotta-dark underline-offset-4 hover:underline"
              >
                Voir toutes les races →
              </Link>
            </Reveal>
          </Container>
        </Section>
      )}

      {/* FAQ */}
      {service.faq && service.faq.length > 0 && (
        <Section className="bg-rose/20">
          <Container className="max-w-3xl">
            <Reveal>
              <h2 className="font-display text-2xl font-bold text-charcoal sm:text-3xl">
                Questions fréquentes
              </h2>
              <div className="mt-8">
                <FaqAccordion items={service.faq} />
              </div>
            </Reveal>
          </Container>
        </Section>
      )}

      {/* Shop teaser — bains only */}
      {isBains && bainsProducts.length > 0 && <ServiceShopTeaser products={bainsProducts} />}

      {/* CTA desktop */}
      <div style={{ backgroundColor: '#B5A89A' }}>
        <Section className="text-charcoal">
          <Container className="max-w-2xl text-center">
            <Reveal>
              <h2 className="font-display text-2xl font-bold sm:text-3xl">
                Prêt.e à prendre rendez-vous ?
              </h2>
              <p className="mt-4 text-charcoal/70">Réservez en ligne en quelques clics.</p>
              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <BookingCta label={service.cta?.label} />
              </div>
            </Reveal>
          </Container>
        </Section>
      </div>

      {/* Mobile sticky CTA */}
      <BookingCta mobile phone={settings?.telephone} label={service.cta?.label} />

      {/* Spacer for mobile CTA + divider before footer (same bg color) */}
      <div style={{ backgroundColor: '#B5A89A' }}>
        <div className="h-20 lg:hidden" />
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl border-t-2 border-charcoal/20" />
        </div>
      </div>
    </>
  )
}
