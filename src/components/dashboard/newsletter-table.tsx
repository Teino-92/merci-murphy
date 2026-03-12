'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import type { NewsletterSubscriber } from '@/lib/supabase-admin'

export function NewsletterTable({ subscribers: initial }: { subscribers: NewsletterSubscriber[] }) {
  const [subscribers, setSubscribers] = useState(initial)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')

  const filtered = subscribers.filter((s) => {
    const matchQuery = s.email.toLowerCase().includes(query.toLowerCase())
    const matchFilter = filter === 'all' || (filter === 'active' ? s.active : !s.active)
    return matchQuery && matchFilter
  })

  async function toggle(id: string, active: boolean) {
    setSubscribers((prev) => prev.map((s) => (s.id === id ? { ...s, active } : s)))
    await fetch('/api/dashboard/newsletter', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, active }),
    })
  }

  return (
    <div>
      {/* Search + filter */}
      <div className="mb-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un email…"
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1D164E]"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'active', 'inactive'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${
                filter === f
                  ? 'bg-[#1D164E] text-white border-[#1D164E]'
                  : 'border-gray-200 text-gray-500 hover:border-[#1D164E] hover:text-[#1D164E]'
              }`}
            >
              {f === 'all' ? 'Tous' : f === 'active' ? 'Actifs' : 'Désabonnés'}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-gray-400">Aucun résultat.</p>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3 font-medium text-gray-500">Email</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500 hidden sm:table-cell">
                  Inscrit·e le
                </th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Statut</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-right">Abonnement</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr
                  key={s.id}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-5 py-4 font-medium text-[#1D164E]">{s.email}</td>
                  <td className="px-5 py-4 text-gray-400 hidden sm:table-cell">
                    {new Date(s.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        s.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {s.active ? 'Actif' : 'Désabonné·e'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => toggle(s.id, !s.active)}
                      className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors duration-200 focus:outline-none ${
                        s.active ? 'bg-[#1D164E]' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 mt-0.5 ${
                          s.active ? 'translate-x-4' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
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
