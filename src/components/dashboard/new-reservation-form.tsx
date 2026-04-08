'use client'

import { useState, useRef } from 'react'
import Cal from '@calcom/embed-react'
import { Search, X, Check } from 'lucide-react'
import { POIDS, ETAT_POIL } from '@/lib/dog-constants'
import { useRouter } from 'next/navigation'
import type { Profile } from '@/lib/supabase-admin'
import type { ServiceOption } from '@/app/(dashboard)/dashboard/reservations/new/page'

interface NewReservationFormProps {
  services: ServiceOption[]
}

export function NewReservationForm({ services }: NewReservationFormProps) {
  const router = useRouter()
  const inputCls =
    'w-full text-sm rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1D164E]'

  // Client selection
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Profile[]>([])
  const [searching, setSearching] = useState(false)
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null)
  const [showNewForm, setShowNewForm] = useState(false)
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  // New client form
  const [newClient, setNewClient] = useState({
    email: '',
    nom: '',
    telephone: '',
    nom_chien: '',
    race_chien: '',
    age_chien: '',
    poids_chien: '',
    etat_poil: '',
    grooming_duration: '',
    notes: '',
  })
  const [creatingClient, setCreatingClient] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  // Service selection
  const [selectedService, setSelectedService] = useState(() => services[0]?.slug ?? '')

  // Manual form state
  const [visitDate, setVisitDate] = useState(new Date().toISOString().slice(0, 10))
  const [visitTime, setVisitTime] = useState('')
  const [visitDuration, setVisitDuration] = useState(60)
  const [visitPrice, setVisitPrice] = useState('')
  const [visitStaff, setVisitStaff] = useState('')
  const [visitNotes, setVisitNotes] = useState('')
  const [savingVisit, setSavingVisit] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Derived
  const currentService = services.find((s) => s.slug === selectedService)
  const isCalService = currentService?.calLink != null
  const isToilettage = selectedService.includes('toilettage')
  const toilettageMissingDuration = isToilettage && !selectedProfile?.grooming_duration

  function handleSearchChange(q: string) {
    setSearchQuery(q)
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    if (q.length < 2) {
      setSearchResults([])
      return
    }
    searchTimeout.current = setTimeout(async () => {
      setSearching(true)
      const res = await fetch(`/api/dashboard/customers/search?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setSearchResults(data)
      setSearching(false)
    }, 300)
  }

  function selectProfile(p: Profile) {
    setSelectedProfile(p)
    setSearchQuery('')
    setSearchResults([])
    setShowNewForm(false)
  }

  async function handleCreateClient() {
    setCreatingClient(true)
    setCreateError(null)
    const res = await fetch('/api/dashboard/customers/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...newClient,
        grooming_duration: newClient.grooming_duration ? Number(newClient.grooming_duration) : null,
      }),
    })
    const data = await res.json()
    if (!res.ok) {
      setCreateError(data.error ?? 'Erreur inconnue')
      setCreatingClient(false)
      return
    }
    setSelectedProfile(data)
    setShowNewForm(false)
    setCreatingClient(false)
  }

  async function saveManualVisit() {
    if (!selectedProfile) return
    setSavingVisit(true)
    setSaveError(null)
    const res = await fetch(`/api/dashboard/customers/${selectedProfile.id}/visits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service: selectedService,
        date: visitDate,
        time: visitTime || null,
        duration: visitDuration,
        notes: visitNotes || null,
        staff: visitStaff || null,
        price: visitPrice ? Number(visitPrice) : null,
      }),
    })
    setSavingVisit(false)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setSaveError(data.error ?? `Erreur ${res.status}`)
      return
    }
    router.push(`/dashboard/customers/${selectedProfile.id}`)
    router.refresh()
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-xl font-bold text-[#1D164E]">Nouvelle réservation</h1>

      {/* Step 1: Client */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
          1. Client
        </p>

        {selectedProfile ? (
          <div className="flex items-start justify-between p-4 rounded-xl bg-gray-50 border border-gray-200">
            <div>
              <p className="font-semibold text-[#1D164E]">{selectedProfile.nom}</p>
              <p className="text-sm text-gray-500">{selectedProfile.telephone}</p>
              {selectedProfile.nom_chien && (
                <p className="text-sm text-gray-500 mt-1">
                  🐶 {selectedProfile.nom_chien}
                  {selectedProfile.grooming_duration && (
                    <span className="ml-2 text-terracotta-dark font-medium">
                      · {selectedProfile.grooming_duration} min toilettage
                    </span>
                  )}
                </p>
              )}
            </div>
            <button
              onClick={() => setSelectedProfile(null)}
              className="text-gray-400 hover:text-red-400 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <>
            {!showNewForm && (
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Rechercher par nom ou téléphone…"
                  className="w-full text-sm rounded-lg border border-gray-200 pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1D164E]"
                />
                {searching && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                    …
                  </span>
                )}
              </div>
            )}

            {searchResults.length > 0 && !showNewForm && (
              <div className="border border-gray-200 rounded-xl overflow-hidden mb-3">
                {searchResults.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => selectProfile(p)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                  >
                    <p className="text-sm font-medium text-[#1D164E]">{p.nom}</p>
                    <p className="text-xs text-gray-400">
                      {p.telephone}
                      {p.nom_chien ? ` · 🐶 ${p.nom_chien}` : ''}
                    </p>
                  </button>
                ))}
              </div>
            )}

            {!showNewForm ? (
              <button
                onClick={() => setShowNewForm(true)}
                className="text-sm font-medium text-[#1D164E] underline underline-offset-2"
              >
                + Nouveau client
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-[#1D164E]">Nouveau client</p>
                {[
                  { key: 'nom', label: 'Nom', required: true, type: 'text' },
                  { key: 'email', label: 'Email', required: true, type: 'email' },
                  { key: 'telephone', label: 'Téléphone', required: true, type: 'tel' },
                  { key: 'nom_chien', label: 'Nom du chien', required: true, type: 'text' },
                  { key: 'race_chien', label: 'Race', required: false, type: 'text' },
                  { key: 'age_chien', label: 'Âge', required: false, type: 'text' },
                ].map(({ key, label, required, type }) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      {label}
                      {required && <span className="text-red-400 ml-0.5">*</span>}
                    </label>
                    <input
                      type={type}
                      className={inputCls}
                      value={newClient[key as keyof typeof newClient]}
                      onChange={(e) => setNewClient((d) => ({ ...d, [key]: e.target.value }))}
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Poids</label>
                  <select
                    className={inputCls}
                    value={newClient.poids_chien}
                    onChange={(e) => setNewClient((d) => ({ ...d, poids_chien: e.target.value }))}
                  >
                    <option value="">—</option>
                    {POIDS.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    État du poil
                  </label>
                  <select
                    className={inputCls}
                    value={newClient.etat_poil}
                    onChange={(e) => setNewClient((d) => ({ ...d, etat_poil: e.target.value }))}
                  >
                    <option value="">—</option>
                    {ETAT_POIL.map((e) => (
                      <option key={e.value} value={e.value}>
                        {e.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Durée toilettage (min)
                  </label>
                  <input
                    type="number"
                    min="15"
                    step="15"
                    className={inputCls}
                    placeholder="Ex: 90"
                    value={newClient.grooming_duration}
                    onChange={(e) =>
                      setNewClient((d) => ({ ...d, grooming_duration: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Notes internes
                  </label>
                  <textarea
                    rows={2}
                    className={`${inputCls} resize-none`}
                    value={newClient.notes}
                    onChange={(e) => setNewClient((d) => ({ ...d, notes: e.target.value }))}
                  />
                </div>
                {createError && <p className="text-sm text-red-500">{createError}</p>}
                <div className="flex gap-2">
                  <button
                    onClick={handleCreateClient}
                    disabled={
                      creatingClient ||
                      !newClient.nom ||
                      !newClient.email ||
                      !newClient.telephone ||
                      !newClient.nom_chien
                    }
                    className="flex-1 bg-[#1D164E] text-white rounded-lg py-2 text-sm font-medium hover:bg-[#1D164E]/90 disabled:opacity-50 transition-colors"
                  >
                    {creatingClient ? 'Création…' : 'Créer le client'}
                  </button>
                  <button
                    onClick={() => setShowNewForm(false)}
                    className="px-4 rounded-lg border border-gray-200 text-sm text-gray-500 hover:bg-gray-100 transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Step 2: Service */}
      {selectedProfile && (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
            2. Service
          </p>
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className={inputCls}
          >
            <optgroup label="Réservation en ligne (cal.com)">
              {services
                .filter((s) => s.calLink)
                .map((s) => (
                  <option key={s.slug} value={s.slug}>
                    {s.title}
                  </option>
                ))}
            </optgroup>
            <optgroup label="Rendez-vous manuel">
              {services
                .filter((s) => !s.calLink)
                .map((s) => (
                  <option key={s.slug} value={s.slug}>
                    {s.title}
                  </option>
                ))}
            </optgroup>
          </select>

          {isCalService && toilettageMissingDuration && (
            <p className="mt-3 text-sm text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
              ⚠️ La durée de toilettage n&apos;est pas définie pour ce client. Veuillez la
              renseigner sur{' '}
              <a
                href={`/dashboard/customers/${selectedProfile.id}`}
                className="underline font-medium"
              >
                le profil client
              </a>{' '}
              avant de réserver.
            </p>
          )}
        </div>
      )}

      {/* Step 3a: Cal.com embed */}
      {selectedProfile && isCalService && !toilettageMissingDuration && currentService?.calLink && (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
            3. Réservation
          </p>
          <div
            className="overflow-y-auto rounded-xl border border-gray-100"
            style={{ height: '600px' }}
          >
            <Cal
              calLink={currentService.calLink}
              calOrigin="https://cal.eu"
              config={{
                name: selectedProfile.nom,
                notes: 'source=dashboard',
                ...(isToilettage && selectedProfile.grooming_duration
                  ? { duration: String(selectedProfile.grooming_duration) }
                  : {}),
              }}
              style={{ width: '100%', height: '100%', border: 'none' }}
            />
          </div>
          <p className="mt-4 text-xs text-gray-400 text-center">
            La visite sera enregistrée automatiquement une fois la réservation confirmée.
          </p>
        </div>
      )}

      {/* Step 3b: Manual form */}
      {selectedProfile && !isCalService && (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
            3. Détails du rendez-vous
          </p>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
                <input
                  type="date"
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Heure</label>
                <input
                  type="time"
                  value={visitTime}
                  onChange={(e) => setVisitTime(e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Durée (min)</label>
                <input
                  type="number"
                  min="15"
                  step="15"
                  value={visitDuration}
                  onChange={(e) => setVisitDuration(Number(e.target.value))}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Prix (€)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={visitPrice}
                  onChange={(e) => setVisitPrice(e.target.value)}
                  placeholder="Ex: 75.00"
                  className={inputCls}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Staff</label>
              <input
                type="text"
                value={visitStaff}
                onChange={(e) => setVisitStaff(e.target.value)}
                placeholder="Prénom du praticien"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Notes</label>
              <textarea
                rows={2}
                value={visitNotes}
                onChange={(e) => setVisitNotes(e.target.value)}
                placeholder="Observations…"
                className={`${inputCls} resize-none`}
              />
            </div>
            {saveError && (
              <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{saveError}</p>
            )}
            <button
              onClick={saveManualVisit}
              disabled={savingVisit || !visitDate}
              className="w-full flex items-center justify-center gap-2 bg-[#1D164E] text-white rounded-lg py-2.5 text-sm font-medium hover:bg-[#1D164E]/90 disabled:opacity-50 transition-colors"
            >
              <Check className="h-4 w-4" />
              {savingVisit ? 'Enregistrement…' : 'Enregistrer la visite'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
