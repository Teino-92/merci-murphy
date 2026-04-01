'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SITE_CONFIG } from '@/config/site'
import { Button } from '@/components/ui/button'
import { CartIcon } from '@/components/shop/cart-icon'
import { AuthButton } from '@/components/layout/auth-button'
import { PawStamp } from '@/components/ui/paw-stamp'

interface NavbarProps {
  showBlog?: boolean
}

export function Navbar({ showBlog = false }: NavbarProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const showCart = pathname.startsWith('/shop')

  function navigate(href: string) {
    setOpen(false)
    router.push(href)
  }

  const navItems = showBlog
    ? [
        ...SITE_CONFIG.nav.slice(0, 4),
        { label: 'Blog', href: '/blog' },
        ...SITE_CONFIG.nav.slice(4),
      ]
    : SITE_CONFIG.nav

  return (
    <header className="sticky top-0 z-50 w-full border-b border-charcoal/10 bg-cream/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="Merci Murphy — Accueil">
          <Image
            src="/logo.avif"
            alt="Merci Murphy"
            width={140}
            height={48}
            className="h-10 w-auto"
            priority
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-12 lg:flex">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group relative text-sm font-medium transition-colors hover:text-terracotta-dark',
                  isActive ? 'text-terracotta-dark' : 'text-charcoal/70'
                )}
              >
                {item.label}
                <PawStamp active={isActive} />
              </Link>
            )
          })}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <span className={showCart ? 'opacity-100' : 'opacity-0 pointer-events-none'}>
            <CartIcon />
          </span>
          <AuthButton />
          <Button asChild className="bg-terracotta-dark text-white hover:bg-terracotta-dark/90">
            <Link href="/reservation">Réserver</Link>
          </Button>
        </div>

        {/* Mobile right side */}
        <div className="flex items-center gap-2 lg:hidden">
          <span className={showCart ? 'opacity-100' : 'opacity-0 pointer-events-none'}>
            <CartIcon />
          </span>
          <AuthButton />
          <button
            onClick={() => setOpen(!open)}
            aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-charcoal/10 bg-cream lg:hidden">
          <nav className="flex flex-col px-4 py-4">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
              return (
                <button
                  key={item.href}
                  onTouchEnd={(e) => {
                    e.preventDefault()
                    navigate(item.href)
                  }}
                  onClick={() => navigate(item.href)}
                  className={cn(
                    'group flex items-center py-3 text-base font-medium transition-colors hover:text-terracotta-dark text-left',
                    isActive ? 'text-terracotta-dark' : 'text-charcoal/70'
                  )}
                >
                  {item.label}
                  <PawStamp active={isActive} inline />
                </button>
              )
            })}
            <Button
              className="mt-4 bg-terracotta-dark text-white hover:bg-terracotta-dark/90"
              onTouchEnd={(e) => {
                e.preventDefault()
                navigate('/reservation')
              }}
              onClick={() => navigate('/reservation')}
            >
              Réserver
            </Button>
          </nav>
        </div>
      )}
    </header>
  )
}
