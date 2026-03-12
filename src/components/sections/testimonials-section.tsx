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
        {/* Mobile — horizontal scroll carousel */}
        <div
          className="mt-12 sm:hidden overflow-x-auto overflow-y-hidden scrollbar-hide -mx-4 px-4"
          style={{ touchAction: 'pan-x' }}
        >
          <div className="flex gap-4" style={{ width: 'max-content' }}>
            {testimonials.map((t) => (
              <div key={t._id} className="w-72 shrink-0">
                <TestimonialCard
                  auteur={t.auteur}
                  note={t.note}
                  texte={t.texte}
                  service={t.service?.title}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Desktop — masonry */}
        <div className="mt-12 hidden sm:columns-2 sm:block lg:columns-3 gap-4 space-y-4">
          {testimonials.map((t) => (
            <div key={t._id} className="break-inside-avoid mb-4">
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
