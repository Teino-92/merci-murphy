import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <>
      <Navbar isLoggedIn={!!user} />
      <main>{children}</main>
      <Footer />
    </>
  )
}
