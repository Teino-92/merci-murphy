'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Profile, Visit } from '@/lib/supabase-admin'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const SERVICE_LABELS: Record<string, string> = {
  toilettage: 'Toilettage',
  bains: 'Bains',
  creche: 'Crèche',
  education: 'Éducation',
  osteo: 'Ostéo',
  autre: 'Autre',
}

export function CustomerDetail({ profile, visits }: { profile: Profile; visits: Visit[] }) {
  const router = useRouter()
  const [notes, setNotes] = useState(profile.notes ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Add visit state
  const [showVisitForm, setShowVisitForm] = useState(false)
  const [visitService, setVisitService] = useState('toilettage')
  const [visitDate, setVisitDate] = useState(new Date().toISOString().slice(0, 10))
  const [visitNotes, setVisitNotes] = useState('')
  const [visitStaff, setVisitStaff] = useState('')
  const [addingVisit, setAddingVisit] = useState(false)

  async function saveNotes() {
    setSaving(true)
    await fetch(`/api/dashboard/customers/${profile.id}/notes`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function addVisit() {
    setAddingVisit(true)
    await fetch(`/api/dashboard/customers/${profile.id}/visits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service: visitService,
        date: visitDate,
        notes: visitNotes,
        staff: visitStaff,
      }),
    })
    setAddingVisit(false)
    setShowVisitForm(false)
    setVisitNotes('')
    setVisitStaff('')
    router.refresh()
  }

  return (
    <div>
      <Link
        href="/dashboard/customers"
        className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-[#1D164E] mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> Clients
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: profile info */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h1 className="text-xl font-bold text-[#1D164E]">{profile.nom}</h1>
            <p className="text-sm text-gray-400 mt-0.5">{profile.telephone}</p>

            {profile.nom_chien && (
              <div className="mt-5 pt-5 border-t border-gray-100">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
                  Chien
                </p>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="text-gray-400">Nom :</span>{' '}
                    <span className="font-medium text-[#1D164E]">{profile.nom_chien}</span>
                  </p>
                  {profile.race_chien && (
                    <p>
                      <span className="text-gray-400">Race :</span> {profile.race_chien}
                    </p>
                  )}
                  {profile.poids_chien && (
                    <p>
                      <span className="text-gray-400">Poids :</span> {profile.poids_chien}
                    </p>
                  )}
                  {profile.etat_poil && (
                    <p>
                      <span className="text-gray-400">Poil :</span> {profile.etat_poil}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
              Notes internes
            </p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={5}
              placeholder="Comportement, préférences, allergies…"
              className="w-full text-sm rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1D164E] resize-none"
            />
            <button
              onClick={saveNotes}
              disabled={saving}
              className="mt-2 w-full bg-[#1D164E] text-white rounded-lg py-2 text-sm font-medium hover:bg-[#1D164E]/90 disabled:opacity-50 transition-colors"
            >
              {saved ? 'Sauvegardé ✓' : saving ? 'Sauvegarde…' : 'Sauvegarder'}
            </button>
          </div>
        </div>

        {/* Right: visit history */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                Historique des visites
              </p>
              <button
                onClick={() => setShowVisitForm(!showVisitForm)}
                className="text-xs font-medium text-[#1D164E] border border-[#1D164E] px-3 py-1.5 rounded-lg hover:bg-[#1D164E] hover:text-white transition-colors"
              >
                + Ajouter
              </button>
            </div>

            {showVisitForm && (
              <div className="mb-6 p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Service</label>
                    <select
                      value={visitService}
                      onChange={(e) => setVisitService(e.target.value)}
                      className="w-full text-sm rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1D164E]"
                    >
                      {Object.entries(SERVICE_LABELS).map(([v, l]) => (
                        <option key={v} value={v}>
                          {l}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
                    <input
                      type="date"
                      value={visitDate}
                      onChange={(e) => setVisitDate(e.target.value)}
                      className="w-full text-sm rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1D164E]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Staff</label>
                  <input
                    type="text"
                    value={visitStaff}
                    onChange={(e) => setVisitStaff(e.target.value)}
                    placeholder="Prénom du toiletteur / responsable"
                    className="w-full text-sm rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1D164E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Notes</label>
                  <textarea
                    value={visitNotes}
                    onChange={(e) => setVisitNotes(e.target.value)}
                    rows={2}
                    placeholder="Observations de la visite…"
                    className="w-full text-sm rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1D164E] resize-none"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={addVisit}
                    disabled={addingVisit}
                    className="flex-1 bg-[#1D164E] text-white rounded-lg py-2 text-sm font-medium hover:bg-[#1D164E]/90 disabled:opacity-50 transition-colors"
                  >
                    {addingVisit ? 'Ajout…' : 'Ajouter la visite'}
                  </button>
                  <button
                    onClick={() => setShowVisitForm(false)}
                    className="px-4 rounded-lg border border-gray-200 text-sm text-gray-500 hover:bg-gray-100 transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}

            {visits.length === 0 ? (
              <p className="text-sm text-gray-400">Aucune visite enregistrée.</p>
            ) : (
              <div className="space-y-3">
                {visits.map((v) => (
                  <div key={v.id} className="flex gap-4 p-4 rounded-xl bg-gray-50">
                    <div className="shrink-0 text-center">
                      <p className="text-xs font-bold text-[#1D164E]">
                        {new Date(v.date).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                        })}
                      </p>
                      <p className="text-xs text-gray-400">{new Date(v.date).getFullYear()}</p>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-[#1D164E]">
                          {SERVICE_LABELS[v.service] ?? v.service}
                        </span>
                        {v.staff && <span className="text-xs text-gray-400">· {v.staff}</span>}
                      </div>
                      {v.notes && <p className="text-xs text-gray-500 mt-1">{v.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
