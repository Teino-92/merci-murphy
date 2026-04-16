import { supabaseAdmin } from '@/lib/supabase-admin'
import { StaffManager } from '@/components/dashboard/staff-manager'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { isAdminEmail } from '@/lib/auth-role'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Équipe | Merci Murphy' }

export default async function StaffPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const isAdmin = isAdminEmail(user.email)

  const { data: staffRows } = await supabaseAdmin.from('staff').select('*').order('name')
  const staff = staffRows ?? []

  const staffWithDetails = await Promise.all(
    staff.map(async (s) => {
      const { data: availData } = await supabaseAdmin
        .from('availabilities')
        .select('*')
        .eq('staff_id', s.id)
        .order('day_of_week')
      return {
        ...s,
        availabilities: availData ?? [],
      }
    })
  )

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1D164E] mb-6">Équipe</h1>
      <StaffManager initialStaff={staffWithDetails} isAdmin={isAdmin} />
    </div>
  )
}
