import { getLeads } from '@/lib/supabase-admin'
import { LeadsTable } from '@/components/dashboard/leads-table'

export const dynamic = 'force-dynamic'

export default async function LeadsPage() {
  const leads = await getLeads()
  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1D164E] mb-8">Demandes</h1>
      <LeadsTable leads={leads} />
    </div>
  )
}
