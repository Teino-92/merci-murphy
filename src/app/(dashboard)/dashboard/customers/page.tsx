import { getProfiles } from '@/lib/supabase-admin'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function CustomersPage() {
  const profiles = await getProfiles()

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1D164E] mb-8">Clients</h1>

      {profiles.length === 0 ? (
        <p className="text-gray-400">Aucun profil client enregistré.</p>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3 font-medium text-gray-500">Client</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Chien</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500 hidden sm:table-cell">
                  Race
                </th>
                <th className="text-left px-5 py-3 font-medium text-gray-500 hidden md:table-cell">
                  Téléphone
                </th>
                <th className="text-left px-5 py-3 font-medium text-gray-500 hidden lg:table-cell">
                  Inscrit le
                </th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {profiles.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-5 py-4 font-medium text-[#1D164E]">{p.nom}</td>
                  <td className="px-5 py-4 text-gray-700">{p.nom_chien ?? '—'}</td>
                  <td className="px-5 py-4 text-gray-500 hidden sm:table-cell">
                    {p.race_chien ?? '—'}
                  </td>
                  <td className="px-5 py-4 text-gray-500 hidden md:table-cell">{p.telephone}</td>
                  <td className="px-5 py-4 text-gray-400 hidden lg:table-cell">
                    {new Date(p.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/dashboard/customers/${p.id}`}
                      className="text-xs font-medium text-[#1D164E] hover:underline"
                    >
                      Voir →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
