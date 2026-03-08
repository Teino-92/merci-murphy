import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { ServiceCard } from './service-card'
import { Section, Container } from '@/components/ui/section'
import { Reveal } from '@/components/ui/reveal'
import type { ServiceSummary } from '@/sanity/queries/services'
import { urlFor } from '@/sanity/client'

interface ServicesGridProps {
  services: ServiceSummary[]
  preview?: boolean
}

export function ServicesGrid({ services, preview = false }: ServicesGridProps) {
  const displayed = preview ? services.slice(0, 3) : services
  return (
    <Section className="bg-cream">
      <Container>
        <Reveal>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-display text-3xl font-bold text-charcoal sm:text-4xl">
                Nos services
              </h2>
              <p className="mt-2 text-charcoal/60">
                Tout ce dont votre chien a besoin, sous un même toit.
              </p>
            </div>
            {preview && (
              <Link
                href="/services"
                className="flex items-center gap-1 text-sm font-medium text-terracotta hover:gap-2 transition-all shrink-0"
              >
                Voir tout <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </Reveal>
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {displayed.map((service, i) => (
            <Reveal key={service._id} delay={i * 100}>
              <ServiceCard
                title={service.title}
                description={service.description}
                slug={service.slug.current}
                imageSrc={
                  service.image ? urlFor(service.image).width(600).height(400).url() : undefined
                }
              />
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  )
}
