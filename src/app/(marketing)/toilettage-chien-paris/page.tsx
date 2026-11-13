import type { Metadata } from 'next'
import Link from 'next/link'

import { FaqV2 } from '@/components/sections/faq-v2'
import { PageHeaderV2 } from '@/components/sections/page-header-v2'
import { Button } from '@/components/ui/button'
import {
  CONTAINER,
  DisplayTitle,
  FOCUS_RING,
  INLINE_LINK,
  TEXT_LINK,
} from '@/components/ui/editorial'
import { cn } from '@/lib/utils'
import { getSiteSettings } from '@/sanity/queries/site-settings'
import { noOrphan } from '@/lib/typo'

export const metadata: Metadata = {
  title: { absolute: 'Toiletteur chien Paris 9e — Toilettage sans stress | merci murphy®' },
  description:
    'Salon de toilettage pour chien à Paris 9e (rue Victor Massé). Bain, coupe, balnéo et massage par des toiletteuses expertes. Méthode sans stress ✓ Réservez en ligne en 2 min.',
  // Canonical → home : on veut que "/" gagne "toiletteur chien Paris" ET
  // "toiletteur Paris" (data GSC : cette page disputait la requête tête à la
  // home). Le canonical consolide le signal ranking vers "/". La page reste
  // accessible aux visiteurs via le maillage interne.
  alternates: {
    canonical: 'https://mercimurphy.com/',
  },
  openGraph: {
    title: 'Toiletteur chien Paris, merci murphy® · Salon Paris 9e',
    description:
      'Toiletteur chien à Paris 9e (75009). Spa canin premium, sans stress, toilettage par des experts. Rue Victor Massé.',
    url: 'https://mercimurphy.com/toilettage-chien-paris',
    siteName: 'merci murphy®',
    locale: 'fr_FR',
    type: 'website',
    images: [
      {
        url: '/og/og-home.jpg',
        width: 1200,
        height: 630,
        alt: 'merci murphy®, toiletteur chien Paris 9e',
      },
    ],
  },
}

const SPLIT = cn(
  CONTAINER,
  'grid grid-cols-1 gap-y-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,2.1fr)] lg:gap-x-16'
)
const STICKY = 'lg:sticky lg:top-28 lg:self-start'

const SERVICES = [
  {
    name: 'Toilettage maison POILUS®',
    slug: 'le-toilettage-maison-poilus-r',
    description:
      'Bain, séchage, coupe et mise en beauté par nos toiletteuses expertes. Méthode sans stress, adaptée à chaque race.',
  },
  {
    name: 'Bain libre-service',
    slug: 'le-bain-en-libre-service-maison-poilus-r',
    description:
      'Baignoire professionnelle à votre disposition : shampoing fourni, séchage inclus. Idéal entre deux toilettages.',
  },
  {
    name: 'Balnéothérapie',
    slug: 'balneo-maison-poilus-r',
    description:
      'Jacuzzi canin à jets pulsés pour soulager les douleurs articulaires, muscler et détendre votre chien.',
  },
  {
    name: 'Massage bien-être',
    slug: 'le-massage-bien-etre-maison-poilus-r-and-le-petit-nenuphar',
    description:
      'Séances de massage thérapeutique pour réduire le stress, améliorer la circulation et renforcer le lien.',
  },
  {
    name: 'Crèche canine',
    slug: 'la-creche',
    description:
      'Garde en demi-journée encadrée par un éducateur canin. Socialisation, jeux et stimulation dans un environnement sécurisé.',
  },
  {
    name: 'Éducation canine',
    slug: 'l-education',
    description:
      "Séances d'éducation positive pour un chien équilibré : rappel, marche en laisse, sociabilisation.",
  },
  {
    name: 'Ostéopathie animale',
    slug: 'l-osteopathie',
    description:
      "Consultations d'ostéopathie pour chiens réalisées par un praticien certifié. Mobilité, posture, récupération.",
  },
]

const REASONS = [
  {
    title: 'Une approche sans stress',
    text: 'Nos équipes utilisent la méthode maison POILUS® : patience, douceur, techniques adaptées à chaque chien pour une expérience positive.',
  },
  {
    title: 'Des experts passionnés',
    text: 'Toiletteuses diplômées, éducateur canin certifié, ostéopathe animalier. Chaque professionnel est sélectionné pour son expertise et son amour des animaux.',
  },
  {
    title: 'Un lieu premium au cœur de Paris',
    text: 'Situé au 18 rue Victor Massé (75009), notre boutique allie esthétique soignée et fonctionnalité. Équipements professionnels, matériaux sains, espace pensé pour le confort animal.',
  },
  {
    title: 'Une offre globale unique',
    text: 'Du bain hebdomadaire au suivi ostéopathique mensuel, vous trouverez tout ce dont votre chien a besoin en un seul endroit, avec une équipe qui le connaît.',
  },
]

const QUARTIERS = [
  'Paris 9ème',
  'Paris 18ème',
  'Paris 10ème',
  'Paris 2ème',
  'Paris 1er',
  'Pigalle',
  'Montmartre',
  'Opéra',
  'République',
  'Grands Boulevards',
  'South Pigalle (SoPi)',
]

const FAQ = [
  {
    question: 'Où se trouve merci murphy® à Paris ?',
    answer:
      'merci murphy® est situé au 18 rue Victor Massé, Paris 75009, dans le quartier Pigalle et Notre-Dame-de-Lorette, accessible en métro (ligne 12, station Pigalle ou Saint-Georges).',
  },
  {
    question: 'Quels services de toilettage proposez-vous pour les chiens à Paris ?',
    answer:
      "Nous proposons le toilettage complet maison POILUS® (bain, coupe, mise en beauté), le bain libre-service, la balnéothérapie, le massage bien-être, la crèche canine, l'éducation positive et l'ostéopathie animale.",
  },
  {
    question: 'Comment réserver un toilettage chien à Paris ?',
    answer:
      'Vous pouvez réserver directement en ligne via notre formulaire de réservation sur mercimurphy.com, ou nous contacter par téléphone au 09 78 81 04 21.',
  },
  {
    question: 'Acceptez-vous toutes les races de chiens ?',
    answer:
      'Oui, nous accueillons toutes les races. Nos toiletteuses sont formées aux spécificités de chaque type de pelage : longs, frisés, à poils durs ou ras.',
  },
  {
    question: "Qu'est-ce que la balnéothérapie pour chiens ?",
    answer:
      'La balnéothérapie est un soin en jacuzzi à jets pulsés. Elle soulage les douleurs articulaires (arthrose, dysplasie), améliore la circulation sanguine et favorise la relaxation. Idéale pour les chiens senior ou sportifs.',
  },
  {
    question: 'Proposez-vous une crèche canine à Paris ?',
    answer:
      'Oui, notre crèche canine accueille les chiens en demi-journée. Ils sont encadrés par un éducateur canin diplômé dans un environnement sécurisé avec espace de jeux et de repos.',
  },
  {
    question: 'Quels sont vos horaires ?',
    answer:
      'Nous sommes ouverts du mardi au samedi. Consultez notre page contact ou Google Maps pour les horaires exacts, qui peuvent varier selon les saisons.',
  },
  {
    question: 'Y a-t-il un parking ou un accès facile en transports en commun ?',
    answer:
      "Oui. Arrêt Pigalle (M12) et Saint-Georges (M12) à 5 minutes à pied. Accès Vélib' devant la boutique. Parking Pigalle à 200m.",
  },
  {
    question: 'Vous cherchez un toiletteur pour chien autour de vous à Paris ?',
    answer:
      'Notre salon, au 18 rue Victor Massé (Paris 9e), est central et accessible depuis tout Paris. Nous recevons régulièrement des clients des 9ème, 18ème, 17ème, 10ème et 2ème arrondissements, ainsi que de Pigalle, Montmartre et Batignolles.',
  },
]

/**
 * Landing « toiletteur chien Paris » : ligne italique en surtitre, listes à
 * filets, liens soulignés sans flèche.
 */
export default async function ToilettageChienParisPage() {
  const settings = await getSiteSettings()

  const localBusinessLd = {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'PetStore'],
    name: 'merci murphy®',
    description:
      'Toilettage, spa, crèche et bien-être pour chiens à Paris 75009. Un lieu premium et engagé pour prendre soin de votre compagnon.',
    url: 'https://mercimurphy.com',
    image: 'https://mercimurphy.com/logo.avif',
    telephone: settings?.telephone ?? '+33 9 78 81 04 21',
    email: settings?.email ?? 'bonjour@mercimurphy.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: settings?.adresse ?? '18 rue Victor Massé',
      postalCode: settings?.codePostal ?? '75009',
      addressLocality: settings?.ville ?? 'Paris',
      addressCountry: 'FR',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 48.880805,
      longitude: 2.338646,
    },
    hasMap: settings?.google_maps_url ?? undefined,
    openingHoursSpecification: settings?.horairesGroupes?.flatMap(
      (g) =>
        g.lignes?.map((h) => ({
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: h.jour,
          opens: h.heures.split('-')[0]?.trim(),
          closes: h.heures.split('-')[1]?.trim(),
        })) ?? []
    ),
    sameAs: [settings?.instagram].filter(Boolean),
    priceRange: '€€',
    areaServed: [
      { '@type': 'City', name: 'Paris' },
      { '@type': 'AdministrativeArea', name: 'Paris 9ème' },
      { '@type': 'AdministrativeArea', name: 'Paris 18ème' },
      { '@type': 'AdministrativeArea', name: 'Paris 10ème' },
      { '@type': 'AdministrativeArea', name: 'Paris 2ème' },
    ],
  }

  const servicesLd = {
    '@context': 'https://schema.org',
    '@graph': SERVICES.map((s) => ({
      '@type': 'Service',
      name: s.name,
      description: s.description,
      provider: {
        '@type': 'LocalBusiness',
        name: 'merci murphy®',
        url: 'https://mercimurphy.com',
      },
      areaServed: { '@type': 'City', name: 'Paris' },
      url: `https://mercimurphy.com/services/${s.slug}`,
    })),
  }

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer,
      },
    })),
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://mercimurphy.com' },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Toilettage chien Paris',
        item: 'https://mercimurphy.com/toilettage-chien-paris',
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(servicesLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <PageHeaderV2
        title={
          <>
            Toiletteur chien
            <br />à Paris
          </>
        }
        sub="Paris 75009, Pigalle, Saint-Georges"
        intro="merci murphy® est votre toiletteur chien à Paris 9e. Salon de toilettage premium rue Victor Massé : toilettage complet, bain libre-service, balnéothérapie, massage, crèche et éducation, tout sous un même toit."
        image={{
          src: '/avant-apres-1-apres.jpg',
          alt: 'Un chien tout juste toiletté chez merci murphy®',
          position: 'center 35%',
        }}
      >
        <Button
          asChild
          size="lg"
          className="h-12 self-start bg-terracotta-dark px-8 text-[15px] text-white hover:bg-terracotta-dark/90 sm:self-auto"
        >
          <Link href="/reservation">Réserver en ligne</Link>
        </Button>
        <Link href="/services" className={cn(TEXT_LINK.light, 'self-start sm:self-auto')}>
          Voir tous les services
        </Link>
      </PageHeaderV2>

      <section className="bg-white py-16 lg:py-24">
        <div className={SPLIT}>
          <div className={STICKY}>
            <DisplayTitle size="compact">Nos services à Paris 9ème</DisplayTitle>
            <p className="mt-5 max-w-sm text-base leading-relaxed text-charcoal/70">
              Du toilettage quotidien aux soins thérapeutiques. Une offre complète pour le bien-être
              de votre chien.
            </p>
          </div>

          <div>
            <ul className="border-b border-charcoal/15">
              {SERVICES.map((service) => (
                <li key={service.slug} className="border-t border-charcoal/15">
                  <Link
                    href={`/services/${service.slug}`}
                    className={cn(
                      'group grid grid-cols-1 gap-y-2 rounded-sm py-6 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] sm:gap-x-10 lg:py-7',
                      FOCUS_RING
                    )}
                  >
                    <h3 className="font-display text-xl leading-snug text-charcoal transition-colors group-hover:text-terracotta-dark lg:text-2xl">
                      {noOrphan(service.name)}
                    </h3>
                    <p className="text-base leading-relaxed text-charcoal/70">
                      {noOrphan(service.description)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-8 text-base leading-relaxed text-charcoal/70">
              Prix par gabarit et type de poil, du bain à l&apos;épilation&nbsp;:{' '}
              <Link href="/services/le-toilettage-maison-poilus-r#tarifs" className={INLINE_LINK}>
                voir les tarifs du toilettage chien
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[#4F6072] py-16 lg:py-24">
        <div className={SPLIT}>
          <div className={STICKY}>
            <DisplayTitle size="compact" surface="slate">
              Pourquoi choisir notre salon de toilettage à Paris&nbsp;?
            </DisplayTitle>
          </div>

          <div className="grid grid-cols-1 gap-x-10 sm:grid-cols-2">
            {REASONS.map((item) => (
              <div key={item.title} className="border-t border-cream/20 py-7 lg:py-8">
                <h3 className="font-display text-xl leading-snug text-cream lg:text-2xl">
                  {noOrphan(item.title)}
                </h3>
                <p className="mt-3 text-base leading-relaxed text-cream/80">
                  {noOrphan(item.text)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-cream py-16 lg:py-24">
        <div className={SPLIT}>
          <div className={STICKY}>
            <DisplayTitle size="compact">
              Toilettage chien&nbsp;: quartiers proches de Paris 75009
            </DisplayTitle>
          </div>

          <div>
            <p className="max-w-2xl text-base leading-relaxed text-charcoal/70 lg:text-lg">
              Notre salon est facilement accessible depuis tous les arrondissements de Paris. Nous
              accueillons régulièrement des clients venant du 9ème, 18ème, 10ème, 2ème et
              1er arrondissement.
            </p>
            <ul className="mt-8 grid grid-cols-2 gap-x-5 border-b border-charcoal/15 sm:gap-x-10 xl:grid-cols-3">
              {QUARTIERS.map((q) => (
                <li
                  key={q}
                  className="border-t border-charcoal/15 py-3 font-display text-lg leading-snug text-charcoal"
                >
                  {noOrphan(q)}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-col gap-y-4 sm:flex-row sm:gap-x-9">
              <Link href="/creche-canine-paris" className={cn(TEXT_LINK.light, 'self-start')}>
                Crèche canine à Paris
              </Link>
              <Link href="/toilettage-chat-paris" className={cn(TEXT_LINK.light, 'self-start')}>
                Toilettage chat à Paris
              </Link>
            </div>
          </div>
        </div>
      </section>

      <FaqV2
        items={FAQ.map((f) => ({ question: f.question, reponse: f.answer }))}
        title="Questions fréquentes sur notre salon de toilettage Paris"
      />

      <section className="bg-[#B5A89A] py-16 lg:py-24">
        <div
          className={cn(
            CONTAINER,
            'flex flex-col gap-y-8 lg:flex-row lg:items-end lg:justify-between lg:gap-x-16'
          )}
        >
          <div className="max-w-2xl">
            <DisplayTitle size="compact" surface="taupe">
              Prenez rendez-vous pour votre chien à Paris
            </DisplayTitle>
            <p className="mt-5 text-base leading-relaxed text-charcoal/80 lg:text-lg">
              Réservez en ligne en 2 minutes : toilettage, bain, massage ou crèche.
            </p>
            <p className="mt-4 text-base leading-relaxed text-charcoal/80">
              <span className="block">18 rue Victor Massé, Paris 75009</span>
              <a href="tel:+33978810421" className={cn(INLINE_LINK, 'inline-block')}>
                09 78 81 04 21
              </a>
            </p>
            <p className="mt-4 text-sm text-charcoal/70">
              Métro Pigalle (L12) et Saint-Georges (L12), Vélib&apos; devant la boutique
            </p>
          </div>

          <div className="flex flex-col gap-y-5 sm:flex-row sm:items-center sm:gap-x-9">
            <Button
              asChild
              size="lg"
              className="h-12 self-start bg-charcoal px-8 text-[15px] text-cream hover:bg-charcoal/90 sm:self-auto"
            >
              <Link href="/reservation">Réserver en ligne</Link>
            </Button>
            <Link href="/contact" className={cn(TEXT_LINK.taupe, 'self-start sm:self-auto')}>
              Nous contacter
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
