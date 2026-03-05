import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { CartProvider } from '@/context/cart-context'
import { CartDrawer } from '@/components/shop/cart-drawer'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <CartProvider>
      <Navbar showCart isLoggedIn={!!user} />
      <CartDrawer />
      <main>{children}</main>
      <Footer />
    </CartProvider>
  )
}
