import { Hero } from '@/components/sections/hero'
import { ServicesGrid } from '@/components/sections/services-grid'
import { Values } from '@/components/sections/values'
import { TestimonialsSection } from '@/components/sections/testimonials-section'
import { ShopTeaser } from '@/components/sections/shop-teaser'
import { InfoPratiques } from '@/components/sections/info-pratiques'
import { getAllServices } from '@/sanity/queries/services'
import { getTestimonials } from '@/sanity/queries/testimonials'
import { getSiteSettings } from '@/sanity/queries/site-settings'
import { getFeaturedProducts } from '@/lib/shopify'

export default async function HomePage() {
  const [services, testimonials, settings, featuredProducts] = await Promise.all([
    getAllServices(),
    getTestimonials(3),
    getSiteSettings(),
    getFeaturedProducts(3),
  ])

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Merci Murphy',
    description:
      'Boutique premium de bien-être pour chiens à Paris. Toilettage, spa, crèche, éducation et ostéopathie.',
    url: 'https://mercimurphy.com',
    image: 'https://mercimurphy.com/logo.avif',
    telephone: settings?.telephone,
    email: settings?.email,
    address: settings
      ? {
          '@type': 'PostalAddress',
          streetAddress: settings.adresse,
          postalCode: settings.codePostal,
          addressLocality: settings.ville,
          addressCountry: 'FR',
        }
      : undefined,
    openingHoursSpecification: settings?.horaires?.map((h) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: h.jour,
      opens: h.heures.split('-')[0]?.trim(),
      closes: h.heures.split('-')[1]?.trim(),
    })),
    sameAs: [settings?.instagram].filter(Boolean),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero
        title="Le bien-être de votre chien, au cœur de Paris"
        subtitle="Toilettage, spa, crèche, éducation et ostéopathie — tout ce dont votre compagnon a besoin, dans un espace chaleureux et bienveillant."
      />
      {services.length > 0 && <ServicesGrid services={services} preview />}
      <Values />
      {testimonials.length > 0 && <TestimonialsSection testimonials={testimonials} />}
      <ShopTeaser products={featuredProducts} />
      {settings && <InfoPratiques settings={settings} />}
    </>
  )
}
