import { ServiceCard } from './service-card'
import { Section, Container } from '@/components/ui/section'
import type { ServiceSummary } from '@/sanity/queries/services'
import { urlFor } from '@/sanity/client'

interface ServicesGridProps {
  services: ServiceSummary[]
}

export function ServicesGrid({ services }: ServicesGridProps) {
  return (
    <Section className="bg-cream">
      <Container>
        <div className="text-center">
          <h2 className="font-display text-3xl font-bold text-charcoal sm:text-4xl">
            Nos services
          </h2>
          <p className="mt-4 text-charcoal/60">
            Tout ce dont votre chien a besoin, sous un même toit.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <ServiceCard
              key={service._id}
              title={service.title}
              description={service.description}
              slug={service.slug.current}
              imageSrc={
                service.image ? urlFor(service.image).width(600).height(400).url() : undefined
              }
            />
          ))}
        </div>
      </Container>
    </Section>
  )
}
