import type { Metadata } from 'next'
import Image from 'next/image'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'
import { Section, Container } from '@/components/ui/section'
import { Reveal } from '@/components/ui/reveal'
import { ContactForm } from '@/components/forms/contact-form'
import { getSiteSettings } from '@/sanity/queries/site-settings'
import { HorairesAccordion } from '@/components/sections/horaires-accordion'
import { MapboxMap } from '@/components/sections/mapbox-map'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Contactez Merci Murphy — adresse, horaires et formulaire de contact.',
}

export default async function ContactPage() {
  const settings = await getSiteSettings()

  const adresse = [settings?.adresse, settings?.codePostal, settings?.ville]
    .filter(Boolean)
    .join(', ')

  return (
    <>
      <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] overflow-hidden bg-charcoal">
        <Image
          src="/contact-hero.jpg"
          alt="merci murphy® — vitrine"
          fill
          priority
          className="object-cover opacity-80"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/75 via-charcoal/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal/40 to-transparent" />
        <div className="absolute bottom-0 left-0 px-8 pb-10 sm:px-14 sm:pb-14 max-w-2xl">
          <Reveal>
            <h1 className="font-display text-4xl font-bold text-cream sm:text-6xl drop-shadow-sm">
              Contact
            </h1>
            <p className="mt-4 text-base leading-relaxed text-cream/80 sm:text-lg drop-shadow-sm">
              Une question ? N&apos;hésitez pas à nous écrire ou nous appeler.
            </p>
          </Reveal>
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
                      <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-terracotta" />
                      <div>
                        <p className="text-charcoal/80">{adresse}</p>
                        {settings?.google_maps_url && (
                          <a
                            href={settings.google_maps_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 text-sm text-terracotta hover:underline"
                          >
                            Voir sur Google Maps →
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                  {settings?.telephone && (
                    <div className="flex gap-3">
                      <Phone className="mt-0.5 h-5 w-5 shrink-0 text-terracotta" />
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
                      <Mail className="mt-0.5 h-5 w-5 shrink-0 text-terracotta" />
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
                      <Clock className="h-5 w-5 text-terracotta" />
                      <h3 className="font-display text-lg font-semibold text-charcoal">Horaires</h3>
                    </div>
                    <HorairesAccordion groupes={settings.horairesGroupes} variant="light" />
                  </div>
                )}

                <div className="mt-8 h-64 rounded-2xl overflow-hidden">
                  <MapboxMap lat={48.880805} lng={2.338646} />
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
