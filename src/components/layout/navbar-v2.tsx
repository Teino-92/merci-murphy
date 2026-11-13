'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import { AuthButton } from '@/components/layout/auth-button'
import { CartIcon } from '@/components/shop/cart-icon'
import { FOCUS_RING } from '@/components/ui/editorial'
import { PawStamp } from '@/components/ui/paw-stamp'
import { SITE_CONFIG } from '@/config/site'
import { useCart } from '@/context/cart-context'
import { cn } from '@/lib/utils'
import { noOrphan } from '@/lib/typo'

export type NavbarVariant = 'enseigne' | 'ligne'

interface NavbarV2Props {
  variant: NavbarVariant
  showBlog?: boolean
}

interface NavItem {
  label: string
  href: string
}

const MENU_ID = 'menu-principal'
const RESERVER =
  'bg-terracotta-dark text-[15px] text-white transition-colors hover:bg-terracotta-dark/90'

function isActivePath(pathname: string, href: string) {
  return pathname === href || (href !== '/' && pathname.startsWith(href))
}

function Logo({ className }: { className: string }) {
  return (
    <Link href="/" className={cn('block shrink-0 rounded-sm', FOCUS_RING)}>
      <Image
        src="/logo.avif"
        alt="merci murphy®"
        width={500}
        height={72}
        className={cn('w-auto', className)}
        priority
      />
    </Link>
  )
}

/**
 * Navbar du site, deux variantes (la prod utilise « enseigne »).
 * « enseigne » : logo centré façon en-tête de maison, liens Playfair sur une
 * seconde rangée qui se replie au défilement.
 * « ligne » : une seule rangée, « Réserver » en bloc plein collé au bord droit.
 * Mêmes liens que la navbar actuelle ; le menu mobile est commun aux deux.
 */
export function NavbarV2({ variant, showBlog = false }: NavbarV2Props) {
  const pathname = usePathname()
  const { cart: cartData } = useCart()
  const headerRef = useRef<HTMLElement>(null)
  const [open, setOpen] = useState(false)
  const [panelHeight, setPanelHeight] = useState(0)
  const [collapsed, setCollapsed] = useState(false)

  const navItems: NavItem[] = [
    ...SITE_CONFIG.nav.slice(0, 4),
    ...(showBlog ? [{ label: 'Blog', href: '/blog' }] : []),
    ...SITE_CONFIG.nav.slice(4),
  ]
  const showCart = pathname.startsWith('/shop') || (cartData?.totalQuantity ?? 0) > 0
  const isEnseigne = variant === 'enseigne'

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!open) return

    const measure = () => {
      const bottom = headerRef.current?.getBoundingClientRect().bottom ?? 0
      setPanelHeight(window.innerHeight - bottom)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    measure()
    document.body.style.overflow = 'hidden'
    window.addEventListener('resize', measure)
    window.addEventListener('keydown', onKey)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('resize', measure)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  useEffect(() => {
    if (!isEnseigne) return

    let lastY = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      if (Math.abs(y - lastY) < 6) return
      setCollapsed(y > lastY && y > 160)
      lastY = y
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [isEnseigne])

  const menuButton = (
    <button
      type="button"
      aria-expanded={open}
      aria-controls={MENU_ID}
      onClick={() => setOpen((value) => !value)}
      className={cn(
        'rounded-sm py-2 text-[15px] text-charcoal underline decoration-terracotta decoration-1 underline-offset-[6px]',
        FOCUS_RING
      )}
    >
      {open ? 'Fermer' : 'Menu'}
    </button>
  )

  const cart = (
    <span className={showCart ? 'opacity-100' : 'pointer-events-none opacity-0'}>
      <CartIcon />
    </span>
  )

  const dark = !isEnseigne

  const mobilePanel = (
    <div
      id={MENU_ID}
      hidden={!open}
      style={{ height: panelHeight }}
      className={cn(
        'absolute inset-x-0 top-full overflow-y-auto overscroll-contain lg:hidden',
        dark ? 'bg-[#4F6072] text-cream' : 'bg-cream text-charcoal'
      )}
    >
      <div className="flex min-h-full flex-col px-4 pb-8 pt-2 sm:px-6">
        <ul className={cn('border-b', dark ? 'border-cream/25' : 'border-charcoal/15')}>
          {navItems.map((item) => {
            const active = isActivePath(pathname, item.href)
            return (
              <li
                key={item.href}
                className={cn('border-t', dark ? 'border-cream/25' : 'border-charcoal/15')}
              >
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'block py-4 font-display text-[28px] leading-tight',
                    active && 'italic',
                    active && !dark && 'text-terracotta-dark'
                  )}
                >
                  {noOrphan(item.label)}
                </Link>
              </li>
            )
          })}
        </ul>

        <Link
          href="/reservation"
          onClick={() => setOpen(false)}
          className={cn(
            'mt-8 flex h-14 items-center justify-center text-base transition-colors',
            dark
              ? 'bg-cream text-charcoal hover:bg-white'
              : 'bg-terracotta-dark text-white hover:bg-terracotta-dark/90'
          )}
        >
          Réserver
        </Link>

        <div
          className={cn(
            'mt-auto pt-10 text-[15px] leading-relaxed',
            dark ? 'text-cream/85' : 'text-charcoal/70'
          )}
        >
          <p>{noOrphan(SITE_CONFIG.address)}</p>
          <p>
            <a
              href={`tel:${SITE_CONFIG.phone.replace(/\s/g, '')}`}
              className="underline decoration-1 underline-offset-4"
            >
              {noOrphan(SITE_CONFIG.phone)}
            </a>
          </p>
        </div>
      </div>
    </div>
  )

  if (isEnseigne) {
    return (
      <header ref={headerRef} className="relative">
        <div className="relative z-10 border-b border-charcoal/10 bg-cream">
          <div className="mx-auto grid h-16 max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 sm:px-6 lg:h-20 lg:px-8">
            <div className="flex items-center">
              <span className="lg:hidden">{menuButton}</span>
              <Link
                href="/contact"
                className={cn(
                  'hidden rounded-sm text-sm text-charcoal/70 transition-colors hover:text-terracotta-dark lg:inline',
                  FOCUS_RING
                )}
              >
                {SITE_CONFIG.address}
              </Link>
            </div>

            <Logo className="h-7 lg:h-10" />

            <div className="flex items-center justify-end gap-1 lg:gap-3">
              {cart}
              <AuthButton />
              <Link
                href="/reservation"
                className={cn('ml-2 hidden h-11 items-center px-7 lg:flex', RESERVER)}
              >
                Réserver
              </Link>
            </div>
          </div>
        </div>

        <nav
          aria-label="Navigation principale"
          className={cn(
            'absolute inset-x-0 top-full hidden border-b border-charcoal/10 bg-cream transition-[transform,visibility] duration-300 ease-out motion-reduce:transition-none lg:block',
            collapsed && 'invisible -translate-y-full'
          )}
        >
          <ul className="mx-auto flex h-12 max-w-7xl items-center justify-center gap-11 px-8">
            {navItems.map((item) => {
              const active = isActivePath(pathname, item.href)
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'rounded-sm font-display text-[17px] decoration-terracotta decoration-1 underline-offset-[7px] transition-colors hover:text-terracotta-dark',
                      FOCUS_RING,
                      active ? 'text-terracotta-dark underline' : 'text-charcoal'
                    )}
                  >
                    {noOrphan(item.label)}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {mobilePanel}
      </header>
    )
  }

  return (
    <header ref={headerRef} className="relative border-b border-charcoal/10 bg-cream">
      <div className="flex h-16 items-stretch pl-4 sm:pl-6 lg:h-[72px] lg:pl-8">
        <div className="flex items-center">
          <Logo className="h-7 lg:h-8 xl:h-9" />
        </div>

        <nav
          aria-label="Navigation principale"
          className="mx-auto hidden items-center gap-8 lg:flex xl:gap-11"
        >
          {navItems
            .filter((item) => item.href !== '/')
            .map((item) => {
              const active = isActivePath(pathname, item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'group relative rounded-sm text-[15px] transition-colors hover:text-terracotta-dark',
                    FOCUS_RING,
                    active ? 'text-terracotta-dark' : 'text-charcoal/80'
                  )}
                >
                  {item.label}
                  <PawStamp active={active} />
                </Link>
              )
            })}
        </nav>

        <div className="ml-auto flex items-center gap-1 pr-4 sm:pr-6 lg:ml-0 lg:gap-2 lg:pr-6 lg:[&_a_span]:hidden xl:[&_a_span]:inline">
          {cart}
          <AuthButton />
          <span className="ml-3 lg:hidden">{menuButton}</span>
        </div>

        <Link href="/reservation" className={cn('hidden items-center px-9 lg:flex', RESERVER)}>
          Réserver
        </Link>
      </div>

      {mobilePanel}
    </header>
  )
}
