import type { Metadata } from 'next'
import { getAllServices } from '@/sanity/queries/services'
import { ServicesGrid } from '@/components/sections/services-grid'
import { Section, Container } from '@/components/ui/section'
import { Reveal } from '@/components/ui/reveal'

export const metadata: Metadata = {
  title: 'Nos services',
  description: 'Toilettage, bains, crèche, éducation et ostéopathie pour votre chien à Paris.',
}

export default async function ServicesPage() {
  const services = await getAllServices()

  return (
    <>
      <Section className="bg-charcoal text-cream py-20">
        <Container>
          <Reveal className="text-center">
            <h1 className="font-display text-4xl font-bold sm:text-5xl">Nos services</h1>
            <p className="mt-4 text-lg text-cream/70">
              Tout ce dont votre chien a besoin, sous un même toit.
            </p>
          </Reveal>
        </Container>
      </Section>
      {services.length > 0 ? (
        <ServicesGrid services={services} />
      ) : (
        <Section className="bg-cream">
          <Container>
            <p className="text-center text-charcoal/50">Services bientôt disponibles.</p>
          </Container>
        </Section>
      )}
    </>
  )
}
