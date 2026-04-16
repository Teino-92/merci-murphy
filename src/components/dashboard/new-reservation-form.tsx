'use client'

import { useState, useRef, useEffect } from 'react'
import { Search, X, Check } from 'lucide-react'
import { POIDS, ETAT_POIL } from '@/lib/dog-constants'
import { BreedCombobox } from '@/components/ui/breed-combobox'
import { useRouter } from 'next/navigation'
import type { Profile } from '@/lib/supabase-admin'
import type { ServiceOption } from '@/app/(dashboard)/dashboard/reservations/new/page'

interface Dog {
  id: string
  name: string
  grooming_duration: number | null
}

interface ProfileWithDogs extends Profile {
  dog_names: string[]
  dogs: Dog[]
}

interface StaffMember {
  id: string
  name: string
  active: boolean
}

interface NewReservationFormProps {
  services: ServiceOption[]
}

export function NewReservationForm({ services }: NewReservationFormProps) {
  const router = useRouter()
  const inputCls =
    'w-full text-sm rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1D164E]'

  // Staff
  const [staffList, setStaffList] = useState<StaffMember[]>([])
  useEffect(() => {
    fetch('/api/dashboard/staff')
      .then((r) => r.json())
      .then((data) =>
        setStaffList(Array.isArray(data) ? data.filter((s: StaffMember) => s.active) : [])
      )
      .catch(() => {})
  }, [])

  // Client selection
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<ProfileWithDogs[]>([])
  const [searching, setSearching] = useState(false)
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null)
  const [profileDogs, setProfileDogs] = useState<Dog[]>([])
  const [selectedDogId, setSelectedDogId] = useState<string>('')
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

  // Service + visit
  const [selectedService, setSelectedService] = useState(() => services[0]?.slug ?? '')
  const [visitDate, setVisitDate] = useState(new Date().toISOString().slice(0, 10))
  const [visitTime, setVisitTime] = useState('')
  const [visitDuration, setVisitDuration] = useState(60)
  const [visitPrice, setVisitPrice] = useState('')
  const [visitStaff, setVisitStaff] = useState('')
  const [visitNotes, setVisitNotes] = useState('')
  const [savingVisit, setSavingVisit] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

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
      setSearchResults(Array.isArray(data) ? data : [])
      setSearching(false)
    }, 300)
  }

  function selectProfile(p: ProfileWithDogs) {
    setSelectedProfile(p)
    setProfileDogs(p.dogs ?? [])
    // Auto-select first dog if only one
    if (p.dogs?.length === 1) {
      setSelectedDogId(p.dogs[0].id)
      if (p.dogs[0].grooming_duration) setVisitDuration(p.dogs[0].grooming_duration)
    } else {
      setSelectedDogId('')
    }
    setSearchQuery('')
    setSearchResults([])
    setShowNewForm(false)
  }

  function handleDogChange(dogId: string) {
    setSelectedDogId(dogId)
    const dog = profileDogs.find((d) => d.id === dogId)
    if (dog?.grooming_duration) setVisitDuration(dog.grooming_duration)
  }

  async function handleCreateClient() {
    setCreatingClient(true)
    setCreateError(null)
    const hasRealEmail = !!newClient.email
    const res = await fetch('/api/dashboard/customers/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...newClient,
        email: newClient.email || `noemail+${Date.now()}@mercimurphy.internal`,
        grooming_duration: newClient.grooming_duration ? Number(newClient.grooming_duration) : null,
      }),
    })
    const data = await res.json()
    if (!res.ok) {
      setCreateError(data.error ?? 'Erreur inconnue')
      setCreatingClient(false)
      return
    }
    // Send password-setup invite if a real email was provided
    if (hasRealEmail && data.id) {
      await fetch(`/api/dashboard/customers/${data.id}/invite`, { method: 'POST' })
    }
    setSelectedProfile(data)
    setProfileDogs([])
    setSelectedDogId('')
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
          <div className="space-y-3">
            <div className="flex items-start justify-between p-4 rounded-xl bg-gray-50 border border-gray-200">
              <div>
                <p className="font-semibold text-[#1D164E]">{selectedProfile.nom}</p>
                <p className="text-sm text-gray-500">{selectedProfile.telephone}</p>
              </div>
              <button
                onClick={() => {
                  setSelectedProfile(null)
                  setProfileDogs([])
                  setSelectedDogId('')
                }}
                className="text-gray-400 hover:text-red-400 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {profileDogs.length > 1 && (
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Chien</label>
                <select
                  className={inputCls}
                  value={selectedDogId}
                  onChange={(e) => handleDogChange(e.target.value)}
                >
                  <option value="">— Choisir un chien</option>
                  {profileDogs.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                      {d.grooming_duration ? ` (${d.grooming_duration} min)` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {profileDogs.length === 1 && (
              <p className="text-xs text-gray-400">
                Chien : <span className="font-medium text-gray-600">{profileDogs[0].name}</span>
              </p>
            )}
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
                  placeholder="Rechercher par nom, téléphone ou chien…"
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
                      {p.dog_names.length > 0 && ` · ${p.dog_names.join(', ')}`}
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
                  { key: 'telephone', label: 'Téléphone', required: true, type: 'tel' },
                  { key: 'email', label: 'Email', required: false, type: 'email' },
                  { key: 'nom_chien', label: 'Nom du chien', required: true, type: 'text' },
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
                  <label className="block text-xs font-medium text-gray-500 mb-1">Race</label>
                  <BreedCombobox
                    value={newClient.race_chien}
                    onChange={(v) => setNewClient((d) => ({ ...d, race_chien: v }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Âge</label>
                  <select
                    className={inputCls}
                    value={newClient.age_chien}
                    onChange={(e) => setNewClient((d) => ({ ...d, age_chien: e.target.value }))}
                  >
                    <option value="">—</option>
                    <option value="3-5-mois">3 à 5 mois</option>
                    <option value="6-mois-1-an">6 mois à 1 an</option>
                    <option value="1-an">1 an</option>
                    <option value="2-ans">2 ans</option>
                    <option value="3-ans">3 ans</option>
                    <option value="4-ans">4 ans</option>
                    <option value="5-ans">5 ans</option>
                    <option value="6-ans">6 ans</option>
                    <option value="7-ans">7 ans</option>
                    <option value="8-ans">8 ans</option>
                    <option value="9-ans">9 ans</option>
                    <option value="10-ans">10 ans</option>
                    <option value="plus-de-10-ans">Plus de 10 ans</option>
                  </select>
                </div>
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
            {services.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Step 3: Détails */}
      {selectedProfile && (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
            3. Détails du rendez-vous
          </p>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Date *</label>
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
                  min="1"
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
              <select
                value={visitStaff}
                onChange={(e) => setVisitStaff(e.target.value)}
                className={inputCls}
              >
                <option value="">— Choisir</option>
                {staffList.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
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
