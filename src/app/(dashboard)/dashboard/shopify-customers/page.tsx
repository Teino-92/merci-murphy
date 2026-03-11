import { getShopifyCustomers } from '@/lib/shopify-admin'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function ShopifyCustomersPage() {
  const customers = await getShopifyCustomers(50)

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1D164E] mb-2">Clients Shopify</h1>
      <p className="text-sm text-gray-400 mb-8">Acheteurs de la boutique en ligne.</p>

      {customers.length === 0 ? (
        <p className="text-gray-400">Aucun client Shopify.</p>
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
              {customers.map((c) => {
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
