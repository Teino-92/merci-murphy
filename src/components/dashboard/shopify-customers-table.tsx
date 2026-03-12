'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'
import type { ShopifyCustomer } from '@/lib/shopify-admin'

export function ShopifyCustomersTable({ customers }: { customers: ShopifyCustomer[] }) {
  const [query, setQuery] = useState('')

  const filtered = customers.filter((c) => {
    const q = query.toLowerCase()
    const name = [c.firstName, c.lastName].filter(Boolean).join(' ').toLowerCase()
    return name.includes(q) || c.email.toLowerCase().includes(q)
  })

  return (
    <div>
      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher par nom ou email…"
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
                <th className="text-left px-5 py-3 font-medium text-gray-500 hidden sm:table-cell">
                  Email
                </th>
                <th className="text-left px-5 py-3 font-medium text-gray-500 hidden md:table-cell">
                  Commandes
                </th>
                <th className="text-left px-5 py-3 font-medium text-gray-500 hidden lg:table-cell">
                  Total dépensé
                </th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const rawId = c.id.split('/').pop() ?? c.id
                return (
                  <tr
                    key={c.id}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-5 py-4 font-medium text-[#1D164E]">
                      {[c.firstName, c.lastName].filter(Boolean).join(' ') || '—'}
                    </td>
                    <td className="px-5 py-4 text-gray-500 hidden sm:table-cell">{c.email}</td>
                    <td className="px-5 py-4 text-gray-500 hidden md:table-cell">
                      {c.ordersCount}
                    </td>
                    <td className="px-5 py-4 text-gray-500 hidden lg:table-cell">
                      {parseFloat(c.totalSpent).toLocaleString('fr-FR', {
                        style: 'currency',
                        currency: 'EUR',
                      })}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/dashboard/shopify-customers/${rawId}`}
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
