'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { subscribeNewsletter } from '@/lib/actions'

export function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const result = await subscribeNewsletter({ email })
    setLoading(false)
    if (result.success) setSubmitted(true)
    else setError(result.error ?? 'Une erreur est survenue.')
  }

  if (submitted) {
    return (
      <div className="min-h-[40px] flex items-center">
        <p className="text-sm font-medium text-cream">Merci ! Vous êtes bien inscrit(e).</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex min-h-[40px] flex-col gap-2 sm:flex-row">
      <Input
        type="email"
        required
        placeholder="Votre email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border-cream/20 bg-cream/10 text-cream placeholder:text-cream/40 focus-visible:ring-cream/30"
      />
      <Button
        type="submit"
        disabled={loading}
        className="shrink-0 bg-terracotta text-white hover:bg-terracotta/90"
      >
        {loading ? '...' : "S'inscrire"}
      </Button>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </form>
  )
}
