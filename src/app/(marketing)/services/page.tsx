import type { Metadata } from 'next'
import Link from 'next/link'

import { FAQ_SERVICES } from '@/components/sections/faq-services-data'
import { FaqV2 } from '@/components/sections/faq-v2'
import { PageHeaderV2 } from '@/components/sections/page-header-v2'
import { ServicesCatalogV2 } from '@/components/sections/services-catalog-v2'
import { TestimonialsV2 } from '@/components/sections/testimonials-v2'
import { Button } from '@/components/ui/button'
import { CONTAINER, INLINE_LINK } from '@/components/ui/editorial'
import { getAllServices } from '@/sanity/queries/services'
import { getTestimonials } from '@/sanity/queries/testimonials'

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

      <PageHeaderV2
        title="Nos services"
        sub="sous un même toit, à Paris 9e"
        intro={
          <p>
            Toilettage, balnéo, crèche, éducation, ostéopathie : toute l&apos;attention et
            l&apos;expertise que votre chien mérite, réunies dans un lieu unique à Paris 9e.
          </p>
        }
        image={{
          src: '/services-hero.jpg',
          alt: 'Les services merci murphy®',
          position: '78% 40%',
        }}
      >
        <Button
          asChild
          size="lg"
          className="h-12 self-start bg-terracotta-dark px-8 text-[15px] text-white hover:bg-terracotta-dark/90 sm:self-auto"
        >
          <Link href="/reservation">Prendre rendez-vous</Link>
        </Button>
      </PageHeaderV2>

      {services.length > 0 ? (
        <ServicesCatalogV2
          services={services}
          aside={
            <p>
              Notre cœur de métier reste le{' '}
              <Link href="/toilettage-chien-paris" className={INLINE_LINK}>
                toilettage pour chien à Paris
              </Link>
              {' : une mise en beauté'} sans stress, pensée pour le confort de votre compagnon.
            </p>
          }
        />
      ) : (
        <section className="bg-white py-16">
          <div className={CONTAINER}>
            <p className="text-charcoal/50">Services bientôt disponibles.</p>
          </div>
        </section>
      )}

      <TestimonialsV2 testimonials={testimonials} />

      <FaqV2 items={FAQ_SERVICES} />
    </>
  )
}
