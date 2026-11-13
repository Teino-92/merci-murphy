import Link from 'next/link'
import type { ReactNode } from 'react'

import { formatTitle } from '@/components/sections/services-v2'
import {
  CONTAINER,
  DisplayTitle,
  FOCUS_RING,
  RULED_ITEM,
  RULED_LIST,
} from '@/components/ui/editorial'
import { SanityImage as Image } from '@/components/ui/sanity-image'
import { cn, BLUR_PLACEHOLDER, blurDataURL } from '@/lib/utils'
import { urlFor } from '@/sanity/client'
import type { ServiceSummary } from '@/sanity/queries/services'
import { noOrphan } from '@/lib/typo'

interface ServicesCatalogV2Props {
  services: ServiceSummary[]
  /** Paragraphe libre sous le titre (maillage interne de la page). */
  aside?: ReactNode
  /** Préfixe des fiches (ex. /bat/services pendant le BAT). */
  basePath?: string
}

const SPA_SLUG = 'le-spa-maison-poilus-r'
const SPA_CHILDREN_SLUGS = [
  'le-toilettage-maison-poilus-r',
  'le-bain-en-libre-service-maison-poilus-r',
  'balneo-maison-poilus-r',
  'le-massage-bien-etre-maison-poilus-r-and-le-petit-nenuphar',
]

type RowSize = 'main' | 'nested'

const ROW_TITLE: Record<RowSize, string> = {
  main: 'text-2xl leading-tight tracking-[-0.01em] sm:text-3xl lg:text-4xl',
  nested: 'text-xl leading-snug sm:text-2xl lg:text-[1.75rem]',
}

const ROW_THUMB: Record<RowSize, string> = {
  main: 'w-24 sm:w-40 lg:w-56',
  nested: 'w-20 sm:w-28 lg:w-36',
}

function ServiceRowContent({ service, size }: { service: ServiceSummary; size: RowSize }) {
  return (
    <>
      <div>
        <h3
          className={cn(
            'font-display text-charcoal transition-colors group-hover:text-terracotta-dark',
            ROW_TITLE[size]
          )}
        >
          {noOrphan(formatTitle(service.title))}
        </h3>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-charcoal/70 sm:text-base">
          {noOrphan(service.description)}
        </p>
      </div>

      <div
        className={cn('relative aspect-[4/3] shrink-0 overflow-hidden bg-rose/30', ROW_THUMB[size])}
      >
        {service.image && (
          <Image
            src={urlFor(service.image).width(600).height(450).auto('format').quality(80).url()}
            alt=""
            fill
            placeholder="blur"
            blurDataURL={
              service.image.dominantColor
                ? blurDataURL(service.image.dominantColor)
                : BLUR_PLACEHOLDER
            }
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:transition-none"
            sizes="(min-width: 1024px) 224px, (min-width: 640px) 160px, 96px"
          />
        )}
      </div>
    </>
  )
}

const ROW_GRID = 'grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-5 sm:gap-x-10'

/**
 *Catalogue des prestations v2 (page /services).
 * La « carte » de la home en version complète. Le spa devient un groupe dont
 * les soins sont listés en retrait, visibles d'emblée (ils étaient cachés
 * derrière un clic).
 */
export function ServicesCatalogV2({
  services,
  aside,
  basePath = '/services',
}: ServicesCatalogV2Props) {
  const spaChildren = SPA_CHILDREN_SLUGS.flatMap((slug) => {
    const service = services.find((s) => s.slug.current === slug)

    return service ? [service] : []
  })
  const mainServices = services.filter((s) => !SPA_CHILDREN_SLUGS.includes(s.slug.current))

  return (
    <section className="bg-white py-16 lg:py-24">
      <div
        className={cn(
          CONTAINER,
          'grid grid-cols-1 gap-y-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,2.1fr)] lg:gap-x-16'
        )}
      >
        <div className="lg:sticky lg:top-28 lg:self-start">
          <DisplayTitle>Nos prestations</DisplayTitle>
          <p className="text-balance mt-5 max-w-xs text-base leading-relaxed text-charcoal/70 lg:text-lg">
            Par un collectif d&apos;experts passionnés et engagés.
          </p>
          {aside && (
            <div className="mt-8 max-w-xs border-t border-charcoal/15 pt-6 text-[15px] leading-relaxed text-charcoal/70">
              {aside}
            </div>
          )}
        </div>

        <ul className={RULED_LIST}>
          {mainServices.map((service) => {
            if (service.slug.current !== SPA_SLUG) {
              return (
                <li key={service._id} className={RULED_ITEM}>
                  <Link
                    href={`${basePath}/${service.slug.current}`}
                    className={cn('group py-6 lg:py-8', ROW_GRID, FOCUS_RING)}
                  >
                    <ServiceRowContent service={service} size="main" />
                  </Link>
                </li>
              )
            }

            // Le spa n'a pas de page propre : il sert d'en-tête à ses soins.
            return (
              <li key={service._id} className={RULED_ITEM}>
                <div className={cn('py-6 lg:py-8', ROW_GRID)}>
                  <ServiceRowContent service={service} size="main" />
                </div>

                {noOrphan(
                  spaChildren.length > 0 && (
                    <ul className="mb-6 ml-1 divide-y divide-charcoal/10 border-l border-charcoal/15 pl-5 sm:pl-8 lg:mb-8">
                      {spaChildren.map((child) => (
                        <li key={child._id}>
                          <Link
                            href={`${basePath}/${child.slug.current}`}
                            className={cn('group py-4 lg:py-5', ROW_GRID, FOCUS_RING)}
                          >
                            <ServiceRowContent service={child} size="nested" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
