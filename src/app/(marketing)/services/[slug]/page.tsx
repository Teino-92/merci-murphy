import { toPlainText } from '@portabletext/toolkit'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { BeforeAfterSlider } from '@/components/sections/before-after-slider'
import { BookingCta } from '@/components/sections/booking-cta'
import { FaqV2 } from '@/components/sections/faq-v2'
import { PageHeaderV2 } from '@/components/sections/page-header-v2'
import { PortableText } from '@/components/sections/portable-text'
import { formatTitle } from '@/components/sections/services-v2'
import { ShopTeaserV2 } from '@/components/sections/shop-teaser-v2'
import { TarifsToilettageTable } from '@/components/sections/tarifs-toilettage'
import {
  CONTAINER,
  DisplayTitle,
  FOCUS_RING,
  RULED_ITEM,
  RULED_LIST,
  TEXT_LINK,
} from '@/components/ui/editorial'
import { getProductsByHandles } from '@/lib/shopify'
import { blurDataURL, cn } from '@/lib/utils'
import { urlFor } from '@/sanity/client'
import { getAllPublishedSeoPages, type SeoPageSummary } from '@/sanity/queries/seo-pages'
import { getAllServices, getServiceBySlug, type TarifsToilettage } from '@/sanity/queries/services'
import { getSiteSettings } from '@/sanity/queries/site-settings'
import { noOrphan } from '@/lib/typo'

export const revalidate = 3600

const BAINS_SHOP_HANDLES = [
  'shampoing',
  'shampoing-sec',
  'spray-demelant-pour-chiens-et-chats',
  'apres-shampooing-adoucissant-et-demelant-pour-chiens-et-chats',
  'dog-cologne',
]

const TOILETTAGE_SLUG = 'le-toilettage-maison-poilus-r'
const BAINS_SLUGS = [
  'le-bain-en-libre-service-maison-poilus-r',
  'les-bains-en-libre-service-maison-poilus-r',
]

/**
 * Sélectionne jusqu'à `limit` races en maximisant la diversité visuelle :
 * on ne reprend une combinaison (type de poil + gabarit) déjà vue
 * que si on n'a pas atteint `limit` avec des combinaisons inédites.
 */
function pickDiverseRaces(races: SeoPageSummary[], limit: number): SeoPageSummary[] {
  const seen = new Set<string>()
  const picked: SeoPageSummary[] = []
  const leftovers: SeoPageSummary[] = []

  for (const race of races) {
    const key = `${race.typePoil ?? ''}|${race.gabarit ?? ''}`
    if (!seen.has(key)) {
      seen.add(key)
      picked.push(race)
    } else {
      leftovers.push(race)
    }
    if (picked.length === limit) return picked
  }

  for (const race of leftovers) {
    if (picked.length === limit) break
    picked.push(race)
  }
  return picked
}

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

// Fourchette de prix (€) des prestations principales, pour l'Offer JSON-LD.
function getTarifsPriceRange(data: TarifsToilettage): { low: number; high: number } | null {
  const prices = (data.gabarits ?? [])
    .flatMap((g) => g.lignes)
    .flatMap((l) => [l.bain, l.bainCoupe, l.bainEpilation])
    .flatMap((p) => (p ? (p.match(/\d+/g) ?? []).map(Number) : []))
  if (prices.length === 0) return null
  return { low: Math.min(...prices), high: Math.max(...prices) }
}

function getApprocheTitle(slug: string, isBains: boolean) {
  if (isBains) return 'Prenez soin de votre loulou à votre rythme'
  if (slug === 'la-creche') return "Vous bossez, il s'éclate !"
  if (slug === 'balneo-maison-poilus-r') {
    return 'Offrez à votre chien un moment de bien-être profond grâce à la balnéothérapie'
  }
  if (slug === 'le-massage-bien-etre-maison-poilus-r-and-le-petit-nenuphar') {
    return 'Offrez à votre chien un véritable moment de bien-être'
  }
  if (slug === 'l-osteopathie')
    return 'Ostéopathie structurelle, fonctionnelle, viscérale et crânienne'
  return 'Notre approche'
}

function getDerouleTitle(slug: string, isBains: boolean) {
  if (isBains) return 'Partagez un vrai moment de complicité avec votre chien'
  if (slug === 'la-creche') return "Les conditions d'admission"
  return 'Le déroulé du rendez-vous'
}

// Titre collant à gauche, contenu à droite : même grille que la home v2.
const SPLIT = cn(
  CONTAINER,
  'grid grid-cols-1 gap-y-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,2.1fr)] lg:gap-x-16'
)
const STICKY = 'lg:sticky lg:top-28 lg:self-start'
const BODY = 'max-w-2xl text-base lg:text-lg'

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
//
// Anti-cannibalisation : la requête « toiletteur chien Paris 9e » est
// RÉSERVÉE au pilier /toilettage-chien-paris. Cette fiche cible l'intention
// commerciale « prix / tarifs toilettage chien » (grille tarifaire visible).
// Les titles contiennent déjà la marque → `absolute` pour éviter le template.
const SEO_META_OVERRIDES: Record<string, { title: string; description: string }> = {
  'le-toilettage-maison-poilus-r': {
    title: 'Tarifs toilettage chien Paris — prix bain & coupe | merci murphy®',
    description:
      'Prix du toilettage chien chez merci murphy® : bain, bain + coupe, épilation et patticure. Grille tarifaire par gabarit et type de poil, méthode sans stress.',
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
    title: override ? { absolute: override.title } : title,
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
  const isBains = BAINS_SLUGS.includes(params.slug)
  const isToilettage = params.slug === TOILETTAGE_SLUG

  const [service, settings, bainsProducts, allSeoRaces] = await Promise.all([
    getServiceBySlug(params.slug),
    getSiteSettings(),
    isBains ? getProductsByHandles(BAINS_SHOP_HANDLES) : Promise.resolve([]),
    isToilettage ? getAllPublishedSeoPages() : Promise.resolve([]),
  ])

  if (!service) notFound()

  const seoRaces = pickDiverseRaces(allSeoRaces, 6)

  const imageUrl = service.image
    ? urlFor(service.image).width(1200).auto('format').quality(80).url()
    : null

  const pageUrl = `https://mercimurphy.com/services/${params.slug}`
  const priceRange = service.tarifsToilettage ? getTarifsPriceRange(service.tarifsToilettage) : null
  const hasTarifs = Boolean(service.tarifsToilettage) || (service.tarifs?.length ?? 0) > 0

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
    ...(priceRange
      ? {
          offers: {
            '@type': 'AggregateOffer',
            priceCurrency: 'EUR',
            lowPrice: priceRange.low,
            highPrice: priceRange.high,
            url: `${pageUrl}#tarifs`,
          },
        }
      : {}),
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

      <PageHeaderV2
        title={formatTitle(service.title)}
        intro={<p>{noOrphan(service.description)}</p>}
        image={
          imageUrl
            ? {
                src: imageUrl,
                alt: service.title,
                position: isToilettage ? 'center top' : undefined,
                sanity: true,
                blurDataURL: service.image?.dominantColor
                  ? blurDataURL(service.image.dominantColor)
                  : undefined,
              }
            : undefined
        }
      >
        <BookingCta
          label={service.cta?.label}
          className="h-12 self-start px-8 text-[15px] sm:self-auto"
        />
        {hasTarifs && (
          <Link href="#tarifs" className={cn(TEXT_LINK.light, 'self-start sm:self-auto')}>
            Voir les tarifs
          </Link>
        )}
      </PageHeaderV2>

      {service.approche && service.approche.length > 0 && (
        <section className="bg-white py-16 lg:py-24">
          <div className={SPLIT}>
            <div className={STICKY}>
              <DisplayTitle size="compact">{getApprocheTitle(params.slug, isBains)}</DisplayTitle>
            </div>
            <PortableText value={service.approche} className={BODY} />
          </div>
        </section>
      )}

      {service.deroule && service.deroule.length > 0 && (
        <section className="bg-[#4F6072] py-16 lg:py-24">
          <div className={SPLIT}>
            <div className={STICKY}>
              <DisplayTitle size="compact" surface="slate">
                {getDerouleTitle(params.slug, isBains)}
              </DisplayTitle>
            </div>
            <PortableText value={service.deroule} light className={BODY} />
          </div>
        </section>
      )}

      {isToilettage && (
        <section className="bg-cream py-16 lg:py-24">
          <div className={CONTAINER}>
            <DisplayTitle>Avant & après</DisplayTitle>
            <p className="mt-5 text-base text-charcoal/70 lg:text-lg">
              <span className="lg:hidden">Touchez une photo pour découvrir la transformation.</span>
              <span className="hidden lg:inline">
                Glissez le curseur pour découvrir la transformation.
              </span>
            </p>

            {/* Coins vifs sur les visuels, sans toucher au composant partagé. */}
            <ul className="mt-10 grid grid-cols-2 gap-3 sm:gap-6 lg:mt-14 lg:grid-cols-3 [&_.rounded-2xl]:rounded-none">
              {BEFORE_AFTER_PAIRS.map((pair) => (
                <li key={pair.before.src}>
                  <BeforeAfterSlider
                    before={pair.before}
                    after={pair.after}
                    zoom={'zoom' in pair ? pair.zoom : undefined}
                    beforeZoom={'beforeZoom' in pair ? pair.beforeZoom : undefined}
                    afterZoom={'afterZoom' in pair ? pair.afterZoom : undefined}
                    mobileFlip
                  />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {service.tarifsToilettage && (
        <section className="bg-white py-16 lg:py-24">
          <div className={SPLIT}>
            <div className={STICKY}>
              <DisplayTitle id="tarifs" size="compact" className="scroll-mt-28">
                Tarifs du toilettage chien à Paris
              </DisplayTitle>
              <p className="mt-6 max-w-xs text-sm italic leading-relaxed text-charcoal/60">
                Merci de noter que toute prestation annulée moins de 24h à l&apos;avance est due.
              </p>
            </div>
            <div className="[&_.rounded-2xl]:rounded-none [&>div]:mt-0">
              <TarifsToilettageTable data={service.tarifsToilettage} />
            </div>
          </div>
        </section>
      )}

      {!service.tarifsToilettage && service.tarifs && service.tarifs.length > 0 && (
        <section className="bg-white py-16 lg:py-24">
          <div className={SPLIT}>
            <div className={STICKY}>
              <DisplayTitle id="tarifs" className="scroll-mt-28">
                Tarifs
              </DisplayTitle>
            </div>
            <ul className={RULED_LIST}>
              {service.tarifs.map((tarif) => (
                <li
                  key={`${tarif.label}-${tarif.prix}`}
                  className={cn(RULED_ITEM, 'flex items-baseline justify-between gap-x-6 py-5')}
                >
                  <div>
                    <p className="font-display text-xl leading-snug text-charcoal sm:text-2xl">
                      {noOrphan(tarif.label)}
                    </p>
                    {tarif.disclaimer && (
                      <p className="mt-1 text-sm text-charcoal/60">{noOrphan(tarif.disclaimer)}</p>
                    )}
                  </div>
                  <p className="shrink-0 font-display text-xl text-terracotta-dark sm:text-2xl">
                    {noOrphan(tarif.prix)}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {isToilettage && seoRaces.length > 0 && (
        <section className="bg-cream py-16 lg:py-24">
          <div className={SPLIT}>
            <div className={STICKY}>
              <DisplayTitle size="compact">Toilettage par race</DisplayTitle>
              <p className="text-balance mt-5 max-w-xs text-base leading-relaxed text-charcoal/70 lg:text-lg">
                Chaque race a son pelage, ses besoins, son rythme. Découvrez nos conseils adaptés.
              </p>
              <div className="mt-8 flex flex-col items-start gap-4">
                <Link href="/toilettage" className={TEXT_LINK.light}>
                  Voir toutes les races
                </Link>
                {/* Maillage anti-cannibalisation : ancre géo vers le pilier */}
                <Link href="/toilettage-chien-paris" className={TEXT_LINK.light}>
                  Notre toiletteur chien à Paris
                </Link>
              </div>
            </div>

            <ul className={cn(RULED_LIST, 'grid grid-cols-1 sm:grid-cols-2')}>
              {seoRaces.map((p) => (
                <li key={p._id} className={cn(RULED_ITEM, 'sm:odd:pr-8 sm:even:pl-8')}>
                  <Link
                    href={`/toilettage/${p.slugRace}`}
                    className={cn('group block py-5 lg:py-6', FOCUS_RING)}
                  >
                    <span className="block font-display text-2xl leading-tight text-charcoal transition-colors group-hover:text-terracotta-dark lg:text-3xl">
                      {p.race}
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
        </section>
      )}

      {service.faq && service.faq.length > 0 && <FaqV2 items={service.faq} />}

      {isBains && (
        <ShopTeaserV2
          products={bainsProducts}
          title="Vous avez aimé nos produits maison POILUS ?"
          intro="Retrouvez-les sur notre éco-shop et continuez les soins à la maison."
        />
      )}

      <section className="bg-[#B5A89A] py-16 lg:py-24">
        <div className={CONTAINER}>
          <DisplayTitle surface="taupe" className="max-w-4xl">
            Prêt.e à prendre rendez-vous ?
          </DisplayTitle>
          <p className="mt-5 text-base text-charcoal/80 lg:text-lg">
            Réservez en ligne en quelques clics.
          </p>
          <div className="mt-8">
            <BookingCta
              label={service.cta?.label}
              className="h-12 bg-charcoal px-8 text-[15px] text-cream hover:bg-charcoal/90"
            />
          </div>
        </div>
      </section>

      <BookingCta mobile phone={settings?.telephone} label={service.cta?.label} />

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
