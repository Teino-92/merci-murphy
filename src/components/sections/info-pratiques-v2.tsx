import Link from 'next/link'

import { HorairesAccordion } from '@/components/sections/horaires-accordion'
import { Button } from '@/components/ui/button'
import { CONTAINER, DisplayTitle, TEXT_LINK } from '@/components/ui/editorial'
import type { SiteSettings } from '@/sanity/queries/site-settings'
import { noOrphan } from '@/lib/typo'

interface InfoPratiquesV2Props {
  settings: SiteSettings
}

const LINK_CLASS = TEXT_LINK.taupe

/**
 *Infos pratiques v2.
 * Même taupe que le pied de page (continuité), adresse en Playfair comme sur
 * une carte de visite, liens soulignés à la place des icônes.
 */
export function InfoPratiquesV2({ settings }: InfoPratiquesV2Props) {
  const cityLine = [settings.codePostal, settings.ville].filter(Boolean).join(' ')
  const hasAddress = Boolean(settings.adresse || cityLine)
  const hasHoraires = settings.horairesGroupes && settings.horairesGroupes.length > 0

  return (
    <section className="bg-[#B5A89A] text-charcoal">
      <div className={CONTAINER}>
        <div className="grid grid-cols-1 gap-y-14 py-16 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-x-20 lg:py-24">
          <div>
            <DisplayTitle surface="taupe">Nous trouver</DisplayTitle>

            {hasAddress && (
              <address className="mt-8 font-display text-2xl not-italic leading-snug sm:text-3xl sm:leading-snug lg:mt-10">
                {settings.adresse && <span className="block">{settings.adresse}</span>}
                {cityLine && <span className="block">{cityLine}</span>}
              </address>
            )}

            <ul className="mt-7 flex flex-col gap-y-4 sm:flex-row sm:flex-wrap sm:gap-x-9">
              {settings.google_maps_url && (
                <li>
                  <a
                    href={settings.google_maps_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={LINK_CLASS}
                  >
                    Voir sur Google Maps
                  </a>
                </li>
              )}
              {settings.telephone && (
                <li>
                  <a
                    href={`tel:${settings.telephone.replace(/\s/g, '')}`}
                    aria-label={`Appeler le ${settings.telephone}`}
                    className={LINK_CLASS}
                  >
                    {noOrphan(settings.telephone)}
                  </a>
                </li>
              )}
              {settings.instagram && (
                <li>
                  <a
                    href={settings.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="merci murphy sur Instagram"
                    className={LINK_CLASS}
                  >
                    @mercimurphy
                  </a>
                </li>
              )}
            </ul>

            <Button
              asChild
              size="lg"
              className="mt-10 h-12 bg-charcoal px-8 text-[15px] text-cream hover:bg-charcoal/90"
            >
              <Link href="/reservation">Prendre rendez-vous</Link>
            </Button>
          </div>

          {hasHoraires && (
            <div className="lg:pt-3">
              <h3 className="mb-4 font-display text-2xl leading-tight sm:text-3xl">
                Horaires d&apos;ouverture
              </h3>
              <HorairesAccordion groupes={settings.horairesGroupes} variant="light" />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
