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
  title: { absolute: 'Toiletteur chat Paris 9e — Toilettage félin sans stress | merci murphy®' },
  description:
    'Toiletteur pour chat à Paris 9e (rue Victor Massé) : bain, démêlage, coupe et soin du pelage par des expertes du toilettage félin. Méthode douce et sans stress ✓ Réservez en ligne.',
  alternates: {
    canonical: 'https://mercimurphy.com/toilettage-chat-paris',
  },
  openGraph: {
    title: 'Toiletteur chat Paris, merci murphy® · Toilettage félin Paris 9e',
    description:
      'Toilettage pour chat à Paris 9e (75009) : bain, démêlage, soin du pelage, dans le respect du rythme de votre félin. Rue Victor Massé.',
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

const SPLIT = cn(
  CONTAINER,
  'grid grid-cols-1 gap-y-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,2.1fr)] lg:gap-x-16'
)
const STICKY = 'lg:sticky lg:top-28 lg:self-start'

const PRESTATIONS = [
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
]

const REASONS = [
  {
    title: 'Des expertes du félin',
    text: 'Le chat n’est pas un petit chien : nos toiletteuses maîtrisent les gestes et le tempo propres au toilettage félin.',
  },
  {
    title: 'Une méthode douce',
    text: 'Patience, calme et techniques adaptées : la méthode maison POILUS® vise une expérience sereine pour votre chat.',
  },
  {
    title: 'Un lieu premium à Paris 9e',
    text: 'Au 18 rue Victor Massé, un espace soigné et apaisant, à deux pas de Pigalle et Saint-Georges.',
  },
  {
    title: 'Tout au même endroit',
    text: 'Chat et chien, toilettage, crèche, balnéo et massage : une équipe qui prend soin de tous vos compagnons.',
  },
]

const QUARTIERS = [
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
]

const FAQ = [
  {
    question: 'Où faire toiletter son chat à Paris ?',
    answer:
      'merci murphy® toilette les chats au 18 rue Victor Massé, Paris 75009, près de Pigalle et Saint-Georges (métro ligne 12). Le toilettage félin se fait sur rendez-vous, dans un cadre calme et adapté.',
  },
  {
    question: 'Que comprend un toilettage pour chat ?',
    answer:
      'Un toilettage chat comprend le bain, le démêlage, le brossage en profondeur, la coupe des griffes et le soin du pelage. Pour les chats à poils longs, nous proposons aussi le démêlage des nœuds et, si besoin, une coupe adaptée.',
  },
  {
    question: 'Le toilettage est-il stressant pour un chat ?',
    answer:
      "Le chat est sensible : nous travaillons en douceur, à son rythme, dans un environnement calme et sans agitation. Notre méthode sans stress limite l'anxiété et rend l'expérience la plus sereine possible.",
  },
  {
    question: 'À partir de quel âge peut-on toiletter un chat ?',
    answer:
      "On peut habituer un chaton au toilettage dès ses premiers mois, une fois ses vaccins faits. Plus l'habitude est prise tôt, plus le chat se montre détendu lors des séances suivantes.",
  },
  {
    question: 'Faut-il que mon chat soit vacciné ?',
    answer:
      'Oui. Pour la sécurité de votre animal et des autres, votre chat doit être identifié et à jour de ses vaccins. Pensez à apporter son carnet de santé lors du premier rendez-vous.',
  },
  {
    question: 'Toilettez-vous aussi les chiens ?',
    answer:
      "Oui. merci murphy® propose le toilettage chien complet, le bain libre-service, la balnéothérapie, le massage, la crèche canine et l'éducation, en plus du toilettage félin, à Paris 9e.",
  },
]

/**
 * Landing « toiletteur chat Paris ». Pas de photo de chat dans /public :
 * l'en-tête reste typographique. Quartiers et prestations en listes à filets.
 */
export default async function ToilettageChatParisPage() {
  const settings = await getSiteSettings()

  const localBusinessLd = {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'PetStore'],
    name: 'merci murphy®',
    description:
      'Toilettage pour chat à Paris 75009 : bain, démêlage et soin du pelage félin, dans un lieu premium et une approche sans stress.',
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
      'Toilettage pour chat à Paris 9e : bain, démêlage, brossage, coupe des griffes et soin du pelage, dans le respect du rythme du chat.',
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

      <PageHeaderV2
        title={
          <>
            Toiletteur chat
            <br />à Paris
          </>
        }
        sub="Paris 75009, Pigalle, Saint-Georges"
        intro="merci murphy® toilette aussi les chats, à Paris 9e, rue Victor Massé. Bain, démêlage, brossage et soin du pelage par des expertes du toilettage félin, dans une approche douce et respectueuse du rythme de votre chat."
      >
        <Button
          asChild
          size="lg"
          className="h-12 self-start bg-terracotta-dark px-8 text-[15px] text-white hover:bg-terracotta-dark/90 sm:self-auto"
        >
          <Link href="/reservation">Réserver en ligne</Link>
        </Button>
        <Link href="/contact" className={cn(TEXT_LINK.light, 'self-start sm:self-auto')}>
          Poser une question
        </Link>
      </PageHeaderV2>

      <section className="bg-white py-16 lg:py-24">
        <div className={SPLIT}>
          <div className={STICKY}>
            <DisplayTitle size="compact">Le toilettage félin, à Paris 9ème</DisplayTitle>
            <p className="mt-5 max-w-sm text-base leading-relaxed text-charcoal/70">
              Un soin complet, pensé pour le confort et la santé du pelage de votre chat.
            </p>
          </div>

          <ul className="grid grid-cols-1 gap-x-10 border-b border-charcoal/15 sm:grid-cols-2">
            {PRESTATIONS.map((item) => (
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
              Pourquoi nous confier le toilettage de votre chat à Paris&nbsp;?
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
              Un toiletteur chat près de chez vous, à Paris
            </DisplayTitle>
          </div>

          <div>
            <p className="max-w-2xl text-base leading-relaxed text-charcoal/70 lg:text-lg">
              Vous cherchez un toiletteur pour chat autour de vous&nbsp;? Nous accueillons des chats
              venant de tout Paris, notamment des 9ème, 18ème, 10ème, 2ème et 17ème arrondissements.
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
              <Link href="/creche-canine-paris" className={cn(TEXT_LINK.light, 'self-start')}>
                Crèche canine à Paris
              </Link>
            </div>
          </div>
        </div>
      </section>

      <FaqV2
        items={FAQ.map((f) => ({ question: f.question, reponse: f.answer }))}
        title="Questions fréquentes sur le toilettage chat à Paris"
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
              Prenez rendez-vous pour le toilettage de votre chat
            </DisplayTitle>
            <p className="mt-5 text-base leading-relaxed text-charcoal/80 lg:text-lg">
              Bain, démêlage et soin du pelage, dans le respect de votre félin.
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
