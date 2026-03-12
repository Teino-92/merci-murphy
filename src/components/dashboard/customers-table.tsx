'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'
import type { Profile } from '@/lib/supabase-admin'

export function CustomersTable({ profiles }: { profiles: Profile[] }) {
  const [query, setQuery] = useState('')

  const filtered = profiles.filter((p) => {
    const q = query.toLowerCase()
    return (
      p.nom.toLowerCase().includes(q) ||
      (p.nom_chien ?? '').toLowerCase().includes(q) ||
      (p.race_chien ?? '').toLowerCase().includes(q) ||
      p.telephone.toLowerCase().includes(q)
    )
  })

  return (
    <div>
      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher par nom, chien, race, téléphone…"
          className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1D164E]"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-gray-400">Aucun résultat.</p>
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
              {filtered.map((p) => (
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
