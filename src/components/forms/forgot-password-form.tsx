'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { requestPasswordReset } from '@/lib/auth-actions'
import { noOrphan } from '@/lib/typo'

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const result = await requestPasswordReset(email)

    setLoading(false)

    if (!result.success) {
      setError(result.error ?? 'Une erreur est survenue. Vérifiez votre adresse email.')
      return
    }

    setSent(true)
  }

  if (sent) {
    return (
      <div className="text-center space-y-4">
        <p className="text-lg font-semibold text-charcoal">Email envoyé !</p>
        <p className="text-sm text-charcoal/60">
          Si un compte existe pour <strong>{email}</strong>, vous recevrez un lien de
          réinitialisation dans quelques instants.
        </p>
        <p className="text-sm text-charcoal/40">Pensez à vérifier vos spams.</p>
        <Link
          href="/compte/connexion"
          className="text-sm text-terracotta-dark hover:underline block mt-4"
        >
          Retour à la connexion
        </Link>
      </div>
    )
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
      {error && <p className="text-sm text-red-500">{noOrphan(error)}</p>}
      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-terracotta-dark text-white hover:bg-terracotta/90"
      >
        {loading ? 'Envoi…' : 'Envoyer le lien'}
      </Button>
      <p className="text-center text-sm text-charcoal/50">
        <Link href="/compte/connexion" className="text-terracotta-dark hover:underline">
          Retour à la connexion
        </Link>
      </p>
    </form>
  )
}
