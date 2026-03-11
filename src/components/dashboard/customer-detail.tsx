'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Profile, Visit } from '@/lib/supabase-admin'
import { ArrowLeft, Pencil, Trash2, X } from 'lucide-react'
import Link from 'next/link'

const SERVICE_LABELS: Record<string, string> = {
  toilettage: 'Toilettage',
  bains: 'Bains',
  creche: 'Crèche',
  education: 'Éducation',
  osteo: 'Ostéo',
  autre: 'Autre',
}

export function CustomerDetail({
  profile: initial,
  visits: initialVisits,
}: {
  profile: Profile
  visits: Visit[]
}) {
  const router = useRouter()
  const [profile, setProfile] = useState(initial)
  const [visits, setVisits] = useState(initialVisits)
  const [notes, setNotes] = useState(initial.notes ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Edit profile state
  const [togglingBook, setTogglingBook] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editData, setEditData] = useState({
    nom: initial.nom,
    telephone: initial.telephone,
    nom_chien: initial.nom_chien ?? '',
    race_chien: initial.race_chien ?? '',
    poids_chien: initial.poids_chien ?? '',
    etat_poil: initial.etat_poil ?? '',
  })
  const [editSaving, setEditSaving] = useState(false)

  // Add visit state
  const [showVisitForm, setShowVisitForm] = useState(false)
  const [visitService, setVisitService] = useState('toilettage')
  const [visitDate, setVisitDate] = useState(new Date().toISOString().slice(0, 10))
  const [visitNotes, setVisitNotes] = useState('')
  const [visitStaff, setVisitStaff] = useState('')
  const [addingVisit, setAddingVisit] = useState(false)

  async function toggleCanBook() {
    setTogglingBook(true)
    const next = !profile.can_book
    await fetch(`/api/dashboard/customers/${profile.id}/profile`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ can_book: next }),
    })
    setProfile((p) => ({ ...p, can_book: next }))
    setTogglingBook(false)
  }

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

  async function saveProfile() {
    setEditSaving(true)
    await fetch(`/api/dashboard/customers/${profile.id}/profile`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editData),
    })
    setProfile((p) => ({ ...p, ...editData }))
    setEditSaving(false)
    setEditing(false)
  }

  async function deleteCustomer() {
    if (!confirm('Supprimer définitivement ce client ?')) return
    setDeleting(true)
    await fetch(`/api/dashboard/customers/${profile.id}/profile`, { method: 'DELETE' })
    router.push('/dashboard/customers')
    router.refresh()
  }

  async function addVisit() {
    setAddingVisit(true)
    const res = await fetch(`/api/dashboard/customers/${profile.id}/visits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service: visitService,
        date: visitDate,
        notes: visitNotes,
        staff: visitStaff,
      }),
    })
    const newVisit = await res.json()
    setVisits((v) => [newVisit, ...v])
    setAddingVisit(false)
    setShowVisitForm(false)
    setVisitNotes('')
    setVisitStaff('')
  }

  async function deleteVisit(visitId: string) {
    if (!confirm('Supprimer cette visite ?')) return
    await fetch(`/api/dashboard/customers/${profile.id}/visits/${visitId}`, { method: 'DELETE' })
    setVisits((v) => v.filter((x) => x.id !== visitId))
  }

  const inputCls =
    'w-full text-sm rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1D164E]'

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
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-xl font-bold text-[#1D164E]">{profile.nom}</h1>
                <p className="text-sm text-gray-400 mt-0.5">{profile.telephone}</p>
              </div>
              <button
                onClick={() => setEditing((e) => !e)}
                className="text-gray-400 hover:text-[#1D164E] transition-colors"
              >
                {editing ? <X className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
              </button>
            </div>

            {/* can_book toggle */}
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#1D164E]">Autoriser les réservations</p>
                <p className="text-xs text-gray-400">
                  {profile.can_book ? 'Ce client peut réserver en ligne' : 'Réservation désactivée'}
                </p>
              </div>
              <button
                onClick={toggleCanBook}
                disabled={togglingBook}
                className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-50 ${
                  profile.can_book ? 'bg-[#1D164E]' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 mt-0.5 ${
                    profile.can_book ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {editing ? (
              <div className="mt-5 pt-5 border-t border-gray-100 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Nom</label>
                  <input
                    className={inputCls}
                    value={editData.nom}
                    onChange={(e) => setEditData((d) => ({ ...d, nom: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Téléphone</label>
                  <input
                    className={inputCls}
                    value={editData.telephone}
                    onChange={(e) => setEditData((d) => ({ ...d, telephone: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Nom du chien
                  </label>
                  <input
                    className={inputCls}
                    value={editData.nom_chien}
                    onChange={(e) => setEditData((d) => ({ ...d, nom_chien: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Race</label>
                  <input
                    className={inputCls}
                    value={editData.race_chien}
                    onChange={(e) => setEditData((d) => ({ ...d, race_chien: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Poids</label>
                  <input
                    className={inputCls}
                    value={editData.poids_chien}
                    onChange={(e) => setEditData((d) => ({ ...d, poids_chien: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    État du poil
                  </label>
                  <input
                    className={inputCls}
                    value={editData.etat_poil}
                    onChange={(e) => setEditData((d) => ({ ...d, etat_poil: e.target.value }))}
                  />
                </div>
                <button
                  onClick={saveProfile}
                  disabled={editSaving}
                  className="w-full bg-[#1D164E] text-white rounded-lg py-2 text-sm font-medium hover:bg-[#1D164E]/90 disabled:opacity-50 transition-colors"
                >
                  {editSaving ? 'Sauvegarde…' : 'Sauvegarder'}
                </button>
              </div>
            ) : (
              profile.nom_chien && (
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
              )
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

          {/* Delete */}
          <button
            onClick={deleteCustomer}
            disabled={deleting}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-red-200 text-red-400 hover:bg-red-50 hover:text-red-600 py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            {deleting ? 'Suppression…' : 'Supprimer ce client'}
          </button>
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
                      className={inputCls}
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
                    placeholder="Prénom du toiletteur / responsable"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Notes</label>
                  <textarea
                    value={visitNotes}
                    onChange={(e) => setVisitNotes(e.target.value)}
                    rows={2}
                    placeholder="Observations de la visite…"
                    className={`${inputCls} resize-none`}
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
                  <div key={v.id} className="flex gap-4 p-4 rounded-xl bg-gray-50 group">
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
                    <button
                      onClick={() => deleteVisit(v.id)}
                      className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
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
