import Link from 'next/link'
import { Container } from '@/components/ui/section'
import { Reveal } from '@/components/ui/reveal'
import { BeforeAfterSlider } from '@/components/sections/before-after-slider'
import { PolaroidFan } from '@/components/sections/polaroid-fan'
import { TestimonialsCarousel } from '@/components/sections/testimonials-carousel'
import type { Testimonial } from '@/sanity/queries/testimonials'

interface GroomingSpotlightProps {
  testimonials: Testimonial[]
}

export function GroomingSpotlight({ testimonials }: GroomingSpotlightProps) {
  return (
    <div
      className="overflow-hidden px-4 py-12 sm:px-6 lg:px-8 lg:py-16"
      style={{
        backgroundImage:
          'repeating-linear-gradient(90deg, transparent 0px, transparent 28px, rgba(139,90,58,0.15) 28px, rgba(139,90,58,0.15) 48px)',
      }}
    >
      <Container className="relative">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="font-display text-3xl font-bold text-charcoal sm:text-4xl">
              Toilettage maison POILUS®
            </h2>
            <p className="mt-3 text-sm font-medium tracking-widest text-terracotta uppercase">
              Par Andrea &amp; Titouan
            </p>
            <p className="mt-5 text-base text-charcoal/65 leading-relaxed">
              Trois années de formation exigeante, un diplôme de BTM toiletteur, des récompenses en
              concours nationaux — et surtout, une attention sincère portée au bien-être de chaque
              chien. Andrea et Titouan ne font pas que toiletter — ils prennent soin. Leur
              philosophie : zéro stress, zéro précipitation. Chaque séance est pensée pour que votre
              chien reparte plus léger, plus beau, et surtout plus heureux qu&apos;à son arrivée.
            </p>
            <p className="mt-4 text-base text-charcoal/65 leading-relaxed">
              Passionnés depuis l&apos;enfance par le monde animal, ils ont tous les deux choisi de
              faire de cet amour un métier d&apos;excellence. Résultat : des mains expertes, un
              regard bienveillant, et des transformations qui parlent d&apos;elles-mêmes.
            </p>
          </div>
        </Reveal>

        {/* Mobile — 1 polaroid simple */}
        <Reveal delay={100}>
          <div
            className="mx-auto mt-10 max-w-sm sm:hidden"
            style={{ transform: 'rotate(-1.5deg)' }}
          >
            <div className="bg-white shadow-xl" style={{ padding: '12px 12px 48px 12px' }}>
              <BeforeAfterSlider
                before={{ src: '/avant-apres-2-avant.jpg', alt: 'Avant toilettage' }}
                after={{ src: '/avant-apres-2-apres.jpg', alt: 'Après toilettage' }}
                zoom={1}
                className="rounded-none"
              />
              <div className="mt-3 text-center">
                <Link
                  href="/services/le-toilettage-maison-poilus-r"
                  className="text-sm text-charcoal/60 hover:text-terracotta transition-colors font-medium tracking-wide"
                  style={{ fontFamily: 'var(--font-display, serif)', fontStyle: 'italic' }}
                >
                  Voir toutes les transformations →
                </Link>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Desktop — éventail polaroid */}
        <PolaroidFan />
      </Container>

      {testimonials.length > 0 && <TestimonialsCarousel testimonials={testimonials} />}
    </div>
  )
}
