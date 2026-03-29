'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
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
const PREVIEW_SLUGS = [SPA_SLUG, 'la-creche', 'l-education', 'l-osteopathie']
const MOBILE_ONLY_PREVIEW_SLUGS = ['l-osteopathie']

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
                className="flex items-center gap-1 text-sm font-medium text-terracotta-dark-dark hover:gap-2 transition-all shrink-0"
              >
                Voir tout <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </Reveal>

        <div className="mt-12 grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {mainServices.map((service) => {
            const imageSrc = service.image
              ? urlFor(service.image).width(600).height(400).auto('format').quality(80).url()
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
                        <Image
                          src={imageSrc}
                          alt={service.title}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/30 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-5 flex flex-col justify-end h-[120px] sm:h-[160px]">
                        <h3 className="font-display text-base sm:text-xl font-semibold text-cream line-clamp-2 min-h-[40px] sm:min-h-[56px]">
                          {service.title}
                        </h3>
                        <p className="mt-1 text-xs sm:text-sm leading-relaxed text-cream/70 line-clamp-2 hidden sm:block min-h-[40px]">
                          {service.description}
                        </p>
                        <span className="mt-3 flex items-center gap-1 text-sm font-medium text-terracotta-dark">
                          {spaOpen ? 'Fermer' : 'Découvrir'}
                          <ChevronDown
                            className={`h-4 w-4 transition-transform duration-300 ${spaOpen ? 'rotate-180' : ''}`}
                          />
                        </span>
                      </div>
                    </div>
                  </button>

                  {spaOpen &&
                    spaChildren.map((child, j) => (
                      <div
                        key={child._id}
                        className="reveal-anim"
                        style={{ animationDelay: `${j * 80}ms`, animationPlayState: 'running' }}
                      >
                        <ServiceCard
                          title={child.title}
                          description={child.description}
                          slug={child.slug.current}
                          imageSrc={
                            child.image
                              ? urlFor(child.image)
                                  .width(600)
                                  .height(400)
                                  .auto('format')
                                  .quality(80)
                                  .url()
                              : undefined
                          }
                        />
                      </div>
                    ))}
                </>
              )
            }

            const mobileOnly = preview && MOBILE_ONLY_PREVIEW_SLUGS.includes(service.slug.current)
            return (
              <ServiceCard
                key={service._id}
                title={service.title}
                description={service.description}
                slug={service.slug.current}
                imageSrc={imageSrc}
                className={mobileOnly ? 'sm:hidden' : undefined}
              />
            )
          })}
        </div>
      </Container>
    </Section>
  )
}
