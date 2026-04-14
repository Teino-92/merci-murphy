import { getProfiles, supabaseAdmin } from '@/lib/supabase-admin'
import { CustomersTable } from '@/components/dashboard/customers-table'

export const dynamic = 'force-dynamic'

export default async function CustomersPage() {
  const [profiles, dogsRes] = await Promise.all([
    getProfiles(),
    supabaseAdmin
      .from('dogs')
      .select('owner_id, name, breed')
      .order('created_at', { ascending: true }),
  ])
  if (dogsRes.error) throw dogsRes.error

  // All dogs per owner
  const dogMap: Record<string, { name: string; breed: string | null }[]> = {}
  for (const dog of dogsRes.data ?? []) {
    if (!dogMap[dog.owner_id]) dogMap[dog.owner_id] = []
    dogMap[dog.owner_id].push({ name: dog.name, breed: dog.breed })
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1D164E] mb-8">
        Clients{' '}
        <span className="text-sm font-normal text-gray-400 ml-1">{profiles.length} inscrits</span>
      </h1>
      {profiles.length === 0 ? (
        <p className="text-gray-400">Aucun profil client enregistré.</p>
      ) : (
        <CustomersTable profiles={profiles} dogMap={dogMap} />
      )}
    </div>
  )
}
