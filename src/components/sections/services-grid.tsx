'use client'

import Link from 'next/link'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ChevronDown } from 'lucide-react'
import { ServiceCard } from './service-card'
import { Section, Container } from '@/components/ui/section'
import { Reveal } from '@/components/ui/reveal'
import type { ServiceSummary } from '@/sanity/queries/services'
import { urlFor } from '@/sanity/client'

const SPA_SLUG = 'le-spa-maison-poilus-r'
const SPA_CHILDREN_SLUGS = [
  'le-toilettage-maison-poilus-r',
  'le-bain-en-libre-service-maison-poilus-r',
  'balneo-maison-poilus-r',
  'le-massage-bien-etre-maison-poilus-r-and-petit-nenuphard',
]
const PREVIEW_SLUGS = [SPA_SLUG, 'la-creche', 'l-education']

interface ServicesGridProps {
  services: ServiceSummary[]
  preview?: boolean
}

export function ServicesGrid({ services, preview = false }: ServicesGridProps) {
  const [spaOpen, setSpaOpen] = useState(false)
  const displayed = preview
    ? (PREVIEW_SLUGS.map((slug) => services.find((s) => s.slug.current === slug)).filter(
        Boolean
      ) as ServiceSummary[])
    : services

  const spaChildren = SPA_CHILDREN_SLUGS.map((slug) =>
    services.find((s) => s.slug.current === slug)
  ).filter(Boolean) as ServiceSummary[]

  // Remove children from main list — they appear inline after SPA
  const mainServices = displayed.filter((s) => !SPA_CHILDREN_SLUGS.includes(s.slug.current))

  return (
    <Section className="bg-cream">
      <Container>
        <Reveal>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-display text-3xl font-bold text-charcoal sm:text-4xl">
                Nos prestations
              </h2>
              <p className="mt-2 text-charcoal/70">
                Par un collectif d&apos;experts passionnés et engagés
              </p>
            </div>
            {preview && (
              <Link
                href="/services"
                className="flex items-center gap-1 text-sm font-medium text-terracotta-dark hover:gap-2 transition-all shrink-0"
              >
                Voir tout <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {mainServices.map((service) => {
            const imageSrc = service.image
              ? urlFor(service.image).width(600).height(400).url()
              : undefined

            if (service.slug.current === SPA_SLUG) {
              // In preview mode — SPA is a normal link to /services
              if (preview) {
                return (
                  <ServiceCard
                    key={service._id}
                    title={service.title}
                    description={service.description}
                    slug="__services__"
                    imageSrc={imageSrc}
                  />
                )
              }

              // In full mode — SPA expands sub-cards
              return (
                <>
                  <button
                    key={service._id}
                    onClick={() => setSpaOpen((o) => !o)}
                    className="group w-full text-left block overflow-hidden rounded-2xl shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="relative w-full aspect-[4/3] overflow-hidden rounded-2xl">
                      {imageSrc && (
                        <img
                          src={imageSrc}
                          alt={service.title}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/30 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-5 flex flex-col justify-end h-[160px]">
                        <h3 className="font-display text-xl font-semibold text-cream line-clamp-2 min-h-[56px]">
                          {service.title}
                        </h3>
                        <p className="mt-1 text-sm leading-relaxed text-cream/70 line-clamp-2 min-h-[40px]">
                          {service.description}
                        </p>
                        <span className="mt-3 flex items-center gap-1 text-sm font-medium text-terracotta">
                          {spaOpen ? 'Fermer' : 'Découvrir'}
                          <ChevronDown
                            className={`h-4 w-4 transition-transform duration-300 ${spaOpen ? 'rotate-180' : ''}`}
                          />
                        </span>
                      </div>
                    </div>
                  </button>

                  <AnimatePresence>
                    {spaOpen &&
                      spaChildren.map((child, j) => (
                        <motion.div
                          key={child._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 20 }}
                          transition={{ duration: 0.25, ease: 'easeOut', delay: j * 0.08 }}
                        >
                          <ServiceCard
                            title={child.title}
                            description={child.description}
                            slug={child.slug.current}
                            imageSrc={
                              child.image
                                ? urlFor(child.image).width(600).height(400).url()
                                : undefined
                            }
                          />
                        </motion.div>
                      ))}
                  </AnimatePresence>
                </>
              )
            }

            return (
              <ServiceCard
                key={service._id}
                title={service.title}
                description={service.description}
                slug={service.slug.current}
                imageSrc={imageSrc}
              />
            )
          })}
        </div>
      </Container>
    </Section>
  )
}
