import { NewReservationForm } from '@/components/dashboard/new-reservation-form'
import { CalendarView } from '@/components/dashboard/calendar-view'
import { sanityClient } from '@/sanity/client'

export const dynamic = 'force-dynamic'

export interface ServiceOption {
  slug: string
  title: string
}

async function getServices(): Promise<ServiceOption[]> {
  const rows: { slug: string; title: string }[] = await sanityClient.fetch(
    `*[_type == "service"] | order(ordre asc, _createdAt asc) { "slug": slug.current, title }`,
    {},
    { next: { revalidate: 3600 } }
  )
  return rows.filter((s) => s.slug && s.title)
}

export default async function NewReservationPage() {
  const services = await getServices()
  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1D164E] mb-6">Calendrier & Réservation</h1>
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-6 items-start">
        <CalendarView />
        <div className="xl:sticky xl:top-6">
          <NewReservationForm services={services} />
        </div>
      </div>
    </div>
  )
}
