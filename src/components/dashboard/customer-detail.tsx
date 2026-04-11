'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { Profile, Visit } from '@/lib/supabase-admin'
import { ArrowLeft, Pencil, Trash2, X, Upload, Eye, Download } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { SERVICE_LABELS } from '@/lib/dog-constants'

interface ClientFile {
  name: string
  path: string
  url: string | null
  createdAt: string | null
}

export function CustomerDetail({
  profile: initial,
  visits: initialVisits,
  email,
  isAdmin,
}: {
  profile: Profile
  visits: Visit[]
  email: string | null
  isAdmin: boolean
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
    age_chien: initial.age_chien ?? '',
    poids_chien: initial.poids_chien ?? '',
    etat_poil: initial.etat_poil ?? '',
    grooming_duration: initial.grooming_duration ?? ('' as number | ''),
    numero_puce: initial.numero_puce ?? '',
  })
  const [editSaving, setEditSaving] = useState(false)

  // Deposit state — keyed by visit id
  const [depositPrices, setDepositPrices] = useState<Record<string, string>>({})
  const [depositSent, setDepositSent] = useState<Record<string, number>>({})
  const [confirmingDeposit, setConfirmingDeposit] = useState<Record<string, boolean>>({})

  // Add visit state
  const [showVisitForm, setShowVisitForm] = useState(false)
  const [visitService, setVisitService] = useState('toilettage')
  const [visitDate, setVisitDate] = useState(new Date().toISOString().slice(0, 10))
  const [visitNotes, setVisitNotes] = useState('')
  const [visitStaff, setVisitStaff] = useState('')
  const [visitPrice, setVisitPrice] = useState('')
  const [addingVisit, setAddingVisit] = useState(false)

  // Files state
  const [files, setFiles] = useState<ClientFile[]>([])
  const [filesLoading, setFilesLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewName, setPreviewName] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch(`/api/dashboard/customers/${profile.id}/files`)
      .then((r) => r.json())
      .then((data) => {
        setFiles(Array.isArray(data) ? data : [])
        setFilesLoading(false)
      })
      .catch(() => setFilesLoading(false))
  }, [profile.id])

  // Auto-cancel overdue pending_deposit visits on page load
  useEffect(() => {
    const now = Date.now()
    visits.forEach((v) => {
      if (v.status !== 'pending_deposit' || !v.created_at) return
      const appointmentMs = new Date(`${v.date}T${v.time?.slice(0, 5) ?? '09:00'}Z`).getTime()
      const createdMs = new Date(v.created_at).getTime()
      const hoursUntilAppt = (appointmentMs - createdMs) / 3600000
      const deadlineHours = hoursUntilAppt >= 24 ? 24 : 12
      const deadlineMs = createdMs + deadlineHours * 3600000
      if (now > deadlineMs) {
        fetch(`/api/dashboard/visits/${v.id}/cancel`, { method: 'POST' }).then(() => {
          setVisits((prev) =>
            prev.map((x) => (x.id === v.id ? { ...x, status: 'cancelled' as const } : x))
          )
        })
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
    setProfile((p) => ({
      ...p,
      ...editData,
      grooming_duration: editData.grooming_duration === '' ? null : editData.grooming_duration,
      numero_puce: editData.numero_puce || null,
    }))
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
        price: visitPrice,
      }),
    })
    const newVisit = await res.json()
    setVisits((v) => [newVisit, ...v])
    setAddingVisit(false)
    setShowVisitForm(false)
    setVisitNotes('')
    setVisitStaff('')
    setVisitPrice('')
  }

  async function confirmDeposit(visitId: string) {
    setConfirmingDeposit((s) => ({ ...s, [visitId]: true }))
    await fetch(`/api/dashboard/visits/${visitId}/confirm-deposit`, { method: 'POST' })
    setVisits((prev) =>
      prev.map((v) => (v.id === visitId ? { ...v, status: 'confirmed' as const } : v))
    )
    setConfirmingDeposit((s) => ({ ...s, [visitId]: false }))
  }

  async function deleteVisit(visitId: string) {
    if (!confirm('Supprimer cette visite ?')) return
    await fetch(`/api/dashboard/customers/${profile.id}/visits/${visitId}`, { method: 'DELETE' })
    setVisits((v) => v.filter((x) => x.id !== visitId))
  }

  async function copyDepositEmail(visit: (typeof visits)[0]) {
    const finalPrice = depositPrices[visit.id]
    if (!finalPrice || isNaN(Number(finalPrice)) || Number(finalPrice) <= 0) return
    const deposit = Number(finalPrice)

    const startDate = new Date(`${visit.date}T${visit.time?.slice(0, 5) ?? '00:00'}Z`)
    const appointmentDate = startDate.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      ...(visit.time ? { hour: '2-digit', minute: '2-digit' } : {}),
      timeZone: 'Europe/Paris',
    })

    const dogName = profile.nom_chien ?? 'votre chien'
    const serviceName = SERVICE_LABELS[visit.service] ?? visit.service

    const text = `Bonjour,

Nous vous rappelons le rendez-vous de ${dogName} ${appointmentDate} chez merci murphy pour son ${serviceName.toLowerCase()}.
Afin de valider définitivement votre créneau, merci de bien vouloir procéder au paiement d'un acompte de ${deposit}€ via le lien ci-dessous.

[LIEN SUMUP]

En effet en raison d'un grand nombre de non présentations, nous sommes contraints de procéder ainsi pour gérer au mieux le planning.

Merci de votre compréhension.

Nous vous souhaitons une bonne journée,
L'équipe merci murphy`

    await navigator.clipboard.writeText(text)
    setDepositSent((s) => ({ ...s, [visit.id]: deposit }))
  }

  async function uploadFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch(`/api/dashboard/customers/${profile.id}/files`, {
      method: 'POST',
      body: fd,
    })
    const uploaded: ClientFile = await res.json()
    setFiles((f) => [uploaded, ...f])
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function deleteFile(name: string) {
    if (!confirm('Supprimer ce fichier ?')) return
    await fetch(`/api/dashboard/customers/${profile.id}/files`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    setFiles((f) => f.filter((x) => x.name !== name))
  }

  function isImage(name: string) {
    return /\.(jpg|jpeg|png|gif|webp|avif|heic)$/i.test(name)
  }

  const inputCls =
    'w-full text-sm rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1D164E]'

  return (
    <div>
      {/* File preview lightbox */}
      {previewUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setPreviewUrl(null)}
        >
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white"
            onClick={() => setPreviewUrl(null)}
          >
            <X className="h-6 w-6" />
          </button>
          <div
            className="max-w-4xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {previewName && isImage(previewName) ? (
              <div className="relative w-full" style={{ minHeight: '60vh' }}>
                <Image
                  src={previewUrl}
                  alt={previewName}
                  fill
                  className="object-contain rounded-xl"
                  unoptimized
                />
              </div>
            ) : (
              <iframe
                src={previewUrl}
                className="w-full h-[80vh] rounded-xl bg-white"
                title={previewName ?? 'Fichier'}
              />
            )}
          </div>
        </div>
      )}

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
                {email && <p className="text-sm text-gray-400 mt-0.5">{email}</p>}
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
                  <label className="block text-xs font-medium text-gray-500 mb-1">Âge</label>
                  <input
                    className={inputCls}
                    value={editData.age_chien}
                    placeholder="Ex: 3 ans"
                    onChange={(e) => setEditData((d) => ({ ...d, age_chien: e.target.value }))}
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
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    N° de puce électronique
                  </label>
                  <input
                    className={inputCls}
                    value={editData.numero_puce}
                    placeholder="15 chiffres"
                    onChange={(e) => setEditData((d) => ({ ...d, numero_puce: e.target.value }))}
                  />
                </div>
                {editData.nom_chien && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Durée toilettage (min)
                    </label>
                    <input
                      type="number"
                      min="15"
                      step="15"
                      placeholder="Ex: 90"
                      className={inputCls}
                      value={editData.grooming_duration}
                      onChange={(e) =>
                        setEditData((d) => ({
                          ...d,
                          grooming_duration: e.target.value === '' ? '' : Number(e.target.value),
                        }))
                      }
                    />
                  </div>
                )}
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
                    {profile.age_chien && (
                      <p>
                        <span className="text-gray-400">Âge :</span> {profile.age_chien}
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
                    {profile.numero_puce && (
                      <p>
                        <span className="text-gray-400">N° puce :</span>{' '}
                        <span className="font-mono text-xs">{profile.numero_puce}</span>
                      </p>
                    )}
                    {profile.grooming_duration && (
                      <p>
                        <span className="text-gray-400">Durée séance :</span>{' '}
                        <span className="font-medium text-[#1D164E]">
                          {profile.grooming_duration} min
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              )
            )}
          </div>

          {/* Files */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
              Documents
            </p>

            {filesLoading ? (
              <p className="text-sm text-gray-400">Chargement…</p>
            ) : files.length === 0 ? (
              <p className="text-sm text-gray-400 mb-3">Aucun document.</p>
            ) : (
              <ul className="space-y-2 mb-3">
                {files.map((f) => (
                  <li key={f.name} className="flex items-center gap-2 group">
                    <span className="flex-1 text-xs text-[#1D164E] truncate" title={f.name}>
                      {f.name.replace(/^\d+-/, '')}
                    </span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {f.url && (
                        <>
                          <button
                            onClick={() => {
                              setPreviewUrl(f.url)
                              setPreviewName(f.name)
                            }}
                            className="text-gray-400 hover:text-[#1D164E] transition-colors"
                            title="Prévisualiser"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <a
                            href={f.url}
                            download={f.name}
                            className="text-gray-400 hover:text-[#1D164E] transition-colors"
                            title="Télécharger"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </a>
                        </>
                      )}
                      <button
                        onClick={() => deleteFile(f.name)}
                        className="text-gray-300 hover:text-red-400 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={uploadFile}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full flex items-center justify-center gap-2 border border-dashed border-gray-300 text-gray-400 hover:border-[#1D164E] hover:text-[#1D164E] rounded-lg py-2.5 text-sm transition-colors disabled:opacity-50"
            >
              <Upload className="h-4 w-4" />
              {uploading ? 'Envoi…' : 'Ajouter un fichier'}
            </button>
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

          {/* Delete — admin only */}
          {isAdmin && (
            <button
              onClick={deleteCustomer}
              disabled={deleting}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-red-200 text-red-400 hover:bg-red-50 hover:text-red-600 py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              {deleting ? 'Suppression…' : 'Supprimer ce client'}
            </button>
          )}
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
              (() => {
                const today = new Date().toISOString().slice(0, 10)
                const upcoming = visits.filter((v) => v.date >= today && v.status !== 'cancelled')
                const past = visits.filter((v) => v.date < today || v.status === 'cancelled')

                const renderVisit = (v: (typeof visits)[0]) => (
                  <div key={v.id} className="rounded-xl bg-gray-50 overflow-hidden group">
                    <div className="flex gap-4 p-4">
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
                          {v.status === 'cancelled' && (
                            <span className="ml-auto text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                              Annulé
                            </span>
                          )}
                          {v.status === 'pending_deposit' && (
                            <span className="ml-auto text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                              Acompte en attente
                            </span>
                          )}
                          {v.status === 'confirmed' && v.final_price != null && (
                            <span className="ml-auto text-sm font-semibold text-[#1D164E]">
                              {v.final_price.toFixed(2)} €
                            </span>
                          )}
                          {v.status === 'confirmed' && v.price != null && v.final_price == null && (
                            <span className="ml-auto text-sm font-semibold text-[#1D164E]">
                              {v.price.toFixed(2)} €
                            </span>
                          )}
                        </div>
                        {v.notes && <p className="text-xs text-gray-500 mt-1">{v.notes}</p>}
                        {depositSent[v.id] != null && (
                          <p className="text-xs text-green-600 mt-1">
                            ✓ Acompte de {depositSent[v.id].toFixed(2)} € envoyé
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => deleteVisit(v.id)}
                        className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {v.status === 'pending_deposit' &&
                      (() => {
                        const createdMs = new Date(v.created_at).getTime()
                        const appointmentMs = new Date(
                          `${v.date}T${v.time?.slice(0, 5) ?? '09:00'}Z`
                        ).getTime()
                        const hoursUntilAppt = (appointmentMs - createdMs) / 3600000
                        const deadlineHours = hoursUntilAppt >= 24 ? 24 : 12
                        const deadlineMs = createdMs + deadlineHours * 3600000
                        const remainingMs = deadlineMs - Date.now()
                        const remainingH = Math.floor(remainingMs / 3600000)
                        const remainingM = Math.floor((remainingMs % 3600000) / 60000)
                        const deadlineLabel =
                          remainingMs > 0
                            ? `Expire dans ${remainingH > 0 ? `${remainingH}h` : ''}${remainingM}min`
                            : 'Délai expiré'
                        const isExpired = remainingMs <= 0

                        return (
                          <div className="px-4 pb-4 space-y-2">
                            <p
                              className={`text-xs font-medium ${isExpired ? 'text-red-500' : 'text-amber-600'}`}
                            >
                              {deadlineLabel}
                            </p>
                            {depositSent[v.id] == null && (
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  placeholder="Acompte (€)"
                                  value={depositPrices[v.id] ?? ''}
                                  onChange={(e) =>
                                    setDepositPrices((d) => ({ ...d, [v.id]: e.target.value }))
                                  }
                                  className="w-36 text-sm rounded-lg border border-gray-200 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#1D164E]"
                                />
                                <button
                                  onClick={() => copyDepositEmail(v)}
                                  disabled={
                                    !depositPrices[v.id] || Number(depositPrices[v.id]) <= 0
                                  }
                                  className="text-xs font-medium bg-[#1D164E] text-white px-3 py-1.5 rounded-lg hover:bg-[#1D164E]/90 disabled:opacity-50 transition-colors"
                                >
                                  Copier le texte
                                </button>
                              </div>
                            )}
                            <button
                              onClick={() => confirmDeposit(v.id)}
                              disabled={confirmingDeposit[v.id]}
                              className="text-xs font-medium bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                            >
                              {confirmingDeposit[v.id] ? 'Confirmation…' : '✓ Acompte reçu'}
                            </button>
                          </div>
                        )
                      })()}
                  </div>
                )

                return (
                  <div className="space-y-5">
                    {upcoming.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
                          À venir
                        </p>
                        <div className="space-y-3">{upcoming.map(renderVisit)}</div>
                      </div>
                    )}
                    {past.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
                          Passées
                        </p>
                        <div className="space-y-3">{past.map(renderVisit)}</div>
                      </div>
                    )}
                  </div>
                )
              })()
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
