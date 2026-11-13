import Link from 'next/link'

import { BeforeAfterSlider } from '@/components/sections/before-after-slider'
import { Button } from '@/components/ui/button'
import {
  CONTAINER,
  DisplayTitle,
  RULED_ITEM,
  RULED_LIST,
  TEXT_LINK,
} from '@/components/ui/editorial'
import { cn } from '@/lib/utils'
import type { Testimonial } from '@/sanity/queries/testimonials'
import { noOrphan } from '@/lib/typo'

interface GroomingSpotlightV2Props {
  testimonials: Testimonial[]
}

const SERVICE_HREF = '/services/le-toilettage-maison-poilus-r'

// Rayures déjà utilisées par la section actuelle : ici elles deviennent un
// store banne derrière la photo au lieu d'un fond de section.
const STRIPES =
  'repeating-linear-gradient(90deg, transparent 0px, transparent 28px, rgba(139,90,58,0.15) 28px, rgba(139,90,58,0.15) 48px)'

/**
 *Toilettage v2.
 * Texte aligné à gauche, avant/après à cheval sur un panneau rayé qui file
 * hors cadre (écho de l'aplat rose du hero). Les avis passent du carrousel à
 * une liste à filets.
 */
export function GroomingSpotlightV2({ testimonials }: GroomingSpotlightV2Props) {
  return (
    <section className="overflow-hidden bg-cream py-16 lg:py-24">
      <div className={CONTAINER}>
        <div className="grid grid-cols-1 gap-y-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-center lg:gap-x-20">
          <div>
            <DisplayTitle sub="par Andrea & Titouan">Toilettage maison POILUS®</DisplayTitle>

            <div className="mt-8 max-w-xl space-y-5 lg:mt-10">
              <p className="text-lg leading-relaxed text-charcoal lg:text-xl lg:leading-relaxed">
                Trois années de formation exigeante, un diplôme de BTM toiletteur, des récompenses
                en concours nationaux. Et surtout, une attention sincère portée au bien-être de
                chaque chien.
              </p>
              <p className="text-base leading-relaxed text-charcoal/70">
                Andrea et Titouan ne font pas que toiletter, ils prennent soin. Leur philosophie :
                zéro stress, zéro précipitation. Chaque séance est pensée pour que votre chien
                reparte plus léger, plus beau, et surtout plus heureux qu&apos;à son arrivée.
              </p>
              <p className="text-base leading-relaxed text-charcoal/70">
                Passionnés depuis l&apos;enfance par le monde animal, ils ont tous les deux choisi
                de faire de cet amour leur métier. Résultat : des mains expertes, un vrai regard
                pour chaque chien, et des transformations qui{' '}
                <span className="whitespace-nowrap">parlent d&apos;elles-mêmes.</span>
              </p>
            </div>

            <div className="mt-9 flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-8">
              <Button
                asChild
                size="lg"
                className="h-auto min-h-12 whitespace-normal bg-terracotta-dark px-7 py-3 text-center text-[15px] text-white hover:bg-terracotta-dark/90"
              >
                <Link href={SERVICE_HREF}>Découvrir le toilettage maison POILUS®</Link>
              </Button>
              <Link
                href={`${SERVICE_HREF}#tarifs`}
                className={cn(TEXT_LINK.light, 'self-start sm:self-auto')}
              >
                Voir les tarifs
              </Link>
            </div>
          </div>

          <div className="relative pt-10 lg:pt-14">
            <div
              aria-hidden="true"
              className="absolute bottom-[24%] left-[34%] top-0 w-screen"
              style={{ backgroundImage: STRIPES }}
            />

            <figure className="relative w-[80%] sm:w-[56%] lg:w-[86%]">
              <BeforeAfterSlider
                before={{ src: '/avant-apres-2-avant.jpg', alt: 'Samy avant son toilettage' }}
                after={{ src: '/avant-apres-2-apres.jpg', alt: 'Samy après son toilettage' }}
                zoom={1}
                className="[&_.rounded-2xl]:rounded-none"
              />
              <figcaption className="mt-4 text-sm text-charcoal/70">
                <span className="font-display text-base italic text-charcoal">Samy</span>, avant et
                après. Faites glisser pour comparer.
              </figcaption>
            </figure>
          </div>
        </div>

        {testimonials.length > 0 && (
          <div className="mt-16 lg:mt-24">
            <h3 className="font-display text-2xl leading-tight text-charcoal lg:text-[1.75rem]">
              Ce qu&apos;en disent nos clients
            </h3>

            {/* Pas de gap-x : les filets doivent rester continus d'une colonne à l'autre. */}
            <ul className={cn(RULED_LIST, 'mt-6 grid grid-cols-1 lg:grid-cols-2')}>
              {testimonials.map((testimonial) => (
                <li
                  key={testimonial._id}
                  className={cn(RULED_ITEM, 'py-7 lg:py-8 lg:odd:pr-8 lg:even:pl-8')}
                >
                  <figure>
                    <p className="text-sm tracking-[0.2em] text-terracotta-dark">
                      <span aria-hidden="true">{'★'.repeat(testimonial.note)}</span>
                      <span className="sr-only">Note : {testimonial.note} sur 5</span>
                    </p>
                    <blockquote className="mt-3 text-base leading-relaxed text-charcoal/80">
                      {noOrphan(testimonial.texte)}
                    </blockquote>
                    <figcaption className="mt-4 font-display text-lg italic text-charcoal">
                      {noOrphan(testimonial.auteur)}
                    </figcaption>
                  </figure>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  )
}
