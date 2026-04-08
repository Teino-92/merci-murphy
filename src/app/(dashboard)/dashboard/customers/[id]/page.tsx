import { notFound } from 'next/navigation'
import { getProfileWithVisits } from '@/lib/supabase-admin'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { CustomerDetail } from '@/components/dashboard/customer-detail'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { isAdminEmail } from '@/lib/auth-role'

export const dynamic = 'force-dynamic'

export default async function CustomerPage({ params }: { params: { id: string } }) {
  const [data, supabase] = await Promise.all([
    getProfileWithVisits(params.id),
    createSupabaseServerClient(),
  ])
  if (!data) notFound()

  const {
    data: { user: me },
  } = await supabase.auth.getUser()
  const isAdmin = isAdminEmail(me?.email)

  // Get the customer's auth email
  const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(params.id)
  const email = authUser?.user?.email ?? null

  return (
    <CustomerDetail profile={data.profile} visits={data.visits} email={email} isAdmin={isAdmin} />
  )
}
