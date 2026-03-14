import type { Metadata } from 'next'
import Image from 'next/image'
import { getAllServices } from '@/sanity/queries/services'
import { getTestimonials } from '@/sanity/queries/testimonials'
import { ServicesGrid } from '@/components/sections/services-grid'
import { TestimonialsSection } from '@/components/sections/testimonials-section'
import { Section, Container } from '@/components/ui/section'
import { Reveal } from '@/components/ui/reveal'

export const metadata: Metadata = {
  title: 'Nos services',
  description: 'Toilettage, bains, crèche, éducation et ostéopathie pour votre chien à Paris.',
}

export default async function ServicesPage() {
  const [services, testimonials] = await Promise.all([getAllServices(), getTestimonials()])

  return (
    <>
      {/* Hero */}
      <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] overflow-hidden bg-charcoal">
        <Image
          src="/services-hero.jpg"
          alt="Les services merci murphy®"
          fill
          priority
          className="object-cover opacity-70"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/75 via-charcoal/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal/40 to-transparent" />
        <div className="absolute bottom-0 left-0 px-8 pb-10 sm:px-14 sm:pb-14 max-w-2xl">
          <Reveal>
            <h1 className="font-display text-4xl font-bold text-cream sm:text-6xl drop-shadow-sm">
              Nos services
            </h1>
            <p className="mt-4 text-base leading-relaxed text-cream/80 sm:text-lg drop-shadow-sm">
              Toute l&apos;attention et l&apos;expertise que votre chien mérite, dans un lieu
              unique.
            </p>
          </Reveal>
        </div>
      </div>
      {services.length > 0 ? (
        <ServicesGrid services={services} />
      ) : (
        <Section className="bg-cream">
          <Container>
            <p className="text-center text-charcoal/50">Services bientôt disponibles.</p>
          </Container>
        </Section>
      )}
      {testimonials.length > 0 && <TestimonialsSection testimonials={testimonials} />}
    </>
  )
}
