import { NewReservationForm } from '@/components/dashboard/new-reservation-form'
import { sanityClient } from '@/sanity/client'

export const dynamic = 'force-dynamic'

export interface ServiceOption {
  slug: string
  title: string
  calendlyUrl: string | null
}

async function getServices(): Promise<ServiceOption[]> {
  return sanityClient.fetch(
    `*[_type == "service"] | order(ordre asc, _createdAt asc) { "slug": slug.current, title, calendlyUrl }`,
    {},
    { next: { revalidate: 3600 } }
  )
}

export default async function NewReservationPage() {
  const services = await getServices()
  return <NewReservationForm services={services} />
}
