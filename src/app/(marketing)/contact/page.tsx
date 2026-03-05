import type { Metadata } from 'next'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'
import { Section, Container } from '@/components/ui/section'
import { ContactForm } from '@/components/forms/contact-form'
import { getSiteSettings } from '@/sanity/queries/site-settings'

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
      <Section className="bg-charcoal text-cream py-20">
        <Container className="max-w-2xl text-center">
          <h1 className="font-display text-4xl font-bold sm:text-5xl">Contact</h1>
          <p className="mt-4 text-lg text-cream/70">
            Une question ? N&apos;hésitez pas à nous écrire ou nous appeler.
          </p>
        </Container>
      </Section>

      <Section className="bg-cream">
        <Container>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            {/* Infos */}
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

              {settings?.horaires && settings.horaires.length > 0 && (
                <div className="mt-8">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-terracotta" />
                    <h3 className="font-display text-lg font-semibold text-charcoal">Horaires</h3>
                  </div>
                  <dl className="mt-4 space-y-2">
                    {settings.horaires.map((h, i) => (
                      <div
                        key={i}
                        className="flex justify-between border-b border-charcoal/10 pb-2"
                      >
                        <dt className="text-charcoal/60">{h.jour}</dt>
                        <dd className="font-medium text-charcoal">{h.heures}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}

              {/* Google Maps embed placeholder */}
              {settings?.google_maps_url && (
                <div className="mt-8 overflow-hidden rounded-2xl bg-rose/20 h-48 flex items-center justify-center">
                  <a
                    href={settings.google_maps_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-charcoal/50 hover:text-terracotta"
                  >
                    Voir sur Google Maps →
                  </a>
                </div>
              )}
            </div>

            {/* Form */}
            <div>
              <h2 className="font-display text-2xl font-bold text-charcoal">Nous écrire</h2>
              <div className="mt-6">
                <ContactForm />
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  )
}
