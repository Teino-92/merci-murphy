import { notFound } from 'next/navigation'
import { getProfileWithVisits, supabaseAdmin } from '@/lib/supabase-admin'
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

  // Get dogs from dogs table (source of truth since the gate flow)
  const { data: dogs } = await supabaseAdmin
    .from('dogs')
    .select(
      'id, owner_id, name, breed, age, poids, etat_poil, photo_url, grooming_duration, numero_puce, notes'
    )
    .eq('owner_id', params.id)
    .order('created_at', { ascending: true })

  return (
    <CustomerDetail
      profile={data.profile}
      visits={data.visits}
      email={email}
      isAdmin={isAdmin}
      dogs={dogs ?? []}
    />
  )
}
