import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getAllServices, getServiceBySlug } from '@/sanity/queries/services'
import { getSiteSettings } from '@/sanity/queries/site-settings'
import { urlFor } from '@/sanity/client'
import { getProductsByHandles } from '@/lib/shopify'
import { Section, Container } from '@/components/ui/section'
import { Button } from '@/components/ui/button'
import { PortableText } from '@/components/sections/portable-text'
import { FaqAccordion } from '@/components/sections/faq-accordion'
import { TarifsToilettageTable } from '@/components/sections/tarifs-toilettage'
import { ServiceShopTeaser } from '@/components/sections/service-shop-teaser'
import { MobileCta } from '@/components/sections/mobile-cta'
import { BeforeAfterSlider } from '@/components/sections/before-after-slider'
import { Reveal } from '@/components/ui/reveal'
import { getProfile } from '@/lib/auth-actions'

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
  },
  {
    before: { src: '/avant-apres-4-avant.jpg', alt: 'Avant toilettage' },
    after: { src: '/avant-apres-4-apres.jpg', alt: 'Après toilettage' },
  },
]

interface Props {
  params: { slug: string }
}

export async function generateStaticParams() {
  const services = await getAllServices()
  return services.map((s) => ({ slug: s.slug.current }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const service = await getServiceBySlug(params.slug)
  if (!service) return {}
  const url = `https://mercimurphy.com/services/${params.slug}`
  const image = service.image ? urlFor(service.image).width(1200).height(630).url() : undefined
  return {
    title: service.title,
    description: service.description,
    alternates: { canonical: url },
    openGraph: {
      title: service.title,
      description: service.description,
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

  const [service, settings, profile, bainsProducts] = await Promise.all([
    getServiceBySlug(params.slug),
    getSiteSettings(),
    getProfile(),
    isBains ? getProductsByHandles(BAINS_SHOP_HANDLES) : Promise.resolve([]),
  ])
  const canBook = profile?.can_book === true

  if (!service) notFound()

  const imageUrl = service.image ? urlFor(service.image).width(1600).height(800).url() : null

  return (
    <>
      {/* Header */}
      <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] overflow-hidden bg-charcoal-light">
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={service.title}
            fill
            priority
            className="object-cover opacity-60"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/75 via-charcoal/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal/40 to-transparent" />
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
                Notre approche
              </h2>
              <PortableText value={service.approche} className="mt-6" />
            </Reveal>
          </Container>
        </Section>
      )}

      {/* Déroulé */}
      {service.deroule && service.deroule.length > 0 && (
        <Section className="bg-[#1D164E] pb-8 lg:pb-12">
          <Container className="max-w-3xl">
            <Reveal>
              <h2 className="font-display text-2xl font-bold text-cream sm:text-3xl">
                Le déroulé du rendez-vous
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
                Glissez le curseur pour découvrir la transformation.
              </p>
            </Reveal>
            <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {BEFORE_AFTER_PAIRS.map((pair, i) => (
                <Reveal key={i} delay={i * 100}>
                  <BeforeAfterSlider
                    before={'before' in pair ? pair.before : undefined}
                    after={'after' in pair ? pair.after : undefined}
                    beforeColor={'beforeColor' in pair ? (pair.beforeColor as string) : undefined}
                    afterColor={'afterColor' in pair ? (pair.afterColor as string) : undefined}
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
              <p className="mt-2 text-sm text-charcoal/50">
                Tarifs indicatifs — notre équipe vous confirmera le prix exact lors de notre
                rencontre avec votre chien.
              </p>
              <div className="mt-8 divide-y divide-charcoal/10 rounded-2xl border border-charcoal/10 bg-white">
                {service.tarifs.map((tarif, i) => (
                  <div key={i} className="flex items-start justify-between px-6 py-4">
                    <div>
                      <p className="font-medium text-charcoal">{tarif.label}</p>
                      {tarif.disclaimer && (
                        <p className="mt-0.5 text-xs text-charcoal/40">{tarif.disclaimer}</p>
                      )}
                    </div>
                    <p className="ml-4 shrink-0 font-semibold text-terracotta">{tarif.prix}</p>
                  </div>
                ))}
              </div>
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
                Prêt à prendre rendez-vous ?
              </h2>
              <p className="mt-4 text-charcoal/70">
                {service.calendlyUrl
                  ? 'Réservez directement en ligne ou demandez à être rappelé·e.'
                  : 'Demandez à être rappelé·e et notre équipe vous contactera.'}
              </p>
              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                {service.calendlyUrl && canBook && (
                  <Button
                    asChild
                    size="lg"
                    className="bg-terracotta text-white hover:bg-terracotta/90"
                  >
                    <a href={service.calendlyUrl} target="_blank" rel="noopener noreferrer">
                      {service.cta?.label ?? 'Réserver en ligne'}
                    </a>
                  </Button>
                )}
                <Button
                  asChild
                  size="lg"
                  className="bg-terracotta-dark text-white hover:bg-terracotta-dark/90 hover:text-white"
                >
                  <Link href="/compte/inscription">Être rappelé·e</Link>
                </Button>
              </div>
            </Reveal>
          </Container>
        </Section>
      </div>

      {/* Mobile sticky CTA */}
      <MobileCta
        phone={settings?.telephone}
        type={service.cta?.type ?? 'reservation'}
        label={service.cta?.label}
        calendlyUrl={canBook ? (service.calendlyUrl ?? undefined) : undefined}
      />

      {/* Spacer for mobile CTA */}
      <div className="h-20 lg:hidden" style={{ backgroundColor: '#B5A89A' }} />
    </>
  )
}
