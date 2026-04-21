import Link from 'next/link'
import { Section, Container } from '@/components/ui/section'
import { Reveal } from '@/components/ui/reveal'
import { BeforeAfterSlider } from '@/components/sections/before-after-slider'
import { FloatingIcons } from '@/components/sections/floating-icons'
import { TestimonialsCarousel } from '@/components/sections/testimonials-carousel'
import type { Testimonial } from '@/sanity/queries/testimonials'

interface GroomingSpotlightProps {
  testimonials: Testimonial[]
}

export function GroomingSpotlight({ testimonials }: GroomingSpotlightProps) {
  return (
    <Section className="bg-cream overflow-hidden">
      <Container className="relative">
        <FloatingIcons />

        <Reveal>
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="font-display text-3xl font-bold text-charcoal sm:text-4xl">
              Toilettage maison POILUS®
            </h2>
            <p className="mt-3 text-sm font-medium tracking-widest text-terracotta uppercase">
              Par Andrea &amp; Titouan
            </p>
            <p className="mt-5 text-base text-charcoal/65 leading-relaxed">
              Premiers de leur promotion respective, primés au{' '}
              <span className="text-charcoal/80 font-medium">[Nom du concours — à compléter]</span>,
              Andrea et Titouan ne font pas que toiletter — ils prennent soin. Leur philosophie :
              zéro stress, zéro précipitation. Chaque séance est pensée pour que votre chien reparte
              plus léger, plus beau, et surtout plus heureux qu&apos;à son arrivée.
            </p>
            <p className="mt-4 text-base text-charcoal/65 leading-relaxed">
              Passionnés depuis l&apos;enfance par le monde animal, ils ont tous les deux choisi de
              faire de cet amour un métier d&apos;excellence. Résultat : des mains expertes, un
              regard bienveillant, et des transformations qui parlent d&apos;elles-mêmes.
            </p>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div className="mx-auto mt-10 max-w-sm">
            <BeforeAfterSlider
              before={{ src: '/avant-apres-2-avant.jpg', alt: 'Avant toilettage' }}
              after={{ src: '/avant-apres-2-apres.jpg', alt: 'Après toilettage' }}
              zoom={1}
            />
          </div>
        </Reveal>

        <Reveal delay={150}>
          <div className="mt-6 text-center">
            <Link
              href="/services/le-toilettage-maison-poilus-r"
              className="text-sm text-charcoal/50 hover:text-terracotta transition-colors"
            >
              Voir toutes les transformations →
            </Link>
          </div>
        </Reveal>
      </Container>

      {testimonials.length > 0 && <TestimonialsCarousel testimonials={testimonials} />}
    </Section>
  )
}
