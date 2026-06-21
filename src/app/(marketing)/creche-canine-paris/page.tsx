import type { Metadata } from 'next'
import Link from 'next/link'
import { getSiteSettings } from '@/sanity/queries/site-settings'

export const metadata: Metadata = {
  title: 'Crèche canine Paris 9e — Garderie pour chien en demi-journée | merci murphy®',
  description:
    'Crèche canine à Paris 9e (rue Victor Massé) : garderie pour chien en demi-journée, encadrée par un éducateur canin. Socialisation, jeux, repos ✓ Réservez la demi-journée de votre chien en ligne.',
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

const FAQ = [
  {
    question: 'Où se trouve la crèche canine merci murphy® à Paris ?',
    answer:
      'Notre crèche canine est située au 18 rue Victor Massé, Paris 75009, dans le quartier Pigalle et Saint-Georges, accessible en métro ligne 12 (stations Pigalle ou Saint-Georges).',
  },
  {
    question: 'Comment se déroule une demi-journée en crèche canine ?',
    answer:
      'Les chiens sont accueillis sur une demi-journée et encadrés par un éducateur canin diplômé. La demi-journée alterne temps de jeux, socialisation entre congénères, stimulation et phases de repos dans un environnement sécurisé.',
  },
  {
    question: 'À quelles races et à quels âges la crèche est-elle ouverte ?',
    answer:
      "La crèche est ouverte à toutes les races. Les chiens doivent être sociables, à jour de leurs vaccins et identifiés. Nous adaptons les groupes selon le gabarit, l'âge et le tempérament de chaque chien.",
  },
  {
    question: 'Faut-il réserver à l’avance pour la crèche canine ?',
    answer:
      'Oui, la crèche fonctionne sur réservation pour garantir un encadrement de qualité et des groupes équilibrés. Vous pouvez réserver en ligne sur mercimurphy.com ou par téléphone au 09 78 81 04 21.',
  },
  {
    question: 'Mon chien doit-il être vacciné pour venir en crèche ?',
    answer:
      "Oui. Pour la sécurité de tous, votre chien doit être identifié (puce ou tatouage), à jour de ses vaccins (dont la toux du chenil) et vermifugé. Un premier rendez-vous permet d'évaluer sa sociabilité.",
  },
  {
    question: 'Proposez-vous aussi le toilettage en plus de la crèche ?',
    answer:
      "Oui. Au-delà de la crèche, merci murphy® propose le toilettage complet, le bain libre-service, la balnéothérapie, le massage et l'éducation canine, tout au même endroit à Paris 9e.",
  },
]

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
      'Crèche canine à Paris 9e : garde en demi-journée encadrée par un éducateur canin, socialisation, jeux et stimulation dans un environnement sécurisé.',
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

      <main className="bg-cream text-charcoal">
        {/* Hero */}
        <section className="px-4 py-20 sm:px-6 lg:px-8 bg-[#f5f0eb]">
          <div className="mx-auto max-w-4xl text-center">
            <p className="mb-4 text-sm font-medium uppercase tracking-widest text-terracotta-dark">
              Paris 75009 · Pigalle · Saint-Georges
            </p>
            <h1 className="font-display text-4xl font-bold leading-tight text-charcoal sm:text-5xl lg:text-6xl">
              Crèche canine
              <br />
              <span className="text-terracotta-dark">à Paris</span>
            </h1>
            <p className="mt-6 text-lg text-charcoal/70 max-w-2xl mx-auto">
              Une garderie pour chien en demi-journée à Paris 9e, rue Victor Massé. Votre compagnon
              est encadré par un éducateur canin dans un environnement sécurisé : jeux,
              socialisation et repos pour des demi-journées équilibrées.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/reservation"
                className="inline-flex items-center justify-center rounded-md bg-terracotta-dark px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-terracotta-dark/90"
              >
                Réserver une demi-journée
              </Link>
              <Link
                href="/services/la-creche"
                className="inline-flex items-center justify-center rounded-md border border-charcoal/20 px-8 py-3 text-sm font-medium text-charcoal transition-colors hover:bg-charcoal/5"
              >
                Découvrir la crèche
              </Link>
            </div>
          </div>
        </section>

        {/* Comment ça marche */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <h2 className="font-display text-3xl font-bold text-charcoal sm:text-4xl">
              Une demi-journée à la crèche canine, à Paris 9ème
            </h2>
            <p className="mt-3 text-charcoal/60 max-w-2xl">
              Un cadre pensé pour le bien-être de votre chien, du matin au soir, encadré par des
              professionnels.
            </p>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
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
              ].map((item) => (
                <div key={item.title} className="rounded-xl border border-charcoal/10 bg-white p-6">
                  <h3 className="font-display text-lg font-semibold text-charcoal">{item.title}</h3>
                  <p className="mt-2 text-sm text-charcoal/60 leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pourquoi nous */}
        <section className="bg-[#f5f0eb] px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <h2 className="font-display text-3xl font-bold text-charcoal sm:text-4xl">
              Pourquoi choisir notre crèche pour chien à Paris ?
            </h2>
            <div className="mt-10 grid gap-8 sm:grid-cols-2">
              {[
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
                  text: 'Crèche, toilettage, bain, balnéothérapie, massage et éducation : tous les soins de votre chien réunis au même endroit.',
                },
              ].map((item) => (
                <div key={item.title}>
                  <h3 className="font-display text-xl font-semibold text-charcoal">{item.title}</h3>
                  <p className="mt-2 text-sm text-charcoal/65 leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Quartiers / near me */}
        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <h2 className="font-display text-2xl font-bold text-charcoal sm:text-3xl">
              Crèche canine près de chez vous, à Paris
            </h2>
            <p className="mt-3 text-sm text-charcoal/60 max-w-2xl">
              Vous cherchez une crèche ou une garderie pour chien autour de vous ? Notre crèche
              accueille des chiens venant de tout Paris, en particulier des 9ème, 18ème, 17ème,
              10ème et 2ème arrondissements.
            </p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {[
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
              ].map((q) => (
                <li
                  key={q}
                  className="rounded-full border border-charcoal/15 px-3 py-1 text-xs text-charcoal/70"
                >
                  {q}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-6">
              <Link
                href="/toilettage-chien-paris"
                className="inline-block text-sm font-semibold text-terracotta-dark underline-offset-4 hover:underline"
              >
                Notre toiletteur chien à Paris →
              </Link>
              <Link
                href="/toilettage-chat-paris"
                className="inline-block text-sm font-semibold text-terracotta-dark underline-offset-4 hover:underline"
              >
                Toilettage chat à Paris →
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-[#f5f0eb] px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-display text-3xl font-bold text-charcoal sm:text-4xl">
              Questions fréquentes sur la crèche canine à Paris
            </h2>
            <dl className="mt-10 divide-y divide-charcoal/10">
              {FAQ.map((item) => (
                <div key={item.question} className="py-6">
                  <dt className="font-display text-lg font-semibold text-charcoal">
                    {item.question}
                  </dt>
                  <dd className="mt-2 text-sm text-charcoal/65 leading-relaxed">{item.answer}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* CTA final */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold text-charcoal sm:text-4xl">
              Réservez une demi-journée de crèche pour votre chien
            </h2>
            <p className="mt-4 text-charcoal/65">
              Garderie en demi-journée, encadrée par un éducateur canin.
              <br />
              18 rue Victor Massé, Paris 75009 · 09 78 81 04 21
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/reservation"
                className="inline-flex items-center justify-center rounded-md bg-terracotta-dark px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-terracotta-dark/90"
              >
                Réserver une demi-journée
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-md border border-charcoal/20 px-8 py-3 text-sm font-medium text-charcoal transition-colors hover:bg-charcoal/5"
              >
                Nous contacter
              </Link>
            </div>
            <p className="mt-6 text-xs text-charcoal/40">
              Métro Pigalle (L12) · Saint-Georges (L12) · Vélib&apos; devant la boutique
            </p>
          </div>
        </section>
      </main>
    </>
  )
}
