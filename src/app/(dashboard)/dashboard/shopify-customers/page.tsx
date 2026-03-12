import { getShopifyCustomers } from '@/lib/shopify-admin'
import { ShopifyCustomersTable } from '@/components/dashboard/shopify-customers-table'

export const dynamic = 'force-dynamic'

export default async function ShopifyCustomersPage() {
  const customers = await getShopifyCustomers(50)

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1D164E] mb-2">Clients Shopify</h1>
      <p className="text-sm text-gray-400 mb-8">
        Acheteurs de la boutique en ligne —{' '}
        <span className="font-medium">{customers.length} clients</span>
      </p>
      {customers.length === 0 ? (
        <p className="text-gray-400">Aucun client Shopify.</p>
      ) : (
        <ShopifyCustomersTable customers={customers} />
      )}
    </div>
  )
}
