import { notFound } from 'next/navigation'
import { getShopifyCustomerById } from '@/lib/shopify-admin'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ShopifyCustomerPage({ params }: { params: { id: string } }) {
  const data = await getShopifyCustomerById(params.id)
  if (!data) notFound()
  const { customer, orders } = data

  return (
    <div>
      <Link
        href="/dashboard/shopify-customers"
        className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-[#1D164E] mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> Clients Shopify
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h1 className="text-xl font-bold text-[#1D164E]">
              {[customer.firstName, customer.lastName].filter(Boolean).join(' ') || 'Client'}
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">{customer.email}</p>
            {customer.phone && <p className="text-sm text-gray-400">{customer.phone}</p>}
            <div className="mt-5 pt-5 border-t border-gray-100 grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-[#1D164E]">{customer.ordersCount}</p>
                <p className="text-xs text-gray-400 mt-0.5">Commandes</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1D164E]">
                  {parseFloat(customer.totalSpent).toLocaleString('fr-FR', {
                    style: 'currency',
                    currency: 'EUR',
                  })}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">Total dépensé</p>
              </div>
            </div>
            <p className="mt-4 text-xs text-gray-400">
              Client depuis le {new Date(customer.createdAt).toLocaleDateString('fr-FR')}
            </p>
            {customer.note && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
                  Note Shopify
                </p>
                <p className="text-sm text-gray-600">{customer.note}</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-5">
              Historique commandes
            </p>
            {orders.length === 0 ? (
              <p className="text-sm text-gray-400">Aucune commande.</p>
            ) : (
              <div className="space-y-3">
                {orders.map((o) => (
                  <div key={o.id} className="p-4 rounded-xl bg-gray-50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-[#1D164E]">{o.name}</span>
                      <span className="text-sm font-bold text-[#1D164E]">
                        {parseFloat(o.totalPrice).toLocaleString('fr-FR', {
                          style: 'currency',
                          currency: 'EUR',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-400">
                        {new Date(o.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-600 font-medium">
                        {o.financialStatus}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      {o.lineItems.map((li) => `${li.title} ×${li.quantity}`).join(', ')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
