'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SITE_CONFIG } from '@/config/site'
import { Button } from '@/components/ui/button'
import { CartIcon } from '@/components/shop/cart-icon'
import { AuthButton } from '@/components/layout/auth-button'
import { PawStamp } from '@/components/ui/paw-stamp'

interface NavbarProps {
  showCart?: boolean
  isLoggedIn?: boolean
}

export function Navbar({ showCart = false, isLoggedIn = false }: NavbarProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

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
        <nav className="hidden items-center gap-8 lg:flex">
          {SITE_CONFIG.nav.map((item) => {
            const isActive =
              pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group relative text-sm font-medium transition-colors hover:text-terracotta',
                  isActive ? 'text-terracotta' : 'text-charcoal/70'
                )}
              >
                {item.label}
                <PawStamp active={isActive} />
              </Link>
            )
          })}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {showCart && <CartIcon />}
          <AuthButton isLoggedIn={isLoggedIn} />
          <Button asChild className="bg-terracotta text-white hover:bg-terracotta/90">
            <Link href="/reservation">Réserver</Link>
          </Button>
        </div>

        {/* Mobile right side */}
        <div className="flex items-center gap-2 lg:hidden">
          {showCart && <CartIcon />}
          <AuthButton isLoggedIn={isLoggedIn} />
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
            {SITE_CONFIG.nav.map((item) => {
              const isActive =
                pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'group relative flex items-center gap-2 py-3 text-base font-medium transition-colors hover:text-terracotta',
                    isActive ? 'text-terracotta' : 'text-charcoal/70'
                  )}
                >
                  {item.label}
                  {isActive && (
                    <span aria-hidden style={{ rotate: '-8deg', display: 'inline-block' }}>
                      <svg
                        width="20"
                        height="16"
                        viewBox="0 0 28 22"
                        fill="none"
                        className="text-terracotta"
                      >
                        <ellipse
                          cx="14"
                          cy="15"
                          rx="7.5"
                          ry="6"
                          fill="currentColor"
                          opacity="0.85"
                        />
                        <ellipse
                          cx="5.5"
                          cy="8"
                          rx="2.8"
                          ry="2.2"
                          fill="currentColor"
                          opacity="0.85"
                          transform="rotate(-15 5.5 8)"
                        />
                        <ellipse
                          cx="10.5"
                          cy="5.5"
                          rx="2.6"
                          ry="2.1"
                          fill="currentColor"
                          opacity="0.85"
                          transform="rotate(-5 10.5 5.5)"
                        />
                        <ellipse
                          cx="17"
                          cy="5.5"
                          rx="2.6"
                          ry="2.1"
                          fill="currentColor"
                          opacity="0.85"
                          transform="rotate(5 17 5.5)"
                        />
                        <ellipse
                          cx="22.5"
                          cy="8"
                          rx="2.8"
                          ry="2.2"
                          fill="currentColor"
                          opacity="0.85"
                          transform="rotate(15 22.5 8)"
                        />
                      </svg>
                    </span>
                  )}
                </Link>
              )
            })}
            <Button asChild className="mt-4 bg-terracotta text-white hover:bg-terracotta/90">
              <Link href="/reservation" onClick={() => setOpen(false)}>
                Réserver
              </Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  )
}
