'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { submitLead, type LeadFormData } from '@/lib/actions'
import { CheckCircle } from 'lucide-react'

export function ContactForm() {
  const [form, setForm] = useState({ nom: '', email: '', telephone: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const set = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const result = await submitLead({
      ...form,
      service: 'autre',
      source: 'contact',
    } as LeadFormData)
    setLoading(false)
    if (result.success) setSubmitted(true)
    else setError(result.error ?? 'Une erreur est survenue.')
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center py-8 text-center">
        <CheckCircle className="h-12 w-12 text-rose" />
        <h3 className="mt-4 font-display text-xl font-bold text-charcoal">Message envoyé !</h3>
        <p className="mt-2 text-sm text-charcoal/60">
          Nous vous répondrons dans les plus brefs délais.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-charcoal">Prénom et nom</label>
        <Input
          required
          placeholder="Marie Dupont"
          value={form.nom}
          onChange={(e) => set('nom', e.target.value)}
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-charcoal">Email</label>
        <Input
          required
          type="email"
          placeholder="marie@example.com"
          value={form.email}
          onChange={(e) => set('email', e.target.value)}
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-charcoal">Téléphone</label>
        <Input
          required
          type="tel"
          placeholder="06 00 00 00 00"
          value={form.telephone}
          onChange={(e) => set('telephone', e.target.value)}
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-charcoal">Message</label>
        <Textarea
          required
          rows={4}
          placeholder="Votre message..."
          value={form.message}
          onChange={(e) => set('message', e.target.value)}
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-terracotta text-white hover:bg-terracotta/90"
      >
        {loading ? 'Envoi...' : 'Envoyer'}
      </Button>
    </form>
  )
}
