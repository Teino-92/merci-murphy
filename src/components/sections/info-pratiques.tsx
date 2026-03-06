import Link from 'next/link'
import { MapPin, Phone, Clock, Instagram } from 'lucide-react'
import { Section, Container } from '@/components/ui/section'
import { Button } from '@/components/ui/button'
import type { SiteSettings } from '@/sanity/queries/site-settings'

interface InfoPratiquesProps {
  settings: SiteSettings
}

export function InfoPratiques({ settings }: InfoPratiquesProps) {
  const adresseComplete = [settings.adresse, settings.codePostal, settings.ville]
    .filter(Boolean)
    .join(', ')

  return (
    <Section className="bg-charcoal text-cream">
      <Container>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl font-bold sm:text-4xl">Nous trouver</h2>
            <div className="mt-8 space-y-5">
              {adresseComplete && (
                <div className="flex gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-terracotta" />
                  <div>
                    <p className="text-cream/80">{adresseComplete}</p>
                    {settings.google_maps_url && (
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
              {settings.telephone && (
                <div className="flex gap-3">
                  <Phone className="mt-0.5 h-5 w-5 shrink-0 text-terracotta" />
                  <a href={`tel:${settings.telephone}`} className="text-cream/80 hover:text-cream">
                    {settings.telephone}
                  </a>
                </div>
              )}
              {settings.instagram && (
                <div className="flex gap-3">
                  <Instagram className="mt-0.5 h-5 w-5 shrink-0 text-terracotta" />
                  <a
                    href={settings.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cream/80 hover:text-cream"
                  >
                    @mercimurphy
                  </a>
                </div>
              )}
            </div>
            <div className="mt-8">
              <Button asChild className="bg-terracotta text-white hover:bg-terracotta/90">
                <Link href="/reservation">Prendre rendez-vous</Link>
              </Button>
            </div>
          </div>

          {settings.horairesGroupes && settings.horairesGroupes.length > 0 && (
            <div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-terracotta" />
                <h3 className="font-display text-xl font-semibold">Horaires d&apos;ouverture</h3>
              </div>
              <div className="mt-6 space-y-8">
                {settings.horairesGroupes.map((groupe, i) => (
                  <div key={i}>
                    {groupe.titre && (
                      <p className="mb-3 font-semibold text-cream">{groupe.titre}</p>
                    )}
                    <dl className="space-y-2">
                      {groupe.lignes?.map((h, j) => (
                        <div key={j} className="flex justify-between border-b border-cream/10 pb-2">
                          <dt className="text-cream/60">{h.jour}</dt>
                          <dd className="font-medium text-cream">{h.heures}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Container>
    </Section>
  )
}
