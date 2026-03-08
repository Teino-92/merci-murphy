import { notFound } from 'next/navigation'
import { getProfileWithVisits } from '@/lib/supabase-admin'
import { CustomerDetail } from '@/components/dashboard/customer-detail'

export const dynamic = 'force-dynamic'

export default async function CustomerPage({ params }: { params: { id: string } }) {
  const data = await getProfileWithVisits(params.id)
  if (!data) notFound()
  return <CustomerDetail profile={data.profile} visits={data.visits} />
}
