'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { signUp, type SignUpData } from '@/lib/auth-actions'
import { CheckCircle } from 'lucide-react'

const STEPS = ['Vos coordonnées', 'Votre compte']

export function SignUpForm() {
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const [form, setForm] = useState<Partial<SignUpData>>({})
  const [newsletter, setNewsletter] = useState(false)
  const set = (key: keyof SignUpData, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1))
  const prev = () => setStep((s) => Math.max(s - 1, 0))

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    const result = await signUp({ ...(form as SignUpData), newsletter_subscribed: newsletter })
    setLoading(false)
    if (result.success) {
      setDone(true)
    } else {
      setError(result.error ?? 'Une erreur est survenue.')
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center py-12 text-center">
        <CheckCircle className="h-16 w-16 text-rose" />
        <h2 className="mt-6 font-display text-2xl font-bold text-charcoal">
          Bienvenue chez merci murphy® !
        </h2>
        <p className="mt-3 text-charcoal/60 max-w-sm">
          Votre compte a bien été créé. Vous allez recevoir un email de bienvenue. Connectez-vous
          pour compléter le profil de votre chien.
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
              className={`h-1 rounded-full transition-colors ${i <= step ? 'bg-terracotta-dark' : 'bg-charcoal/10'}`}
            />
            <p
              className={`mt-1 text-xs ${i === step ? 'font-medium text-terracotta-dark' : 'text-charcoal/40'}`}
            >
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* Step 0 — Contact */}
      {step === 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-charcoal">Prénom *</label>
              <Input
                placeholder="Marie"
                value={form.prenom ?? ''}
                onChange={(e) => set('prenom', e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-charcoal">Nom *</label>
              <Input
                placeholder="Dupont"
                value={form.nom ?? ''}
                onChange={(e) => set('nom', e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-charcoal">Téléphone *</label>
            <Input
              type="tel"
              placeholder="06 00 00 00 00"
              value={form.telephone ?? ''}
              onChange={(e) => set('telephone', e.target.value)}
            />
          </div>
          <Button
            onClick={next}
            disabled={!form.prenom || !form.nom || !form.telephone}
            className="w-full bg-terracotta-dark text-white hover:bg-terracotta/90"
          >
            Continuer
          </Button>
        </div>
      )}

      {/* Step 1 — Compte */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-charcoal">Email *</label>
            <Input
              type="email"
              placeholder="marie@example.com"
              value={form.email ?? ''}
              onChange={(e) => set('email', e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-charcoal">Mot de passe *</label>
            <Input
              type="password"
              placeholder="Au moins 8 caractères"
              value={form.password ?? ''}
              onChange={(e) => set('password', e.target.value)}
            />
            <p className="mt-1.5 text-xs text-charcoal/50">
              8 caractères minimum · majuscule, minuscule et chiffre requis
            </p>
          </div>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={newsletter}
              onChange={(e) => setNewsletter(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-charcoal/30 accent-[#8B5A3A]"
            />
            <span className="text-xs text-charcoal/60 leading-relaxed">
              Je souhaite recevoir les actualités et offres de merci murphy® par email.
            </span>
          </label>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex gap-3">
            <Button variant="outline" onClick={prev} className="flex-1">
              Retour
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading || !form.email || !form.password}
              className="flex-1 bg-terracotta-dark text-white hover:bg-terracotta/90"
            >
              {loading ? 'Création…' : 'Créer mon compte'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
