import type { Metadata } from 'next'
import Link from 'next/link'
import { getSiteSettings } from '@/sanity/queries/site-settings'

export const metadata: Metadata = {
  title: 'Toiletteur chat Paris 9e — Toilettage félin sans stress | merci murphy®',
  description:
    'Toiletteur pour chat à Paris 9e (rue Victor Massé) : bain, démêlage, coupe et soin du pelage par des expertes du toilettage félin. Méthode douce et sans stress ✓ Réservez en ligne.',
  alternates: {
    canonical: 'https://mercimurphy.com/toilettage-chat-paris',
  },
  openGraph: {
    title: 'Toiletteur chat Paris, merci murphy® · Toilettage félin Paris 9e',
    description:
      'Toilettage pour chat à Paris 9e (75009) : bain, démêlage, soin du pelage, dans le respect du rythme de votre félin. Rue Victor Massé.',
    url: 'https://mercimurphy.com/toilettage-chat-paris',
    siteName: 'merci murphy®',
    locale: 'fr_FR',
    type: 'website',
    images: [
      {
        url: '/og/og-home.jpg',
        width: 1200,
        height: 630,
        alt: 'merci murphy®, toiletteur chat Paris 9e',
      },
    ],
  },
}

const FAQ = [
  {
    question: 'Où faire toiletter son chat à Paris ?',
    answer:
      'merci murphy® toilette les chats au 18 rue Victor Massé, Paris 75009, près de Pigalle et Saint-Georges (métro ligne 12). Le toilettage félin se fait sur rendez-vous, dans un cadre calme et adapté.',
  },
  {
    question: 'Que comprend un toilettage pour chat ?',
    answer:
      'Un toilettage chat comprend le bain, le démêlage, le brossage en profondeur, la coupe des griffes et le soin du pelage. Pour les chats à poils longs, nous proposons aussi le démêlage des nœuds et, si besoin, une coupe adaptée.',
  },
  {
    question: 'Le toilettage est-il stressant pour un chat ?',
    answer:
      "Le chat est sensible : nous travaillons en douceur, à son rythme, dans un environnement calme et sans agitation. Notre méthode sans stress limite l'anxiété et rend l'expérience la plus sereine possible.",
  },
  {
    question: 'À partir de quel âge peut-on toiletter un chat ?',
    answer:
      "On peut habituer un chaton au toilettage dès ses premiers mois, une fois ses vaccins faits. Plus l'habitude est prise tôt, plus le chat se montre détendu lors des séances suivantes.",
  },
  {
    question: 'Faut-il que mon chat soit vacciné ?',
    answer:
      'Oui. Pour la sécurité de votre animal et des autres, votre chat doit être identifié et à jour de ses vaccins. Pensez à apporter son carnet de santé lors du premier rendez-vous.',
  },
  {
    question: 'Toilettez-vous aussi les chiens ?',
    answer:
      "Oui. merci murphy® propose le toilettage chien complet, le bain libre-service, la balnéothérapie, le massage, la crèche canine et l'éducation, en plus du toilettage félin, à Paris 9e.",
  },
]

export default async function ToilettageChatParisPage() {
  const settings = await getSiteSettings()

  const localBusinessLd = {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'PetStore'],
    name: 'merci murphy®',
    description:
      'Toilettage pour chat à Paris 75009 : bain, démêlage et soin du pelage félin, dans un lieu premium et une approche sans stress.',
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
      { '@type': 'AdministrativeArea', name: 'Paris 10ème' },
      { '@type': 'AdministrativeArea', name: 'Paris 2ème' },
    ],
  }

  const serviceLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Toilettage chat',
    serviceType: 'Toilettage félin',
    description:
      'Toilettage pour chat à Paris 9e : bain, démêlage, brossage, coupe des griffes et soin du pelage, dans le respect du rythme du chat.',
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
    url: 'https://mercimurphy.com/toilettage-chat-paris',
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
        name: 'Toilettage chat Paris',
        item: 'https://mercimurphy.com/toilettage-chat-paris',
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
              Toiletteur chat
              <br />
              <span className="text-terracotta-dark">à Paris</span>
            </h1>
            <p className="mt-6 text-lg text-charcoal/70 max-w-2xl mx-auto">
              merci murphy® toilette aussi les chats, à Paris 9e, rue Victor Massé. Bain, démêlage,
              brossage et soin du pelage par des expertes du toilettage félin, dans une approche
              douce et respectueuse du rythme de votre chat.
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
                Poser une question
              </Link>
            </div>
          </div>
        </section>

        {/* Prestations */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <h2 className="font-display text-3xl font-bold text-charcoal sm:text-4xl">
              Le toilettage félin, à Paris 9ème
            </h2>
            <p className="mt-3 text-charcoal/60 max-w-2xl">
              Un soin complet, pensé pour le confort et la santé du pelage de votre chat.
            </p>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: 'Bain & séchage',
                  text: 'Bain adapté au pelage du chat, avec des produits doux, suivi d’un séchage maîtrisé et sans agression.',
                },
                {
                  title: 'Démêlage & brossage',
                  text: 'Élimination des nœuds et du sous-poil, brossage en profondeur pour un pelage sain et brillant.',
                },
                {
                  title: 'Coupe & entretien',
                  text: 'Coupe adaptée pour les chats à poils longs, entretien des zones sensibles, dans le respect du félin.',
                },
                {
                  title: 'Coupe des griffes',
                  text: 'Coupe des griffes en douceur pour le confort de votre chat et de votre intérieur.',
                },
                {
                  title: 'Soin du pelage',
                  text: 'Soins ciblés selon la nature du poil et les besoins de la peau, pour un chat propre et apaisé.',
                },
                {
                  title: 'Approche sans stress',
                  text: 'Un cadre calme, sans agitation, et une équipe qui travaille au rythme du chat pour limiter l’anxiété.',
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
              Pourquoi nous confier le toilettage de votre chat à Paris ?
            </h2>
            <div className="mt-10 grid gap-8 sm:grid-cols-2">
              {[
                {
                  title: 'Des expertes du félin',
                  text: 'Le chat n’est pas un petit chien : nos toiletteuses maîtrisent les gestes et le tempo propres au toilettage félin.',
                },
                {
                  title: 'Une méthode douce',
                  text: 'Patience, calme et techniques adaptées : la méthode maison POILUS® vise une expérience sereine pour votre chat.',
                },
                {
                  title: 'Un lieu premium à Paris 9e',
                  text: 'Au 18 rue Victor Massé, un espace soigné et apaisant, à deux pas de Pigalle et Saint-Georges.',
                },
                {
                  title: 'Tout au même endroit',
                  text: 'Chat et chien, toilettage, crèche, balnéo et massage : une équipe qui prend soin de tous vos compagnons.',
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
              Un toiletteur chat près de chez vous, à Paris
            </h2>
            <p className="mt-3 text-sm text-charcoal/60 max-w-2xl">
              Vous cherchez un toiletteur pour chat autour de vous ? Nous accueillons des chats
              venant de tout Paris, notamment des 9ème, 18ème, 10ème, 2ème et 17ème arrondissements.
            </p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {[
                'Paris 9ème',
                'Paris 18ème',
                'Paris 10ème',
                'Paris 2ème',
                'Paris 17ème',
                'Pigalle',
                'Montmartre',
                'Opéra',
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
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-6">
              <Link
                href="/toilettage-chien-paris"
                className="inline-block text-sm font-semibold text-terracotta-dark underline-offset-4 hover:underline"
              >
                Notre toiletteur chien à Paris →
              </Link>
              <Link
                href="/creche-canine-paris"
                className="inline-block text-sm font-semibold text-terracotta-dark underline-offset-4 hover:underline"
              >
                Crèche canine à Paris →
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-[#f5f0eb] px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-display text-3xl font-bold text-charcoal sm:text-4xl">
              Questions fréquentes sur le toilettage chat à Paris
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
              Prenez rendez-vous pour le toilettage de votre chat
            </h2>
            <p className="mt-4 text-charcoal/65">
              Bain, démêlage et soin du pelage, dans le respect de votre félin.
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
