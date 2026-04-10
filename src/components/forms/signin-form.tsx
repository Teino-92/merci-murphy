'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createSupabaseBrowserClient } from '@/lib/supabase'

export function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') ?? '/compte'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createSupabaseBrowserClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (authError) {
      setError('Email ou mot de passe incorrect.')
    } else {
      router.push(redirectTo)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-charcoal">Email</label>
        <Input
          type="email"
          placeholder="marie@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-charcoal">Mot de passe</label>
        <Input
          type="password"
          placeholder="Votre mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-terracotta-dark text-white hover:bg-terracotta/90"
      >
        {loading ? 'Connexion…' : 'Se connecter'}
      </Button>
      <p className="text-center text-sm text-charcoal/50">
        <Link href="/compte/mot-de-passe-oublie" className="text-terracotta-dark hover:underline">
          Mot de passe oublié ?
        </Link>
      </p>
      <p className="text-center text-sm text-charcoal/50">
        Pas encore de compte ?{' '}
        <Link href="/compte/inscription" className="text-terracotta-dark hover:underline">
          Créer un compte
        </Link>
      </p>
    </form>
  )
}
