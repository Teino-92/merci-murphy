import Image from 'next/image'
import type { ReactNode } from 'react'

import { CONTAINER, DisplayTitle, SUB_LINE, SUB_TONE } from '@/components/ui/editorial'
import { SanityImage } from '@/components/ui/sanity-image'
import { noOrphan } from '@/lib/typo'
import { cn, BLUR_PLACEHOLDER } from '@/lib/utils'

interface PageHeaderImage {
  src: string
  alt: string
  /** object-position CSS, pour cadrer le sujet dans le format portrait. */
  position?: string
  /** URL issue de urlFor() : passe par le loader Sanity (srcset léger en mobile). */
  sanity?: boolean
  blurDataURL?: string
}

interface PageHeaderV2Props {
  /** Texte du h1, repris tel quel de la page actuelle (SEO). */
  title: ReactNode
  /** Ligne italique sous le h1. Rendue hors du h1 pour ne pas en changer le texte. */
  sub?: ReactNode
  intro?: ReactNode
  image?: PageHeaderImage
  /** Actions : un bouton plein au maximum, éventuellement un TEXT_LINK. */
  children?: ReactNode
  /** Photo réservée au desktop (boutique : les produits doivent remonter en mobile). */
  imageDesktopOnly?: boolean
}

/**
 *En-tête des pages intérieures.
 * Version calme du hero de la home : même grille, même aplat rose derrière la
 * photo, mais pas d'animation et une hauteur dictée par le contenu. Sans
 * image, le texte occupe seul la largeur (pages utilitaires).
 */
export function PageHeaderV2({
  title,
  sub,
  intro,
  image,
  children,
  imageDesktopOnly = false,
}: PageHeaderV2Props) {
  const HeaderImage = image?.sanity ? SanityImage : Image

  return (
    <header className="relative isolate overflow-hidden bg-cream">
      <div
        className={cn(
          CONTAINER,
          'grid grid-cols-1',
          image && 'lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-x-20'
        )}
      >
        <div className="flex flex-col justify-center pb-12 pt-12 sm:pt-16 lg:py-24">
          <DisplayTitle as="h1" size="feature">
            {title}
          </DisplayTitle>

          {sub && <p className={cn(SUB_LINE, SUB_TONE.light, 'mt-4 lg:mt-6')}>{noOrphan(sub)}</p>}

          {intro && (
            <div className="text-balance mt-7 max-w-lg text-base leading-relaxed text-charcoal/70 lg:mt-9 lg:text-lg">
              {intro}
            </div>
          )}

          {children && (
            <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-8">
              {children}
            </div>
          )}
        </div>

        {image && (
          <div
            className={cn(
              'relative items-center pb-12 pt-6 lg:flex lg:py-16',
              imageDesktopOnly ? 'hidden' : 'flex'
            )}
          >
            <div
              aria-hidden="true"
              className="absolute bottom-[18%] left-[38%] top-0 -z-10 w-screen bg-rose"
            />

            <div className="relative ml-10 aspect-[4/5] w-[78%] overflow-hidden sm:ml-16 sm:w-[60%] lg:ml-0 lg:w-[88%]">
              <HeaderImage
                src={image.src}
                alt={image.alt}
                fill
                priority
                placeholder="blur"
                blurDataURL={image.blurDataURL ?? BLUR_PLACEHOLDER}
                className="object-cover"
                style={image.position ? { objectPosition: image.position } : undefined}
                sizes="(min-width: 1024px) 36vw, (min-width: 640px) 60vw, 78vw"
              />
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
