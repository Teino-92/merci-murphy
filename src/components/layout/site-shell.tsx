'use client'

import { usePathname } from 'next/navigation'

import { FooterV2 } from '@/components/layout/footer-v2'
import { NavbarV2 } from '@/components/layout/navbar-v2'
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
        <NavbarV2 variant="enseigne" showBlog={showBlog} />
      </div>
      {/* Réserve la place de la rangée de liens, posée hors flux pour pouvoir se replier. */}
      <div aria-hidden className="hidden h-[49px] bg-cream lg:block" />
      <CartDrawer />
      {children}
      <FooterV2 variant="taupe" showBlog={showBlog} />
    </>
  )
}
