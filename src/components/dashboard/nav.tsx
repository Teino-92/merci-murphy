'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase'
import { LayoutDashboard, Users, ClipboardList, ShoppingBag, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'

const supabase = createSupabaseBrowserClient()

const NAV = [
  { href: '/dashboard', label: "Vue d'ensemble", icon: LayoutDashboard },
  { href: '/dashboard/customers', label: 'Clients', icon: Users },
  { href: '/dashboard/shopify-customers', label: 'Clients Shopify', icon: ShoppingBag },
  { href: '/dashboard/leads', label: 'Demandes', icon: ClipboardList },
]

export function DashboardNav() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-56 shrink-0 bg-[#1D164E] min-h-screen flex flex-col hidden lg:flex">
      <div className="p-6 border-b border-white/10">
        <Image
          src="/logo.avif"
          alt="Merci Murphy"
          width={120}
          height={42}
          className="brightness-0 invert"
        />
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
  )
}
