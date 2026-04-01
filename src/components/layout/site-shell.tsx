'use client'

import { usePathname } from 'next/navigation'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { CartDrawer } from '@/components/shop/cart-drawer'

interface SiteShellProps {
  children: React.ReactNode
  showBlog?: boolean
}

export function SiteShell({ children, showBlog = false }: SiteShellProps) {
  const pathname = usePathname()
  const isDashboard = pathname.startsWith('/dashboard')

  if (isDashboard) return <>{children}</>

  return (
    <>
      <Navbar showBlog={showBlog} />
      <CartDrawer />
      {children}
      <Footer />
    </>
  )
}
