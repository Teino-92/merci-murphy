export const revalidate = 3600

import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import Link from 'next/link'

import { ContactForm } from '@/components/forms/contact-form'
import { HorairesAccordion } from '@/components/sections/horaires-accordion'
import { PageHeaderV2 } from '@/components/sections/page-header-v2'
import { LocalBusinessSchema } from '@/components/seo/local-business-schema'
import { CONTAINER, DisplayTitle, INLINE_LINK, TEXT_LINK } from '@/components/ui/editorial'
import { cn } from '@/lib/utils'
import { getSiteSettings } from '@/sanity/queries/site-settings'
import { noOrphan } from '@/lib/typo'

const MapboxMap = dynamic(
  () => import('@/components/sections/mapbox-map').then((m) => m.MapboxMap),
  { ssr: false, loading: () => <div className="h-[420px] w-full bg-cream/50" /> }
)

export const metadata: Metadata = {
  title: { absolute: 'Contact merci murphy® — 18 rue Victor Massé, Paris 9e' },
  description:
    'Téléphone, email, horaires et plan d’accès — métro Pigalle / Saint-Georges. merci murphy®, 18 rue Victor Massé, Paris 9e. Ouvert du mardi au samedi.',
  openGraph: {
    images: [{ url: '/og/og-home.jpg', width: 1200, height: 630, alt: 'Contact — Merci Murphy' }],
  },
}

// Habillage du formulaire partagé : coins vifs, champs plus hauts, titre de
// confirmation en Playfair normal.
const FORM_SKIN = '[&_.rounded-md]:rounded-none [&_.h-9]:h-12 [&_.font-bold]:font-normal'

const DIRECTIONS = [
  {
    label: 'Itinéraire Google Maps',
    href: 'https://www.google.com/maps/dir/?api=1&destination=18+rue+Victor+Mass%C3%A9+75009+Paris',
  },
  {
    label: 'Apple Plans',
    href: 'https://maps.apple.com/?address=18+rue+Victor+Mass%C3%A9,+75009+Paris,+France',
  },
]

/**
 * Contact : adresse en Playfair, liens soulignés, carte et encart revendeurs
 * à coins vifs.
 */
export default async function ContactPage() {
  const settings = await getSiteSettings()

  const cityLine = [settings?.codePostal, settings?.ville].filter(Boolean).join(' ')
  const hasAddress = Boolean(settings?.adresse || cityLine)
  const horaires = settings?.horairesGroupes ?? []

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://mercimurphy.com' },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Contact',
        item: 'https://mercimurphy.com/contact',
      },
    ],
  }

  return (
    <>
      <LocalBusinessSchema settings={settings} pageUrl="https://mercimurphy.com/contact" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <PageHeaderV2
        title="Contact merci murphy®"
        intro="Une question ? Écrivez-nous, appelez-nous, ou passez nous voir au 18 rue Victor Massé — entre Pigalle et Saint-Georges, Paris 9e."
        image={{
          src: '/contact-hero.jpg',
          alt: 'merci murphy® — vitrine',
          position: '55% center',
        }}
      >
        <a href="#ecrire" className={cn(TEXT_LINK.light, 'self-start')}>
          Nous écrire
        </a>
      </PageHeaderV2>

      <section className="border-t border-charcoal/15 bg-white py-16 lg:py-24">
        <div
          className={cn(
            CONTAINER,
            'grid grid-cols-1 gap-y-16 lg:grid-cols-2 lg:gap-x-20 xl:gap-x-28'
          )}
        >
          <div>
            <DisplayTitle size="compact">Nous trouver</DisplayTitle>

            {hasAddress && (
              <address className="mt-8 font-display text-2xl not-italic leading-snug text-charcoal sm:text-3xl sm:leading-snug">
                {settings?.adresse && <span className="block">{settings.adresse}</span>}
                {cityLine && <span className="block">{cityLine}</span>}
              </address>
            )}

            <ul className="mt-7 flex flex-col gap-y-4 sm:flex-row sm:flex-wrap sm:gap-x-9">
              {settings?.google_maps_url && (
                <li>
                  <a
                    href={settings.google_maps_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={TEXT_LINK.light}
                  >
                    Voir sur Google Maps
                  </a>
                </li>
              )}
              {settings?.telephone && (
                <li>
                  <a
                    href={`tel:${settings.telephone}`}
                    aria-label={`Appeler le ${settings.telephone}`}
                    className={TEXT_LINK.light}
                  >
                    {noOrphan(settings.telephone)}
                  </a>
                </li>
              )}
              {settings?.email && (
                <li>
                  <a href={`mailto:${settings.email}`} className={TEXT_LINK.light}>
                    {noOrphan(settings.email)}
                  </a>
                </li>
              )}
            </ul>

            {horaires.length > 0 && (
              <div className="mt-12 border-t border-charcoal/15 pt-8">
                <h3 className="mb-4 font-display text-2xl leading-tight text-charcoal">Horaires</h3>
                <HorairesAccordion groupes={horaires} variant="light" />
              </div>
            )}

            <div className="mt-12 h-64 overflow-hidden bg-cream/50 sm:h-80">
              <MapboxMap lat={48.880805} lng={2.338646} />
            </div>
            <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
              {DIRECTIONS.map((d) => (
                <li key={d.label}>
                  <a
                    href={d.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={INLINE_LINK}
                  >
                    {noOrphan(d.label)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div id="ecrire" className="scroll-mt-24">
            <DisplayTitle size="compact">Nous écrire</DisplayTitle>
            <div className={cn(FORM_SKIN, 'mt-8')}>
              <ContactForm />
            </div>

            <div className="mt-12 border-t border-charcoal/15 pt-8">
              <p className="font-display text-xl text-charcoal">Vous êtes un professionnel ?</p>
              <p className="mt-2 max-w-md text-base leading-relaxed text-charcoal/70">
                Boutique, concept-store, toiletteur ou animalerie : nos conditions revendeur et
                notre catalogue professionnel sont sur une page dédiée.
              </p>
              <Link href="/revendeurs" className={cn(TEXT_LINK.light, 'mt-5 inline-block')}>
                Découvrir l’espace revendeurs
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
