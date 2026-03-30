'use client'

import { useState } from 'react'
import type { Lead } from '@/lib/supabase-admin'
import { SERVICE_LABELS } from '@/lib/dog-constants'

const STATUS_LABELS: Record<string, string> = {
  new: 'Nouveau',
  contacted: 'Contacté',
  confirmed: 'Confirmé',
  cancelled: 'Annulé',
}

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

export function LeadsTable({ leads }: { leads: (Lead & { has_account: boolean })[] }) {
  const [filter, setFilter] = useState<string>('all')

  const filtered =
    filter === 'all'
      ? leads
      : filter === 'no_account'
        ? leads.filter((l) => !l.has_account)
        : leads.filter((l) => l.status === filter)

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['all', 'new', 'contacted', 'confirmed', 'cancelled', 'no_account'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === s ? 'bg-[#1D164E] text-white' : 'bg-white text-gray-500 hover:bg-gray-100'
            }`}
          >
            {s === 'all' ? 'Tout' : s === 'no_account' ? 'Sans compte' : STATUS_LABELS[s]}
            {s !== 'all' && (
              <span className="ml-1.5 text-xs opacity-70">
                {s === 'no_account'
                  ? leads.filter((l) => !l.has_account).length
                  : leads.filter((l) => l.status === s).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-400">Aucune demande.</p>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3 font-medium text-gray-500">Nom</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500 hidden sm:table-cell">
                  Service
                </th>
                <th className="text-left px-5 py-3 font-medium text-gray-500 hidden md:table-cell">
                  Contact
                </th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Statut</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500 hidden lg:table-cell">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead) => (
                <tr key={lead.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-[#1D164E]">{lead.nom}</p>
                      {lead.has_account ? (
                        <span
                          className="inline-block w-2 h-2 rounded-full bg-green-400 shrink-0"
                          title="A un compte"
                        />
                      ) : (
                        <span
                          className="inline-block w-2 h-2 rounded-full bg-gray-300 shrink-0"
                          title="Sans compte"
                        />
                      )}
                    </div>
                    {lead.race_chien && (
                      <p className="text-xs text-gray-400">🐾 {lead.race_chien}</p>
                    )}
                    {lead.message && (
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{lead.message}</p>
                    )}
                  </td>
                  <td className="px-5 py-4 text-gray-600 hidden sm:table-cell">
                    {SERVICE_LABELS[lead.service] ?? lead.service}
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <p className="text-gray-700">{lead.email}</p>
                    <p className="text-xs text-gray-400">{lead.telephone}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[lead.status]}`}
                    >
                      {STATUS_LABELS[lead.status]}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-400 hidden lg:table-cell">
                    {new Date(lead.created_at).toLocaleDateString('fr-FR')}
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
