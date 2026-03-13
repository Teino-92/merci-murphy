'use client'

import Link from 'next/link'
import { User, LogOut } from 'lucide-react'
import { useState } from 'react'
import { signOut } from '@/lib/auth-actions'

export function AuthButton({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [open, setOpen] = useState(false)

  if (!isLoggedIn) {
    return (
      <Link
        href="/compte/connexion"
        aria-label="Se connecter"
        className="flex items-center gap-1.5 text-sm font-medium text-charcoal/70 hover:text-terracotta transition-colors"
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
        className="flex items-center gap-1.5 text-sm font-medium text-charcoal/70 hover:text-terracotta transition-colors"
      >
        <User className="h-4 w-4" />
        <span className="hidden sm:inline">Mon compte</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-20 w-44 rounded-xl border border-charcoal/10 bg-cream shadow-lg">
            <form action={signOut}>
              <button
                type="submit"
                className="flex w-full items-center gap-2 px-4 py-3 text-sm text-charcoal/70 hover:text-red-500 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Se déconnecter
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  )
}
