import type { Metadata } from 'next'
import Link from 'next/link'

import { FaqV2 } from '@/components/sections/faq-v2'
import { PageHeaderV2 } from '@/components/sections/page-header-v2'
import { Button } from '@/components/ui/button'
import { CONTAINER, DisplayTitle, INLINE_LINK, TEXT_LINK } from '@/components/ui/editorial'
import { cn } from '@/lib/utils'
import { getSiteSettings } from '@/sanity/queries/site-settings'
import { noOrphan } from '@/lib/typo'

export const metadata: Metadata = {
  title: {
    absolute: 'Crèche canine Paris 9e — Garderie pour chien en demi-journée | merci murphy®',
  },
  description:
    'Crèche canine à Paris 9e (rue Victor Massé) : garderie pour chien en demi-journée, encadrée par un éducateur canin. Socialisation, jeux, repos ✓ Réservez la demi-journée de votre chien en ligne.',
  alternates: {
    canonical: 'https://mercimurphy.com/creche-canine-paris',
  },
  openGraph: {
    title: 'Crèche canine Paris, merci murphy® · Garderie chien Paris 9e',
    description:
      'Garderie pour chien en demi-journée à Paris 9e (75009). Crèche canine encadrée par un éducateur, dans un environnement sécurisé. Rue Victor Massé.',
    url: 'https://mercimurphy.com/creche-canine-paris',
    siteName: 'merci murphy®',
    locale: 'fr_FR',
    type: 'website',
    images: [
      {
        url: '/og/og-home.jpg',
        width: 1200,
        height: 630,
        alt: 'merci murphy®, crèche canine Paris 9e',
      },
    ],
  },
}

const SPLIT = cn(
  CONTAINER,
  'grid grid-cols-1 gap-y-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,2.1fr)] lg:gap-x-16'
)
const STICKY = 'lg:sticky lg:top-28 lg:self-start'

const ETAPES = [
  {
    title: 'Accueil & mise en confiance',
    text: 'Arrivée en douceur le matin, prise en charge personnalisée selon le tempérament de votre chien.',
  },
  {
    title: 'Socialisation encadrée',
    text: 'Jeux et interactions entre congénères en petits groupes équilibrés, supervisés par un éducateur canin.',
  },
  {
    title: 'Phases de repos',
    text: 'Alternance entre stimulation et temps calmes pour une demi-journée sans surcharge ni stress.',
  },
  {
    title: 'Stimulation mentale',
    text: 'Ateliers, jeux d’occupation et travail de l’obéissance pour un chien fatigué et épanoui.',
  },
  {
    title: 'Sécurité garantie',
    text: 'Espace clos et sécurisé, suivi vaccinal exigé, groupes adaptés par gabarit et par caractère.',
  },
  {
    title: 'Tout sous un même toit',
    text: 'Possibilité d’ajouter un toilettage, un bain ou une séance d’éducation pendant la demi-journée de crèche.',
  },
]

const REASONS = [
  {
    title: 'Un éducateur canin diplômé',
    text: 'Chaque demi-journée est supervisée par un professionnel formé au comportement canin, garant de la sécurité et de l’équilibre du groupe.',
  },
  {
    title: 'Des groupes à taille humaine',
    text: 'Nous limitons les effectifs et constituons des groupes par gabarit et tempérament pour des interactions saines.',
  },
  {
    title: 'Un lieu premium au cœur de Paris 9e',
    text: 'Au 18 rue Victor Massé, un espace sain et soigné, à deux pas de Pigalle et Saint-Georges.',
  },
  {
    title: 'Une offre globale',
    text: 'Crèche, toilettage, bain, balnéothérapie, massage et éducation : tous les soins de votre chien réunis au même endroit.',
  },
]

const QUARTIERS = [
  'Paris 9ème',
  'Paris 18ème',
  'Paris 17ème',
  'Paris 10ème',
  'Paris 2ème',
  'Pigalle',
  'Montmartre',
  'Batignolles',
  'Opéra',
  'Grands Boulevards',
]

const FAQ = [
  {
    question: 'Où se trouve la crèche canine merci murphy® à Paris ?',
    answer:
      'Notre crèche canine est située au 18 rue Victor Massé, Paris 75009, dans le quartier Pigalle et Saint-Georges, accessible en métro ligne 12 (stations Pigalle ou Saint-Georges).',
  },
  {
    question: 'Comment se déroule une demi-journée en crèche canine ?',
    answer:
      'Les chiens sont accueillis sur une demi-journée et encadrés par un éducateur canin diplômé. La demi-journée alterne temps de jeux, socialisation entre congénères, stimulation et phases de repos dans un environnement sécurisé.',
  },
  {
    question: 'À quelles races et à quels âges la crèche est-elle ouverte ?',
    answer:
      "La crèche est ouverte à toutes les races. Les chiens doivent être sociables, à jour de leurs vaccins et identifiés. Nous adaptons les groupes selon le gabarit, l'âge et le tempérament de chaque chien.",
  },
  {
    question: 'Faut-il réserver à l’avance pour la crèche canine ?',
    answer:
      'Oui, la crèche fonctionne sur réservation pour garantir un encadrement de qualité et des groupes équilibrés. Vous pouvez réserver en ligne sur mercimurphy.com ou par téléphone au 09 78 81 04 21.',
  },
  {
    question: 'Mon chien doit-il être vacciné pour venir en crèche ?',
    answer:
      "Oui. Pour la sécurité de tous, votre chien doit être identifié (puce ou tatouage), à jour de ses vaccins (dont la toux du chenil) et vermifugé. Un premier rendez-vous permet d'évaluer sa sociabilité.",
  },
  {
    question: 'Proposez-vous aussi le toilettage en plus de la crèche ?',
    answer:
      "Oui. Au-delà de la crèche, merci murphy® propose le toilettage complet, le bain libre-service, la balnéothérapie, le massage et l'éducation canine, tout au même endroit à Paris 9e.",
  },
]

/**
 * Landing « crèche canine Paris ». Même charpente que la page chat : en-tête
 * photo, titres collants à gauche, listes à filets.
 */
export default async function CrecheCanineParisPage() {
  const settings = await getSiteSettings()

  const localBusinessLd = {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'PetStore'],
    name: 'merci murphy®',
    description:
      'Crèche canine et garderie pour chien en demi-journée à Paris 75009. Encadrement par un éducateur canin dans un lieu premium et sécurisé.',
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
    sameAs: [settings?.instagram].filter(Boolean),
    priceRange: '€€',
    areaServed: [
      { '@type': 'City', name: 'Paris' },
      { '@type': 'AdministrativeArea', name: 'Paris 9ème' },
      { '@type': 'AdministrativeArea', name: 'Paris 18ème' },
      { '@type': 'AdministrativeArea', name: 'Paris 17ème' },
      { '@type': 'AdministrativeArea', name: 'Paris 10ème' },
    ],
  }

  const serviceLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Crèche canine',
    serviceType: 'Garderie pour chien en demi-journée',
    description:
      'Crèche canine à Paris 9e : garde en demi-journée encadrée par un éducateur canin, socialisation, jeux et stimulation dans un environnement sécurisé.',
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
    url: 'https://mercimurphy.com/creche-canine-paris',
  }

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
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
        name: 'Crèche canine Paris',
        item: 'https://mercimurphy.com/creche-canine-paris',
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceLd) }}
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
            Crèche canine
            <br />à Paris
          </>
        }
        sub="Paris 75009, Pigalle, Saint-Georges"
        intro="Une garderie pour chien en demi-journée à Paris 9e, rue Victor Massé. Votre compagnon est encadré par un éducateur canin dans un environnement sécurisé : jeux, socialisation et repos pour des demi-journées équilibrées."
        image={{
          src: '/valeurs-3.jpg',
          alt: 'Trois chiens dans la boutique merci murphy®, rue Victor Massé',
          position: 'center 40%',
        }}
      >
        <Button
          asChild
          size="lg"
          className="h-12 self-start bg-terracotta-dark px-8 text-[15px] text-white hover:bg-terracotta-dark/90 sm:self-auto"
        >
          <Link href="/reservation">Réserver une demi-journée</Link>
        </Button>
        <Link href="/services/la-creche" className={cn(TEXT_LINK.light, 'self-start sm:self-auto')}>
          Découvrir la crèche
        </Link>
      </PageHeaderV2>

      <section className="bg-white py-16 lg:py-24">
        <div className={SPLIT}>
          <div className={STICKY}>
            <DisplayTitle size="compact">
              Une demi-journée à la crèche canine, à Paris 9ème
            </DisplayTitle>
            <p className="mt-5 max-w-sm text-base leading-relaxed text-charcoal/70">
              Un cadre pensé pour le bien-être de votre chien, du matin au soir, encadré par
              des professionnels.
            </p>
          </div>

          <ul className="grid grid-cols-1 gap-x-10 border-b border-charcoal/15 sm:grid-cols-2">
            {ETAPES.map((item) => (
              <li key={item.title} className="border-t border-charcoal/15 py-7 lg:py-8">
                <h3 className="font-display text-xl leading-snug text-charcoal lg:text-2xl">
                  {noOrphan(item.title)}
                </h3>
                <p className="mt-3 text-base leading-relaxed text-charcoal/70">
                  {noOrphan(item.text)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-[#4F6072] py-16 lg:py-24">
        <div className={SPLIT}>
          <div className={STICKY}>
            <DisplayTitle size="compact" surface="slate">
              Pourquoi choisir notre crèche pour chien à Paris&nbsp;?
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
            <DisplayTitle size="compact">Crèche canine près de chez vous, à Paris</DisplayTitle>
          </div>

          <div>
            <p className="max-w-2xl text-base leading-relaxed text-charcoal/70 lg:text-lg">
              Vous cherchez une crèche ou une garderie pour chien autour de vous&nbsp;? Notre crèche
              accueille des chiens venant de tout Paris, en particulier des 9ème, 18ème, 17ème,
              10ème et 2ème arrondissements.
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
              <Link href="/toilettage-chien-paris" className={cn(TEXT_LINK.light, 'self-start')}>
                Notre toiletteur chien à Paris
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
        title="Questions fréquentes sur la crèche canine à Paris"
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
              Réservez une demi-journée de crèche pour votre chien
            </DisplayTitle>
            <p className="mt-5 text-base leading-relaxed text-charcoal/80 lg:text-lg">
              Garderie en demi-journée, encadrée par un éducateur canin.
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
              <Link href="/reservation">Réserver une demi-journée</Link>
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
