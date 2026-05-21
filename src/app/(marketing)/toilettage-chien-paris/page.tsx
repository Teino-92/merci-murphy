import type { Metadata } from 'next'
import Link from 'next/link'
import { getSiteSettings } from '@/sanity/queries/site-settings'

export const metadata: Metadata = {
  title: 'Toilettage chien Paris 75009 | merci murphy® — Spa & Bien-être canin',
  description:
    'Toilettage, bain libre-service, balnéothérapie, massage, crèche, éducation et ostéopathie pour chiens à Paris 75009. Réservez en ligne — merci murphy®, 18 rue Victor Massé.',
  alternates: {
    canonical: 'https://mercimurphy.com/toilettage-chien-paris',
  },
  openGraph: {
    title: 'Toilettage chien Paris 75009 | merci murphy®',
    description:
      'Le spa bien-être canin de Paris 75009 : toilettage, balnéo, massage, crèche et plus. Réservez en ligne.',
    url: 'https://mercimurphy.com/toilettage-chien-paris',
    siteName: 'merci murphy®',
    locale: 'fr_FR',
    type: 'website',
    images: [
      {
        url: '/og/og-home.jpg',
        width: 1200,
        height: 630,
        alt: 'merci murphy® — Toilettage chien Paris 75009',
      },
    ],
  },
}

const SERVICES = [
  {
    name: 'Toilettage maison POILUS®',
    slug: 'le-toilettage-maison-poilus-r',
    description:
      'Bain, séchage, coupe et mise en beauté par nos toiletteuses expertes. Méthode sans stress, adaptée à chaque race.',
    keywords: 'toilettage chien Paris, salon de toilettage Paris 9',
  },
  {
    name: 'Bain libre-service',
    slug: 'le-bain-en-libre-service-maison-poilus-r',
    description:
      'Baignoire professionnelle à votre disposition : shampoing fourni, séchage inclus. Idéal entre deux toilettages.',
    keywords: 'bain chien Paris, bain libre-service chien Paris 9',
  },
  {
    name: 'Balnéothérapie',
    slug: 'balneo-maison-poilus-r',
    description:
      'Jacuzzi canin à jets pulsés pour soulager les douleurs articulaires, muscler et détendre votre chien.',
    keywords: 'balnéo chien Paris, spa chien Paris 9',
  },
  {
    name: 'Massage bien-être',
    slug: 'le-massage-bien-etre-maison-poilus-r-and-le-petit-nenuphar',
    description:
      'Séances de massage thérapeutique pour réduire le stress, améliorer la circulation et renforcer le lien.',
    keywords: 'massage chien Paris, bien-être canin Paris',
  },
  {
    name: 'Crèche canine',
    slug: 'la-creche',
    description:
      'Garde de jour encadrée par un éducateur canin. Socialisation, jeux et stimulation dans un environnement sécurisé.',
    keywords: 'crèche chien Paris, garde chien Paris 9',
  },
  {
    name: 'Éducation canine',
    slug: 'l-education',
    description:
      "Séances d'éducation positive pour un chien équilibré : rappel, marche en laisse, sociabilisation.",
    keywords: 'éducation canine Paris, éducateur canin Paris 9',
  },
  {
    name: 'Ostéopathie animale',
    slug: 'l-osteopathie',
    description:
      "Consultations d'ostéopathie pour chiens réalisées par un praticien certifié. Mobilité, posture, récupération.",
    keywords: 'ostéopathie chien Paris, ostéopathe animal Paris',
  },
]

const FAQ = [
  {
    question: 'Où se trouve merci murphy® à Paris ?',
    answer:
      'merci murphy® est situé au 18 rue Victor Massé, Paris 75009 — dans le quartier Pigalle / Notre-Dame-de-Lorette, facilement accessible en métro (ligne 12, station Pigalle ou Saint-Georges).',
  },
  {
    question: 'Quels services de toilettage proposez-vous pour les chiens à Paris ?',
    answer:
      "Nous proposons le toilettage complet maison POILUS® (bain, coupe, mise en beauté), le bain libre-service, la balnéothérapie, le massage bien-être, la crèche canine, l'éducation positive et l'ostéopathie animale.",
  },
  {
    question: 'Comment réserver un toilettage chien à Paris ?',
    answer:
      'Vous pouvez réserver directement en ligne via notre formulaire de réservation sur mercimurphy.com, ou nous contacter par téléphone au 09 78 81 04 21.',
  },
  {
    question: 'Acceptez-vous toutes les races de chiens ?',
    answer:
      'Oui, nous accueillons toutes les races. Nos toiletteuses sont formées aux spécificités de chaque type de pelage — longs, frisés, à poils durs ou ras.',
  },
  {
    question: "Qu'est-ce que la balnéothérapie pour chiens ?",
    answer:
      'La balnéothérapie est un soin en jacuzzi à jets pulsés. Elle soulage les douleurs articulaires (arthrose, dysplasie), améliore la circulation sanguine et favorise la relaxation. Idéale pour les chiens senior ou sportifs.',
  },
  {
    question: 'Proposez-vous une crèche canine à Paris ?',
    answer:
      'Oui, notre crèche canine est ouverte à la journée. Les chiens sont encadrés par un éducateur canin diplômé dans un environnement sécurisé avec espace de jeux et de repos.',
  },
  {
    question: 'Quels sont vos horaires ?',
    answer:
      'Nous sommes ouverts du mardi au samedi. Consultez notre page contact ou Google Maps pour les horaires exacts, qui peuvent varier selon les saisons.',
  },
  {
    question: 'Y a-t-il un parking ou un accès facile en transports en commun ?',
    answer:
      "Oui — arrêt Pigalle (M12) et Saint-Georges (M12) à 5 minutes à pied. Accès Vélib' devant la boutique. Parking Pigalle à 200m.",
  },
]

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

      <main className="bg-cream text-charcoal">
        {/* Hero */}
        <section className="px-4 py-20 sm:px-6 lg:px-8 bg-[#f5f0eb]">
          <div className="mx-auto max-w-4xl text-center">
            <p className="mb-4 text-sm font-medium uppercase tracking-widest text-terracotta-dark">
              Paris 75009 · Pigalle · Saint-Georges
            </p>
            <h1 className="font-display text-4xl font-bold leading-tight text-charcoal sm:text-5xl lg:text-6xl">
              Toilettage & bien-être
              <br />
              <span className="text-terracotta-dark">chien à Paris</span>
            </h1>
            <p className="mt-6 text-lg text-charcoal/70 max-w-2xl mx-auto">
              merci murphy® est le spa canin de référence à Paris 75009. Toilettage professionnel,
              balnéothérapie, massage, crèche, éducation et ostéopathie — tout sous un même toit, 18
              rue Victor Massé.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/reservation"
                className="inline-flex items-center justify-center rounded-md bg-terracotta-dark px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-terracotta-dark/90"
              >
                Réserver en ligne
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center justify-center rounded-md border border-charcoal/20 px-8 py-3 text-sm font-medium text-charcoal transition-colors hover:bg-charcoal/5"
              >
                Voir tous les services
              </Link>
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <h2 className="font-display text-3xl font-bold text-charcoal sm:text-4xl">
              Nos services à Paris 9ème
            </h2>
            <p className="mt-3 text-charcoal/60">
              Du toilettage quotidien aux soins thérapeutiques — une offre complète pour le
              bien-être de votre chien.
            </p>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {SERVICES.map((service) => (
                <Link
                  key={service.slug}
                  href={`/services/${service.slug}`}
                  className="group rounded-xl border border-charcoal/10 bg-white p-6 transition-shadow hover:shadow-md"
                >
                  <h3 className="font-display text-lg font-semibold text-charcoal group-hover:text-terracotta-dark transition-colors">
                    {service.name}
                  </h3>
                  <p className="mt-2 text-sm text-charcoal/60 leading-relaxed">
                    {service.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Why merci murphy */}
        <section className="bg-[#f5f0eb] px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <h2 className="font-display text-3xl font-bold text-charcoal sm:text-4xl">
              Pourquoi choisir merci murphy® à Paris ?
            </h2>
            <div className="mt-10 grid gap-8 sm:grid-cols-2">
              {[
                {
                  title: 'Une approche sans stress',
                  text: 'Nos équipes utilisent la méthode maison POILUS® — patience, douceur, techniques adaptées à chaque chien pour une expérience positive.',
                },
                {
                  title: 'Des experts passionnés',
                  text: 'Toiletteuses diplômées, éducateur canin certifié, ostéopathe animalier — chaque professionnel est sélectionné pour son expertise et son amour des animaux.',
                },
                {
                  title: 'Un lieu premium au cœur de Paris',
                  text: 'Situé au 18 rue Victor Massé (75009), notre boutique allie esthétique soignée et fonctionnalité. Équipements professionnels, matériaux sains, espace pensé pour le confort animal.',
                },
                {
                  title: 'Une offre globale unique',
                  text: 'Du bain hebdomadaire au suivi ostéopathique mensuel — vous trouverez tout ce dont votre chien a besoin en un seul endroit, avec une équipe qui le connaît.',
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

        {/* Quartiers desservis */}
        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <h2 className="font-display text-2xl font-bold text-charcoal sm:text-3xl">
              Toilettage chien : quartiers proches de Paris 75009
            </h2>
            <p className="mt-3 text-sm text-charcoal/60 max-w-2xl">
              Notre salon est facilement accessible depuis tous les arrondissements de Paris. Nous
              accueillons régulièrement des clients venant du 9ème, 18ème, 10ème, 2ème et 1er
              arrondissement.
            </p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {[
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
              ].map((q) => (
                <li
                  key={q}
                  className="rounded-full border border-charcoal/15 px-3 py-1 text-xs text-charcoal/70"
                >
                  {q}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-[#f5f0eb] px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-display text-3xl font-bold text-charcoal sm:text-4xl">
              Questions fréquentes — toilettage chien Paris
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
              Prenez rendez-vous pour votre chien à Paris
            </h2>
            <p className="mt-4 text-charcoal/65">
              Réservez en ligne en 2 minutes — toilettage, bain, massage ou crèche.
              <br />
              18 rue Victor Massé, Paris 75009 · 09 78 81 04 21
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/reservation"
                className="inline-flex items-center justify-center rounded-md bg-terracotta-dark px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-terracotta-dark/90"
              >
                Réserver en ligne
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
