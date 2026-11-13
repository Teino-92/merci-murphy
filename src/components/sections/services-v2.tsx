import Link from 'next/link'

import {
  CONTAINER,
  DisplayTitle,
  FOCUS_RING,
  RULED_ITEM,
  RULED_LIST,
  TEXT_LINK,
} from '@/components/ui/editorial'
import { SanityImage as Image } from '@/components/ui/sanity-image'
import { cn, BLUR_PLACEHOLDER, blurDataURL } from '@/lib/utils'
import { urlFor } from '@/sanity/client'
import type { ServiceSummary } from '@/sanity/queries/services'
import { noOrphan } from '@/lib/typo'

interface ServicesV2Props {
  services: ServiceSummary[]
}

const SPA_SLUG = 'le-spa-maison-poilus-r'
const PREVIEW_SLUGS = [SPA_SLUG, 'la-creche', 'l-education', 'l-osteopathie']

function getServiceHref(slug: string) {
  // Le spa regroupe plusieurs soins : il renvoie vers la liste complète.
  if (slug === SPA_SLUG) return '/services'

  return `/services/${slug}`
}

// La marque reste en capitales, comme dans le logo.
const KEEP_UPPERCASE = /^POILUS/

export function formatTitle(title: string) {
  // Certains titres sont saisis (en partie) en capitales dans Sanity : on les
  // ramène à une casse de phrase pour que la liste reste homogène. À corriger
  // dans le CMS.
  const words = title.split(' ').map((word) => {
    const isShouting = word.length > 1 && word === word.toLocaleUpperCase('fr-FR')
    if (!isShouting || KEEP_UPPERCASE.test(word)) return word

    return word.toLocaleLowerCase('fr-FR')
  })
  const sentence = words.join(' ')

  return sentence.charAt(0).toLocaleUpperCase('fr-FR') + sentence.slice(1)
}

/**
 *Prestations v2 « La carte ».
 * Liste éditoriale à filets fins, comme la carte d'un salon : un nom, une
 * phrase, une vignette. Remplace la grille de cartes à ombre.
 */
export function ServicesV2({ services }: ServicesV2Props) {
  const preview = PREVIEW_SLUGS.flatMap((slug) => {
    const service = services.find((s) => s.slug.current === slug)

    return service ? [service] : []
  })

  if (preview.length === 0) return null

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
          <Link href="/services" className={cn(TEXT_LINK.light, 'mt-8 inline-block')}>
            Toutes les prestations
          </Link>
        </div>

        <ul className={RULED_LIST}>
          {preview.map((service) => (
            <li key={service._id} className={RULED_ITEM}>
              <Link
                href={getServiceHref(service.slug.current)}
                className={cn(
                  'group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-5 py-6 sm:gap-x-10 lg:py-8',
                  FOCUS_RING
                )}
              >
                <div>
                  <h3 className="font-display text-2xl leading-tight tracking-[-0.01em] text-charcoal transition-colors group-hover:text-terracotta-dark sm:text-3xl lg:text-4xl">
                    {noOrphan(formatTitle(service.title))}
                  </h3>
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-charcoal/70 sm:text-base">
                    {noOrphan(service.description)}
                  </p>
                </div>

                <div className="relative aspect-[4/3] w-24 shrink-0 overflow-hidden bg-rose/30 sm:w-40 lg:w-56">
                  {service.image && (
                    <Image
                      src={urlFor(service.image)
                        .width(600)
                        .height(450)
                        .auto('format')
                        .quality(80)
                        .url()}
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
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
