'use client'

import Link from 'next/link'
import { User, LogOut } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'
import { createSupabaseBrowserClient } from '@/lib/supabase'

export function AuthButton() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)
  const [open, setOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const supabase = createSupabaseBrowserClient()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      setIsLoggedIn(!!session)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleSignOut() {
    const supabase = createSupabaseBrowserClient()
    await supabase.auth.signOut()
    setOpen(false)
    router.push('/')
  }

  if (isLoggedIn === null) return <span className="w-9 h-9" />

  if (!isLoggedIn) {
    return (
      <Link
        href="/compte/connexion"
        aria-label="Se connecter"
        className="flex items-center gap-1.5 text-sm font-medium text-charcoal/70 hover:text-terracotta-dark transition-colors"
      >
        <User className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline" aria-hidden="true">
          Se connecter
        </span>
      </Link>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-sm font-medium text-charcoal/70 hover:text-terracotta-dark transition-colors"
      >
        <User className="h-4 w-4" />
        <span className="hidden sm:inline">Mon compte</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-20 w-44 rounded-xl border border-charcoal/10 bg-cream shadow-lg">
            <Link
              href="/compte"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2 px-4 py-3 text-sm text-charcoal/70 hover:text-terracotta-dark transition-colors"
            >
              <User className="h-4 w-4" />
              Mon compte
            </Link>
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-2 px-4 py-3 text-sm text-charcoal/70 hover:text-red-500 transition-colors border-t border-charcoal/5"
            >
              <LogOut className="h-4 w-4" />
              Se déconnecter
            </button>
          </div>
        </>
      )}
    </div>
  )
}
