'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase'
import {
  LayoutDashboard,
  Users,
  Users2,
  ClipboardList,
  ShoppingBag,
  Mail,
  LogOut,
  CalendarDays,
  Bell,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const supabase = createSupabaseBrowserClient()

const ADMIN_NAV = [
  { href: '/dashboard', label: "Vue d'ensemble", icon: LayoutDashboard },
  { href: '/dashboard/reservations/new', label: 'Calendrier', icon: CalendarDays },
  { href: '/dashboard/customers', label: 'Clients', icon: Users },
  { href: '/dashboard/staff', label: 'Équipe', icon: Users2 },
  { href: '/dashboard/shopify-customers', label: 'Clients Shopify', icon: ShoppingBag },
  { href: '/dashboard/leads', label: 'Demandes', icon: ClipboardList },
  { href: '/dashboard/newsletter', label: 'Newsletter', icon: Mail },
]

const TEAM_NAV = [
  { href: '/dashboard/reservations/new', label: 'Calendrier', icon: CalendarDays },
  { href: '/dashboard/customers', label: 'Clients', icon: Users },
  { href: '/dashboard/shopify-customers', label: 'Clients Shopify', icon: ShoppingBag },
  { href: '/dashboard/leads', label: 'Demandes', icon: ClipboardList },
  { href: '/dashboard/newsletter', label: 'Newsletter', icon: Mail },
]

function usePendingCount() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    async function load() {
      const { count: n } = await supabase
        .from('visits')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending_deposit')
      setCount(n ?? 0)
    }
    load()

    // Re-check whenever visits table changes
    const channel = supabase
      .channel('pending-count')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'visits' }, load)
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return count
}

export function DashboardNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname()
  const router = useRouter()
  const NAV = isAdmin ? ADMIN_NAV : TEAM_NAV
  const pendingCount = usePendingCount()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="w-56 shrink-0 bg-[#1D164E] h-screen sticky top-0 flex-col hidden lg:flex">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <Image
            src="/logo.avif"
            alt="Merci Murphy"
            width={120}
            height={42}
            className="brightness-0 invert"
          />
          {pendingCount > 0 && (
            <Link
              href="/dashboard/customers"
              title={`${pendingCount} acompte${pendingCount > 1 ? 's' : ''} en attente`}
              className="relative text-white/60 hover:text-white transition-colors"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1.5 -right-1.5 bg-[#B85C38] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
                {pendingCount > 9 ? '9+' : pendingCount}
              </span>
            </Link>
          )}
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                  active
                    ? 'bg-white/15 text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Se déconnecter
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#1D164E] flex items-center justify-between px-4 py-3">
        <Image
          src="/logo.avif"
          alt="Merci Murphy"
          width={90}
          height={32}
          className="brightness-0 invert"
        />
        <div className="flex items-center gap-3">
          {pendingCount > 0 && (
            <Link
              href="/dashboard/customers"
              className="relative text-white/60 hover:text-white transition-colors"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1.5 -right-1.5 bg-[#B85C38] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
                {pendingCount > 9 ? '9+' : pendingCount}
              </span>
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="text-white/60 hover:text-white transition-colors"
            aria-label="Se déconnecter"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Mobile bottom tab bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#1D164E] border-t border-white/10 flex">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-medium transition-colors',
                active ? 'text-white' : 'text-white/50'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="truncate w-full text-center px-1">{label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
