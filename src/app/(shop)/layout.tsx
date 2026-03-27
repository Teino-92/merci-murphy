import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { CartProvider } from '@/context/cart-context'
import { CartDrawer } from '@/components/shop/cart-drawer'

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <Navbar showCart />
      <CartDrawer />
      <main>{children}</main>
      <Footer />
    </CartProvider>
  )
}
