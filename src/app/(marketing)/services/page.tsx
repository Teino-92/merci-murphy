import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getAllServices } from '@/sanity/queries/services'
import { getTestimonials } from '@/sanity/queries/testimonials'
import { ServicesGrid } from '@/components/sections/services-grid'
import { TestimonialsSection } from '@/components/sections/testimonials-section'
import { FaqServices } from '@/components/sections/faq-services'
import { FAQ_SERVICES } from '@/components/sections/faq-services-data'
import { Section, Container } from '@/components/ui/section'
import { BLUR_PLACEHOLDER } from '@/lib/utils'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Toilettage, spa & crèche pour chiens à Paris 9e',
  description:
    'Toilettage sans stress, balnéothérapie, crèche, éducation et ostéopathie pour chiens — 8 prestations sous un même toit à Paris 9e. Réservez en ligne 7j/7.',
  openGraph: {
    images: [
      { url: '/og/og-services.jpg', width: 1200, height: 630, alt: 'Nos services — Merci Murphy' },
    ],
  },
}

export default async function ServicesPage() {
  const [services, testimonials] = await Promise.all([getAllServices(), getTestimonials()])

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_SERVICES.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.reponse,
      },
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      {/* Hero */}
      <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] overflow-hidden bg-charcoal-light">
        <Image
          src="/services-hero.jpg"
          alt="Les services merci murphy®"
          fill
          priority
          placeholder="blur"
          blurDataURL={BLUR_PLACEHOLDER}
          className="object-cover opacity-70"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/50 via-charcoal/10 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal/20 to-transparent" />
        <div className="absolute bottom-0 left-0 px-8 pb-10 sm:px-14 sm:pb-14 max-w-2xl">
          <h1 className="font-display text-4xl font-bold text-cream sm:text-6xl drop-shadow-sm">
            Nos services
          </h1>
          <p className="mt-4 text-base leading-relaxed text-cream/80 sm:text-lg drop-shadow-sm">
            Toilettage, balnéo, crèche, éducation, ostéopathie : toute l&apos;attention et
            l&apos;expertise que votre chien mérite, réunies dans un lieu unique à Paris 9e.
          </p>
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
      <Section className="bg-cream pt-0">
        <Container className="max-w-3xl">
          <p className="text-charcoal/70 leading-relaxed">
            Notre cœur de métier reste le{' '}
            <Link
              href="/toilettage-chien-paris"
              className="font-medium text-terracotta-dark underline-offset-2 hover:underline"
            >
              toilettage pour chien à Paris
            </Link>{' '}
            : une mise en beauté sans stress, pensée pour le confort de votre compagnon.
          </p>
        </Container>
      </Section>
      {testimonials.length > 0 && <TestimonialsSection testimonials={testimonials} />}
      <FaqServices />
    </>
  )
}
