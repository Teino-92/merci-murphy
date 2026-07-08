export const revalidate = 3600

import type { Metadata } from 'next'
import Image from 'next/image'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'
import { Section, Container } from '@/components/ui/section'
import { Reveal } from '@/components/ui/reveal'
import { ContactForm } from '@/components/forms/contact-form'
import { getSiteSettings } from '@/sanity/queries/site-settings'
import dynamic from 'next/dynamic'
import { HorairesAccordion } from '@/components/sections/horaires-accordion'
import { BLUR_PLACEHOLDER } from '@/lib/utils'
import { LocalBusinessSchema } from '@/components/seo/local-business-schema'

const MapboxMap = dynamic(
  () => import('@/components/sections/mapbox-map').then((m) => m.MapboxMap),
  { ssr: false, loading: () => <div className="h-[420px] w-full bg-cream/50" /> }
)

export const metadata: Metadata = {
  title: 'Contact merci murphy® — 18 rue Victor Massé, Paris 9e',
  description:
    'Téléphone, email, horaires et plan d’accès — métro Pigalle / Saint-Georges. merci murphy®, 18 rue Victor Massé, Paris 9e. Ouvert du mardi au samedi.',
  openGraph: {
    images: [{ url: '/og/og-home.jpg', width: 1200, height: 630, alt: 'Contact — Merci Murphy' }],
  },
}

export default async function ContactPage() {
  const settings = await getSiteSettings()

  const adresse = [settings?.adresse, settings?.codePostal, settings?.ville]
    .filter(Boolean)
    .join(', ')

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
      <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] overflow-hidden bg-charcoal-light">
        <Image
          src="/contact-hero.jpg"
          alt="merci murphy® — vitrine"
          fill
          priority
          placeholder="blur"
          blurDataURL={BLUR_PLACEHOLDER}
          className="object-cover opacity-80"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/50 via-charcoal/10 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal/20 to-transparent" />
        <div className="absolute bottom-0 left-0 px-8 pb-10 sm:px-14 sm:pb-14 max-w-2xl">
          <h1 className="font-display text-4xl font-bold text-cream sm:text-6xl drop-shadow-sm">
            Contact merci murphy<span className="align-super text-[0.5em]">®</span>
          </h1>
          <p className="mt-4 text-base leading-relaxed text-cream/80 sm:text-lg drop-shadow-sm">
            Une question ? Écrivez-nous, appelez-nous, ou passez nous voir au 18 rue Victor Massé —
            entre Pigalle et Saint-Georges, Paris 9e.
          </p>
        </div>
      </div>

      <Section className="bg-cream">
        <Container>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            <Reveal>
              <div>
                <h2 className="font-display text-2xl font-bold text-charcoal">Nous trouver</h2>
                <div className="mt-6 space-y-5">
                  {adresse && (
                    <div className="flex gap-3">
                      <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-terracotta-dark" />
                      <div>
                        <p className="text-charcoal/80">{adresse}</p>
                        {settings?.google_maps_url && (
                          <a
                            href={settings.google_maps_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 text-sm text-terracotta-dark hover:underline"
                          >
                            Voir sur Google Maps →
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                  {settings?.telephone && (
                    <div className="flex gap-3">
                      <Phone className="mt-0.5 h-5 w-5 shrink-0 text-terracotta-dark" />
                      <a
                        href={`tel:${settings.telephone}`}
                        className="text-charcoal/80 hover:text-charcoal"
                      >
                        {settings.telephone}
                      </a>
                    </div>
                  )}
                  {settings?.email && (
                    <div className="flex gap-3">
                      <Mail className="mt-0.5 h-5 w-5 shrink-0 text-terracotta-dark" />
                      <a
                        href={`mailto:${settings.email}`}
                        className="text-charcoal/80 hover:text-charcoal"
                      >
                        {settings.email}
                      </a>
                    </div>
                  )}
                </div>

                {settings?.horairesGroupes && settings.horairesGroupes.length > 0 && (
                  <div className="mt-8">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="h-5 w-5 text-terracotta-dark" />
                      <h3 className="font-display text-lg font-semibold text-charcoal">Horaires</h3>
                    </div>
                    <HorairesAccordion groupes={settings.horairesGroupes} variant="light" />
                  </div>
                )}

                <div className="mt-8 h-64 rounded-2xl overflow-hidden">
                  <MapboxMap lat={48.880805} lng={2.338646} />
                </div>
                <div className="mt-3 flex flex-wrap gap-3 text-sm">
                  <a
                    href="https://www.google.com/maps/dir/?api=1&destination=18+rue+Victor+Mass%C3%A9+75009+Paris"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-terracotta-dark hover:underline"
                  >
                    Itinéraire Google Maps →
                  </a>
                  <a
                    href="https://maps.apple.com/?address=18+rue+Victor+Mass%C3%A9,+75009+Paris,+France"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-charcoal/60 hover:text-charcoal"
                  >
                    Apple Plans →
                  </a>
                </div>
              </div>
            </Reveal>

            <Reveal delay={150}>
              <div>
                <h2 className="font-display text-2xl font-bold text-charcoal">Nous écrire</h2>
                <div className="mt-6">
                  <ContactForm />
                </div>
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>
    </>
  )
}
