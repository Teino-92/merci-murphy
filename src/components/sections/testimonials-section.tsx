import { TestimonialCard } from './testimonial-card'
import { Section, Container } from '@/components/ui/section'
import type { Testimonial } from '@/sanity/queries/testimonials'

interface TestimonialsSectionProps {
  testimonials: Testimonial[]
}

export function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
  if (testimonials.length === 0) return null

  return (
    <Section className="bg-cream">
      <Container>
        <div className="text-center">
          <h2 className="font-display text-3xl font-bold text-charcoal sm:text-4xl">
            Ils nous font confiance
          </h2>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <TestimonialCard
              key={t._id}
              auteur={t.auteur}
              note={t.note}
              texte={t.texte}
              service={t.service?.title}
            />
          ))}
        </div>
      </Container>
    </Section>
  )
}
