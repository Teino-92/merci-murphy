import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { DashboardNav } from '@/components/dashboard/nav'
import { RealtimeNotifications } from '@/components/dashboard/realtime-notifications'
import { isAdminEmail } from '@/lib/auth-role'

export const metadata = { title: 'Dashboard | Merci Murphy', robots: { index: false } }

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const isAdmin = isAdminEmail(user.email)

  return (
    <div className="min-h-screen bg-[#F5F0EB] flex">
      <RealtimeNotifications />
      <DashboardNav isAdmin={isAdmin} />
      <main className="flex-1 p-4 pt-20 pb-24 lg:p-10 lg:pt-10 lg:pb-10 overflow-auto">
        {children}
      </main>
    </div>
  )
}
