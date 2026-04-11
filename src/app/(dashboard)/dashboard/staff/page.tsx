import { supabaseAdmin } from '@/lib/supabase-admin'
import { StaffManager } from '@/components/dashboard/staff-manager'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Équipe | Merci Murphy' }

export default async function StaffPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: staffRows } = await supabaseAdmin.from('staff').select('*').order('name')
  const staff = staffRows ?? []

  const staffWithDetails = await Promise.all(
    staff.map(async (s) => {
      const [availRes, timeOffRes] = await Promise.all([
        supabaseAdmin.from('availabilities').select('*').eq('staff_id', s.id).order('day_of_week'),
        supabaseAdmin
          .from('time_off')
          .select('*')
          .eq('staff_id', s.id)
          .gte('date', new Date().toISOString().slice(0, 10))
          .order('date')
          .limit(30),
      ])
      return {
        ...s,
        availabilities: availRes.data ?? [],
        timeOff: timeOffRes.data ?? [],
      }
    })
  )

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1D164E] mb-6">Équipe</h1>
      <StaffManager initialStaff={staffWithDetails} />
    </div>
  )
}
