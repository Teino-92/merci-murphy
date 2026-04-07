import { NewReservationForm } from '@/components/dashboard/new-reservation-form'
import { sanityClient } from '@/sanity/client'

export const dynamic = 'force-dynamic'

export interface ServiceOption {
  slug: string
  title: string
  calLink: string | null // e.g. 'merci-murphy/toilettage' — null for manual services
}

// Cal.com services — slug prefix → cal.com event slug
const CAL_LINKS: Record<string, string> = {
  toilettage: 'merci-murphy/toilettage',
  bains: 'merci-murphy/les-bains',
  balneo: 'merci-murphy/balneo',
}

// Manual services (no cal.com embed)
const MANUAL_SERVICES = new Set(['massage', 'osteo', 'education'])

async function getServices(): Promise<ServiceOption[]> {
  const rows: { slug: string; title: string }[] = await sanityClient.fetch(
    `*[_type == "service"] | order(ordre asc, _createdAt asc) { "slug": slug.current, title }`,
    {},
    { next: { revalidate: 3600 } }
  )
  // Include cal.com services + manual services; exclude crèche and parent entries
  return rows
    .filter((s) => {
      const key = Object.keys(CAL_LINKS).find((k) => s.slug.includes(k))
      return key !== undefined || MANUAL_SERVICES.has(s.slug)
    })
    .map((s) => {
      const calKey = Object.keys(CAL_LINKS).find((k) => s.slug.includes(k))
      return {
        slug: s.slug,
        title: s.title,
        calLink: calKey ? CAL_LINKS[calKey] : null,
      }
    })
}

export default async function NewReservationPage() {
  const services = await getServices()
  return <NewReservationForm services={services} />
}
