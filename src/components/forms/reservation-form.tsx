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
import { submitLead, type LeadFormData } from '@/lib/actions'
import { CheckCircle } from 'lucide-react'

const SERVICES = [
  { value: 'toilettage', label: 'Toilettage' },
  { value: 'bains', label: 'Bains self-service' },
  { value: 'creche', label: 'Crèche' },
  { value: 'education', label: 'Éducation' },
  { value: 'osteo', label: 'Ostéopathie' },
  { value: 'autre', label: 'Autre' },
]

const POIDS = [
  { value: '0-5kg', label: 'Moins de 5 kg' },
  { value: '5-10kg', label: '5 – 10 kg' },
  { value: '10-20kg', label: '10 – 20 kg' },
  { value: '20-40kg', label: '20 – 40 kg' },
  { value: '+40kg', label: 'Plus de 40 kg' },
]

const ETAT_POIL = [
  { value: 'normal', label: 'Normal' },
  { value: 'emmele', label: 'Emmêlé / Nœuds' },
  { value: 'long', label: 'Long' },
  { value: 'court', label: 'Court' },
]

const STEPS = ['Service', 'Votre chien', 'Vos coordonnées', 'Message']

interface DefaultValues {
  nom?: string
  email?: string
  telephone?: string
  race_chien?: string
  poids_chien?: string
  etat_poil?: string
}

export function ReservationForm({
  defaultService,
  defaultValues = {},
}: {
  defaultService?: string
  defaultValues?: DefaultValues
}) {
  const [step, setStep] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState<Partial<LeadFormData>>({
    service: (defaultService as LeadFormData['service']) ?? undefined,
    source: 'reservation',
    nom: defaultValues.nom,
    email: defaultValues.email,
    telephone: defaultValues.telephone,
    race_chien: defaultValues.race_chien,
    poids_chien: defaultValues.poids_chien as LeadFormData['poids_chien'],
    etat_poil: defaultValues.etat_poil as LeadFormData['etat_poil'],
  })

  const set = (key: keyof LeadFormData, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1))
  const prev = () => setStep((s) => Math.max(s - 1, 0))

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    const result = await submitLead(form as LeadFormData)
    setLoading(false)
    if (result.success) {
      setSubmitted(true)
    } else {
      setError(result.error ?? 'Une erreur est survenue.')
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center py-12 text-center">
        <CheckCircle className="h-16 w-16 text-rose" />
        <h2 className="mt-6 font-display text-2xl font-bold text-charcoal">Demande envoyée !</h2>
        <p className="mt-3 text-charcoal/60">
          Notre équipe vous rappellera dans les plus brefs délais pour confirmer votre rendez-vous.
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Progress */}
      <div className="mb-8 flex gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex-1">
            <div
              className={`h-1 rounded-full transition-colors ${i <= step ? 'bg-terracotta' : 'bg-charcoal/10'}`}
            />
            <p
              className={`mt-1 text-xs ${i === step ? 'font-medium text-terracotta-dark' : 'text-charcoal/40'}`}
            >
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* Step 0 — Service */}
      {step === 0 && (
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-charcoal">
              Quel service souhaitez-vous ?
            </label>
            <Select value={form.service} onValueChange={(v) => set('service', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir un service" />
              </SelectTrigger>
              <SelectContent>
                {SERVICES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={next}
            disabled={!form.service}
            className="w-full bg-terracotta-dark text-white hover:bg-terracotta-dark/90"
          >
            Continuer
          </Button>
        </div>
      )}

      {/* Step 1 — Chien */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-charcoal">Race</label>
            <Input
              placeholder="Ex: Labrador, Caniche..."
              value={form.race_chien ?? ''}
              onChange={(e) => set('race_chien', e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-charcoal">Poids</label>
            <Select value={form.poids_chien} onValueChange={(v) => set('poids_chien', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Poids approximatif" />
              </SelectTrigger>
              <SelectContent>
                {POIDS.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-charcoal">État du pelage</label>
            <Select value={form.etat_poil} onValueChange={(v) => set('etat_poil', v)}>
              <SelectTrigger>
                <SelectValue placeholder="État du pelage" />
              </SelectTrigger>
              <SelectContent>
                {ETAT_POIL.map((e) => (
                  <SelectItem key={e.value} value={e.value}>
                    {e.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={prev} className="flex-1">
              Retour
            </Button>
            <Button
              onClick={next}
              className="flex-1 bg-terracotta-dark text-white hover:bg-terracotta-dark/90"
            >
              Continuer
            </Button>
          </div>
        </div>
      )}

      {/* Step 2 — Contact (pre-filled, read-only email) */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-charcoal">Prénom et nom</label>
            <Input
              placeholder="Marie Dupont"
              value={form.nom ?? ''}
              onChange={(e) => set('nom', e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-charcoal">Email</label>
            <Input
              type="email"
              value={form.email ?? ''}
              readOnly
              className="bg-charcoal/5 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-charcoal">Téléphone</label>
            <Input
              type="tel"
              placeholder="06 00 00 00 00"
              value={form.telephone ?? ''}
              onChange={(e) => set('telephone', e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={prev} className="flex-1">
              Retour
            </Button>
            <Button
              onClick={next}
              disabled={!form.nom || !form.email || !form.telephone}
              className="flex-1 bg-terracotta-dark text-white hover:bg-terracotta-dark/90"
            >
              Continuer
            </Button>
          </div>
        </div>
      )}

      {/* Step 3 — Message */}
      {step === 3 && (
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-charcoal">
              Message (optionnel)
            </label>
            <Textarea
              placeholder="Précisions sur votre demande, disponibilités..."
              rows={4}
              value={form.message ?? ''}
              onChange={(e) => set('message', e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex gap-3">
            <Button variant="outline" onClick={prev} className="flex-1">
              Retour
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-terracotta-dark text-white hover:bg-terracotta-dark/90"
            >
              {loading ? 'Envoi…' : 'Demander à être rappelé.e'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
