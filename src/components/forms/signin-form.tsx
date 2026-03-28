'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { signIn } from '@/lib/auth-actions'

export function SignInForm({ redirectTo = '/compte' }: { redirectTo?: string }) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const result = await signIn({ email, password })
    setLoading(false)
    if (result.success) {
      router.push(redirectTo)
      router.refresh()
    } else {
      setError(result.error ?? 'Une erreur est survenue.')
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
