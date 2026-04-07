import { NewReservationForm } from '@/components/dashboard/new-reservation-form'
import { sanityClient } from '@/sanity/client'

export const dynamic = 'force-dynamic'

interface ServiceCalendly {
  slug: { current: string }
  calendlyUrl: string | null
}

async function getCalendlyUrls(): Promise<Record<string, string>> {
  const services: ServiceCalendly[] = await sanityClient.fetch(
    `*[_type == "service" && defined(calendlyUrl)] { slug, calendlyUrl }`,
    {},
    { next: { revalidate: 3600 } }
  )
  return Object.fromEntries(
    services.filter((s) => s.calendlyUrl).map((s) => [s.slug.current, s.calendlyUrl as string])
  )
}

export default async function NewReservationPage() {
  const calendlyUrls = await getCalendlyUrls()
  return <NewReservationForm calendlyUrls={calendlyUrls} />
}
