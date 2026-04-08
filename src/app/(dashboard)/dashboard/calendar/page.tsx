import { CalendarView } from '@/components/dashboard/calendar-view'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Calendrier | Merci Murphy' }

export default function CalendarPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1D164E] mb-6">Calendrier</h1>
      <CalendarView />
    </div>
  )
}
