import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { DashboardNav } from '@/components/dashboard/nav'

export const metadata = { title: 'Dashboard | Merci Murphy', robots: { index: false } }

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-[#F5F0EB] flex">
      <DashboardNav />
      <main className="flex-1 p-6 lg:p-10 overflow-auto">{children}</main>
    </div>
  )
}
