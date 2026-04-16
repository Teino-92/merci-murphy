'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { BreedCombobox } from '@/components/ui/breed-combobox'
import { signUp, type SignUpData } from '@/lib/auth-actions'
import { COUNTRY_PREFIXES } from '@/lib/phone-prefixes'
import { POIDS, ETAT_POIL } from '@/lib/dog-constants'
import { createSupabaseBrowserClient } from '@/lib/supabase'
import { CheckCircle } from 'lucide-react'

const STEPS = ['Vos coordonnées', 'Votre compte', 'Votre chien']

export function SignUpForm() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const [form, setForm] = useState<Partial<SignUpData>>({})
  const [newsletter, setNewsletter] = useState(false)
  const [prefix, setPrefix] = useState(COUNTRY_PREFIXES[0])
  const [phoneLocal, setPhoneLocal] = useState('')

  const set = (key: keyof SignUpData, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  function handlePhoneChange(raw: string) {
    setPhoneLocal(raw)
    set('telephone', `${prefix.code} ${raw}`)
  }

  function handlePrefixChange(code: string) {
    const next = COUNTRY_PREFIXES.find((c) => c.code === code) ?? COUNTRY_PREFIXES[0]
    setPrefix(next)
    setPhoneLocal('')
    set('telephone', '')
  }

  const phoneComplete = phoneLocal.replace(/\D/g, '').length >= 6
  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1))
  const prev = () => setStep((s) => Math.max(s - 1, 0))

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    const result = await signUp({ ...(form as SignUpData), newsletter_subscribed: newsletter })
    if (!result.success) {
      setLoading(false)
      setError(result.error ?? 'Une erreur est survenue.')
      return
    }
    // Auto sign-in then redirect
    const supabase = createSupabaseBrowserClient()
    await supabase.auth.signInWithPassword({
      email: form.email!,
      password: form.password!,
    })
    setDone(true)
    router.push('/compte')
  }

  if (done) {
    return (
      <div className="flex flex-col items-center py-12 text-center">
        <CheckCircle className="h-16 w-16 text-rose" />
        <h2 className="mt-6 font-display text-2xl font-bold text-charcoal">
          Bienvenue chez merci murphy® !
        </h2>
        <p className="mt-3 text-charcoal/60 max-w-sm">Redirection vers votre espace…</p>
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

      {/* Step 0 — Coordonnées */}
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
            <div className="flex gap-2">
              <select
                value={prefix.code}
                onChange={(e) => handlePrefixChange(e.target.value)}
                className="text-sm rounded-lg border border-charcoal/20 px-2 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-terracotta-dark shrink-0 max-w-[130px]"
              >
                {COUNTRY_PREFIXES.map((c) => (
                  <option key={`${c.code}-${c.label}`} value={c.code}>
                    {c.flag} {c.code} {c.label}
                  </option>
                ))}
              </select>
              <Input
                type="tel"
                placeholder={prefix.placeholder}
                value={phoneLocal}
                onChange={(e) => handlePhoneChange(e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
          <Button
            onClick={next}
            disabled={!form.prenom || !form.nom || !phoneComplete}
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
          <div className="flex gap-3">
            <Button variant="outline" onClick={prev} className="flex-1">
              Retour
            </Button>
            <Button
              onClick={next}
              disabled={!form.email || !form.password}
              className="flex-1 bg-terracotta-dark text-white hover:bg-terracotta/90"
            >
              Continuer
            </Button>
          </div>
        </div>
      )}

      {/* Step 2 — Chien */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-charcoal">
              Prénom du chien *
            </label>
            <Input
              placeholder="Ex: Rocky, Bella…"
              value={form.dog_name ?? ''}
              onChange={(e) => set('dog_name', e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-charcoal">Race</label>
            <BreedCombobox value={form.dog_breed ?? ''} onChange={(v) => set('dog_breed', v)} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-charcoal">Âge</label>
            <Select value={form.dog_age ?? ''} onValueChange={(v) => set('dog_age', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Âge" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3-5-mois">3 à 5 mois</SelectItem>
                <SelectItem value="6-mois-1-an">6 mois à 1 an</SelectItem>
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
            <Select value={form.dog_poids ?? ''} onValueChange={(v) => set('dog_poids', v)}>
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
            <Select value={form.dog_etat_poil ?? ''} onValueChange={(v) => set('dog_etat_poil', v)}>
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
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex gap-3">
            <Button variant="outline" onClick={prev} className="flex-1">
              Retour
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading || !form.dog_name}
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
