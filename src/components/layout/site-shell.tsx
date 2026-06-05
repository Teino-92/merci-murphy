'use client'

import { usePathname } from 'next/navigation'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { PromoBanner } from '@/components/layout/promo-banner'
import { CartDrawer } from '@/components/shop/cart-drawer'
import type { PromoBanner as PromoBannerData } from '@/sanity/queries/site-settings'

interface SiteShellProps {
  children: React.ReactNode
  showBlog?: boolean
  promoBanner?: PromoBannerData | null
}

export function SiteShell({ children, showBlog = false, promoBanner }: SiteShellProps) {
  const pathname = usePathname()
  const isDashboard = pathname.startsWith('/dashboard')

  if (isDashboard) return <>{children}</>

  return (
    <>
      <div className="sticky top-0 z-50">
        {promoBanner && <PromoBanner banner={promoBanner} />}
        <Navbar showBlog={showBlog} />
      </div>
      <CartDrawer />
      {children}
      <Footer showBlog={showBlog} />
    </>
  )
}
