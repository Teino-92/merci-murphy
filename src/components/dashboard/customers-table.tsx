'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'
import type { Profile } from '@/lib/supabase-admin'

type DogSummary = { name: string; breed: string | null }

export function CustomersTable({
  profiles,
  dogMap,
}: {
  profiles: Profile[]
  dogMap: Record<string, DogSummary[]>
}) {
  const [query, setQuery] = useState('')
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const filtered = profiles.filter((p) => {
    const q = query.toLowerCase()
    const dogs = dogMap[p.id] ?? []
    return (
      p.nom.toLowerCase().includes(q) ||
      dogs.some(
        (d) => d.name.toLowerCase().includes(q) || (d.breed ?? '').toLowerCase().includes(q)
      ) ||
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
                <th className="text-left px-5 py-3 font-medium text-gray-500">Chien(s)</th>
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
              {filtered.map((p) => {
                const dogs = dogMap[p.id] ?? []
                const first = dogs[0]
                const rest = dogs.slice(1)
                const isExpanded = expanded[p.id] ?? false

                return (
                  <tr
                    key={p.id}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-5 py-4 font-medium text-[#1D164E]">{p.nom}</td>
                    <td className="px-5 py-4 text-gray-700">
                      {first ? (
                        <div>
                          <span>{first.name}</span>
                          {rest.length > 0 && (
                            <>
                              {isExpanded &&
                                rest.map((d) => (
                                  <div key={d.name} className="text-gray-500 text-xs mt-0.5">
                                    {d.name}
                                  </div>
                                ))}
                              <button
                                onClick={() =>
                                  setExpanded((prev) => ({ ...prev, [p.id]: !isExpanded }))
                                }
                                className="block text-xs text-[#1D164E]/50 hover:text-[#1D164E] underline underline-offset-2 mt-0.5"
                              >
                                {isExpanded
                                  ? 'Masquer'
                                  : `+${rest.length} autre${rest.length > 1 ? 's' : ''}`}
                              </button>
                            </>
                          )}
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-5 py-4 text-gray-500 hidden sm:table-cell">
                      {first ? (
                        <div>
                          <span>{first.breed ?? '—'}</span>
                          {isExpanded &&
                            rest.map((d) => (
                              <div key={d.name} className="text-xs mt-0.5">
                                {d.breed ?? '—'}
                              </div>
                            ))}
                        </div>
                      ) : (
                        '—'
                      )}
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
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
