import { getProfiles } from '@/lib/supabase-admin'
import { CustomersTable } from '@/components/dashboard/customers-table'

export const dynamic = 'force-dynamic'

export default async function CustomersPage() {
  const profiles = await getProfiles()

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1D164E] mb-8">
        Clients{' '}
        <span className="text-sm font-normal text-gray-400 ml-1">{profiles.length} inscrits</span>
      </h1>
      {profiles.length === 0 ? (
        <p className="text-gray-400">Aucun profil client enregistré.</p>
      ) : (
        <CustomersTable profiles={profiles} />
      )}
    </div>
  )
}
