'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { submitRevendeurLead, type RevendeurLeadFormData } from '@/lib/actions'
import { TYPE_COMMERCE_LABELS } from '@/lib/revendeur-constants'
import { useAntiSpam } from '@/hooks/use-anti-spam'
import { CheckCircle } from 'lucide-react'

const EMPTY = {
  nom: '',
  entreprise: '',
  email: '',
  telephone: '',
  ville: '',
  type_commerce: '',
  siret: '',
  site_web: '',
  message: '',
}

export function RevendeurForm() {
  const [form, setForm] = useState(EMPTY)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { getPayload, honeypotProps } = useAntiSpam()

  const set = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const result = await submitRevendeurLead({
      ...form,
      ...getPayload(),
    } as RevendeurLeadFormData)
    setLoading(false)
    if (result.success) setSubmitted(true)
    else setError(result.error ?? 'Une erreur est survenue.')
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center py-8 text-center">
        <CheckCircle className="h-12 w-12 text-rose" />
        <h3 className="mt-4 font-display text-xl font-bold text-charcoal">Demande envoyée !</h3>
        <p className="mt-2 max-w-sm text-sm text-charcoal/60">
          Nous revenons vers vous sous 48h ouvrées avec nos conditions revendeur.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-charcoal">
            Nom de l&apos;enseigne
          </label>
          <Input
            required
            placeholder="La Boutique du Chien"
            value={form.entreprise}
            onChange={(e) => set('entreprise', e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-charcoal">Ville</label>
          <Input
            required
            placeholder="Lyon"
            value={form.ville}
            onChange={(e) => set('ville', e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-charcoal">Type de commerce</label>
        <Select required value={form.type_commerce} onValueChange={(v) => set('type_commerce', v)}>
          <SelectTrigger className="h-10 border-charcoal/20 bg-white">
            <SelectValue placeholder="Sélectionnez…" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(TYPE_COMMERCE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-charcoal">Votre nom</label>
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
            placeholder="contact@laboutique.fr"
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-charcoal">Téléphone</label>
          <Input
            required
            type="tel"
            placeholder="01 00 00 00 00"
            value={form.telephone}
            onChange={(e) => set('telephone', e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-charcoal">
            SIRET <span className="font-normal text-charcoal/50">(facultatif)</span>
          </label>
          <Input
            inputMode="numeric"
            placeholder="123 456 789 00012"
            value={form.siret}
            onChange={(e) => set('siret', e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-charcoal">
          Site web ou Instagram <span className="font-normal text-charcoal/50">(facultatif)</span>
        </label>
        <Input
          placeholder="laboutiqueduchien.fr"
          value={form.site_web}
          onChange={(e) => set('site_web', e.target.value)}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-charcoal">
          Votre projet <span className="font-normal text-charcoal/50">(facultatif)</span>
        </label>
        <Textarea
          rows={4}
          placeholder="Parlez-nous de votre boutique, des références qui vous intéressent, de vos volumes…"
          value={form.message}
          onChange={(e) => set('message', e.target.value)}
        />
      </div>

      <input {...honeypotProps} />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-charcoal text-cream hover:bg-charcoal/85"
      >
        {loading ? 'Envoi...' : 'Demander nos conditions revendeur'}
      </Button>
      <p className="text-center text-xs text-charcoal/50">
        Réponse sous 48h ouvrées. Aucun engagement.
      </p>
    </form>
  )
}
