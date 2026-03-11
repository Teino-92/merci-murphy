import { TestimonialCard } from './testimonial-card'
import { Section, Container } from '@/components/ui/section'
import { Reveal } from '@/components/ui/reveal'
import type { Testimonial } from '@/sanity/queries/testimonials'

interface TestimonialsSectionProps {
  testimonials: Testimonial[]
}

export function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
  if (testimonials.length === 0) return null

  return (
    <Section className="bg-[#1D164E]">
      <Container>
        <Reveal>
          <div className="text-center">
            <h2 className="font-display text-3xl font-bold text-cream sm:text-4xl">
              Ils nous font confiance
            </h2>
          </div>
        </Reveal>
        <div className="mt-12 columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {testimonials.map((t) => (
            <div key={t._id} className="break-inside-avoid">
              <TestimonialCard
                auteur={t.auteur}
                note={t.note}
                texte={t.texte}
                service={t.service?.title}
              />
            </div>
          ))}
        </div>
      </Container>
    </Section>
  )
}
