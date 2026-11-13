import { formatTitle } from '@/components/sections/services-v2'
import { CONTAINER, DisplayTitle } from '@/components/ui/editorial'
import type { Testimonial } from '@/sanity/queries/testimonials'
import { noOrphan } from '@/lib/typo'

interface TestimonialsV2Props {
  testimonials: Testimonial[]
  title?: string
}

/**
 *Avis v2.
 * Colonnes à filets (même écriture que les avis du toilettage sur la home).
 * Sur mobile, bande horizontale à défilement, comme la version actuelle ; une
 * seule liste dans le DOM au lieu de deux.
 */
export function TestimonialsV2({
  testimonials,
  title = 'Nos clients ont du chien',
}: TestimonialsV2Props) {
  if (testimonials.length === 0) return null

  return (
    <section className="overflow-hidden bg-cream py-16 lg:py-24">
      <div className={CONTAINER}>
        <DisplayTitle>{title}</DisplayTitle>

        {/* [contain:paint] : sans lui, Chrome compte la bande défilante dans la
            largeur du document en mobile. */}
        <ul className="-mx-4 mt-10 flex snap-x [contain:paint] sm:[contain:none] snap-mandatory scroll-pl-4 gap-x-6 overflow-x-auto px-4 pb-2 sm:mx-0 sm:mt-14 sm:block sm:columns-2 sm:gap-x-10 sm:overflow-visible sm:px-0 sm:pb-0 lg:mt-16 lg:columns-3 lg:gap-x-14">
          {testimonials.map((testimonial) => (
            <li
              key={testimonial._id}
              className="w-[82%] shrink-0 snap-start border-t border-charcoal/15 pb-8 pt-6 sm:w-auto sm:break-inside-avoid lg:pb-10"
            >
              <figure>
                <p className="text-sm tracking-[0.2em] text-terracotta-dark">
                  <span aria-hidden="true">{'★'.repeat(testimonial.note)}</span>
                  <span className="sr-only">Note : {testimonial.note} sur 5</span>
                </p>
                <blockquote className="mt-3 text-base leading-relaxed text-charcoal/80">
                  {noOrphan(testimonial.texte)}
                </blockquote>
                <figcaption className="mt-4">
                  <span className="block font-display text-lg italic text-charcoal">
                    {testimonial.auteur}
                  </span>
                  {noOrphan(
                    testimonial.service?.title && (
                      <span className="mt-0.5 block text-sm text-charcoal/60">
                        {formatTitle(testimonial.service.title)}
                      </span>
                    )
                  )}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
