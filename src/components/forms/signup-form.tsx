'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { signUp, type SignUpData } from '@/lib/auth-actions'
import { BreedCombobox } from '@/components/ui/breed-combobox'
import { CheckCircle } from 'lucide-react'
import { POIDS, ETAT_POIL } from '@/lib/dog-constants'

const STEPS = ['Votre chien', 'Vos coordonnées', 'Votre compte']

export function SignUpForm() {
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const [form, setForm] = useState<Partial<SignUpData>>({})
  const set = (key: keyof SignUpData, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1))
  const prev = () => setStep((s) => Math.max(s - 1, 0))

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    const result = await signUp(form as SignUpData)
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
          Vérifiez votre boîte mail
        </h2>
        <p className="mt-3 text-charcoal/60 max-w-sm">
          Un email de confirmation vous a été envoyé. Cliquez sur le lien pour activer votre compte,
          puis revenez pour vous connecter et faire votre demande.
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

      {/* Step 0 — Chien */}
      {step === 0 && (
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-charcoal">
              Prénom de votre chien
            </label>
            <Input
              placeholder="Ex: Rocky, Bella..."
              value={form.nom_chien ?? ''}
              onChange={(e) => set('nom_chien', e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-charcoal">Race</label>
            <BreedCombobox value={form.race_chien ?? ''} onChange={(v) => set('race_chien', v)} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-charcoal">Âge</label>
            <Select value={form.age_chien} onValueChange={(v) => set('age_chien', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Âge de votre chien" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="moins-de-1-an">Moins d&apos;1 an</SelectItem>
                <SelectItem value="1-an">1 an</SelectItem>
                <SelectItem value="2-ans">2 ans</SelectItem>
                <SelectItem value="3-ans">3 ans</SelectItem>
                <SelectItem value="4-ans">4 ans</SelectItem>
                <SelectItem value="5-ans">5 ans</SelectItem>
                <SelectItem value="6-ans">6 ans</SelectItem>
                <SelectItem value="7-ans">7 ans</SelectItem>
                <SelectItem value="8-ans">8 ans</SelectItem>
                <SelectItem value="9-ans">9 ans</SelectItem>
                <SelectItem value="10-ans">10 ans</SelectItem>
                <SelectItem value="plus-de-10-ans">Plus de 10 ans</SelectItem>
              </SelectContent>
            </Select>
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
          <Button
            onClick={next}
            className="w-full bg-terracotta-dark text-white hover:bg-terracotta/90"
          >
            Continuer
          </Button>
        </div>
      )}

      {/* Step 1 — Contact */}
      {step === 1 && (
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
              disabled={!form.nom || !form.telephone}
              className="flex-1 bg-terracotta-dark text-white hover:bg-terracotta/90"
            >
              Continuer
            </Button>
          </div>
        </div>
      )}

      {/* Step 2 — Compte */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-charcoal">Email</label>
            <Input
              type="email"
              placeholder="marie@example.com"
              value={form.email ?? ''}
              onChange={(e) => set('email', e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-charcoal">Mot de passe</label>
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
          <p className="text-center text-sm text-charcoal/50">
            Déjà un compte ?{' '}
            <Link href="/compte/connexion" className="text-terracotta-dark hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      )}
    </div>
  )
}
