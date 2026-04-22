'use client'

import { useState } from 'react'
import type { Lead } from '@/lib/supabase-admin'
import { SERVICE_LABELS } from '@/lib/dog-constants'

const MESSAGE_TRUNCATE = 80

const STATUSES = ['new', 'contacted', 'confirmed', 'cancelled'] as const
type LeadStatus = (typeof STATUSES)[number]

const STATUS_LABELS: Record<string, string> = {
  new: 'Nouveau',
  contacted: 'Contacté',
  confirmed: 'Confirmé',
  cancelled: 'Annulé',
}

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

const STATUS_DOT: Record<string, string> = {
  new: 'bg-blue-400',
  contacted: 'bg-yellow-400',
  confirmed: 'bg-green-400',
  cancelled: 'bg-red-400',
}

type ExtendedLead = Lead & {
  has_account: boolean
  proposed_date?: string | null
  proposed_time?: string | null
  client_response?: string | null
  client_counter?: string | null
  deposit_amount?: number | null
  payment_url?: string | null
}

interface ProposeModalProps {
  lead: ExtendedLead
  onClose: () => void
  onSent: (id: string) => void
}

function ProposeModal({ lead, onClose, onSent }: ProposeModalProps) {
  const [date, setDate] = useState(lead.proposed_date ?? '')
  const [time, setTime] = useState(lead.proposed_time ?? '')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)
    setError('')
    const res = await fetch(`/api/dashboard/leads/${lead.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'propose', proposedDate: date, proposedTime: time }),
    })
    if (res.ok) {
      onSent(lead.id)
      onClose()
    } else {
      setError("Erreur lors de l'envoi.")
    }
    setSending(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <h2 className="text-lg font-semibold text-[#1D164E] mb-1">Proposer un créneau</h2>
        <p className="text-sm text-gray-400 mb-5">
          {lead.nom} · {SERVICE_LABELS[lead.service] ?? lead.service}
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D164E]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Heure</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D164E]"
            />
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-full border border-gray-200 py-2 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={sending}
              className="flex-1 rounded-full bg-[#1D164E] py-2 text-sm font-semibold text-white disabled:opacity-50 transition-opacity"
            >
              {sending ? 'Envoi…' : 'Envoyer le mail'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

interface DepositModalProps {
  lead: ExtendedLead
  onClose: () => void
  onSent: (id: string) => void
}

function DepositModal({ lead, onClose, onSent }: DepositModalProps) {
  const [amount, setAmount] = useState(lead.deposit_amount?.toString() ?? '')
  const [url, setUrl] = useState(lead.payment_url ?? '')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)
    setError('')
    const res = await fetch(`/api/dashboard/leads/${lead.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'send-deposit',
        depositAmount: Number(amount),
        paymentUrl: url,
      }),
    })
    if (res.ok) {
      onSent(lead.id)
      onClose()
    } else {
      setError("Erreur lors de l'envoi.")
    }
    setSending(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <h2 className="text-lg font-semibold text-[#1D164E] mb-1">Envoyer l&apos;acompte</h2>
        <p className="text-sm text-gray-400 mb-5">{lead.nom}</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Montant de l&apos;acompte (€)
            </label>
            <input
              type="number"
              min="1"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Ex : 25"
              required
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D164E]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Lien de paiement SumUp
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://pay.sumup.com/..."
              required
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D164E]"
            />
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-full border border-gray-200 py-2 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={sending}
              className="flex-1 rounded-full bg-[#8B5A3A] py-2 text-sm font-semibold text-white disabled:opacity-50 transition-opacity"
            >
              {sending ? 'Envoi…' : 'Envoyer le mail'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function LeadsTable({ leads: initialLeads }: { leads: ExtendedLead[] }) {
  const [leads, setLeads] = useState(initialLeads)
  const [filter, setFilter] = useState<string>('new')
  const [updating, setUpdating] = useState<string | null>(null)
  const [expandedMessages, setExpandedMessages] = useState<Record<string, boolean>>({})
  const [proposeModal, setProposeModal] = useState<ExtendedLead | null>(null)
  const [depositModal, setDepositModal] = useState<ExtendedLead | null>(null)

  async function changeStatus(id: string, status: LeadStatus) {
    setUpdating(id + status)
    await fetch(`/api/dashboard/leads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)))
    setUpdating(null)
  }

  function handleProposeSent(id: string) {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status: 'contacted' } : l)))
  }

  function handleDepositSent(id: string) {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status: 'confirmed' } : l)))
  }

  const filtered =
    filter === 'all'
      ? leads
      : filter === 'no_account'
        ? leads.filter((l) => !l.has_account)
        : leads.filter((l) => l.status === filter)

  return (
    <div>
      {proposeModal && (
        <ProposeModal
          lead={proposeModal}
          onClose={() => setProposeModal(null)}
          onSent={handleProposeSent}
        />
      )}
      {depositModal && (
        <DepositModal
          lead={depositModal}
          onClose={() => setDepositModal(null)}
          onSent={handleDepositSent}
        />
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['new', 'contacted', 'confirmed', 'cancelled', 'no_account', 'all'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === s ? 'bg-[#1D164E] text-white' : 'bg-white text-gray-500 hover:bg-gray-100'
            }`}
          >
            {s === 'all' ? 'Tout' : s === 'no_account' ? 'Sans compte' : STATUS_LABELS[s]}
            <span className="ml-1.5 text-xs opacity-70">
              {s === 'all'
                ? leads.length
                : s === 'no_account'
                  ? leads.filter((l) => !l.has_account).length
                  : leads.filter((l) => l.status === s).length}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-400">Aucune demande.</p>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3 font-medium text-gray-500">Nom</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500 hidden sm:table-cell">
                  Service
                </th>
                <th className="text-left px-5 py-3 font-medium text-gray-500 hidden md:table-cell">
                  Contact
                </th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Statut</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500 hidden lg:table-cell">
                  Date
                </th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead) => (
                <tr key={lead.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-[#1D164E]">{lead.nom}</p>
                      <span
                        className={`inline-block w-2 h-2 rounded-full shrink-0 ${STATUS_DOT[lead.status] ?? 'bg-gray-300'}`}
                        title={STATUS_LABELS[lead.status]}
                      />
                      {!lead.has_account && (
                        <span className="text-[10px] text-gray-400" title="Sans compte">
                          —
                        </span>
                      )}
                    </div>
                    {(lead.nom_chien || lead.race_chien) && (
                      <p className="text-xs text-gray-400">
                        🐾 {[lead.nom_chien, lead.race_chien].filter(Boolean).join(' · ')}
                      </p>
                    )}
                    {lead.message && (
                      <div className="mt-0.5">
                        <p className="text-xs text-gray-400">
                          {expandedMessages[lead.id] || lead.message.length <= MESSAGE_TRUNCATE
                            ? lead.message
                            : lead.message.slice(0, MESSAGE_TRUNCATE) + '…'}
                        </p>
                        {lead.message.length > MESSAGE_TRUNCATE && (
                          <button
                            onClick={() =>
                              setExpandedMessages((s) => ({ ...s, [lead.id]: !s[lead.id] }))
                            }
                            className="text-[10px] text-gray-400 hover:text-gray-600 underline transition-colors"
                          >
                            {expandedMessages[lead.id] ? 'Réduire' : 'Voir plus'}
                          </button>
                        )}
                      </div>
                    )}
                    {/* Contre-proposition client */}
                    {lead.client_counter && (
                      <p className="mt-1 text-xs text-amber-600 bg-amber-50 rounded px-2 py-1">
                        💬 {lead.client_counter}
                      </p>
                    )}
                    {lead.client_response === 'accepted' && !lead.payment_url && (
                      <p className="mt-1 text-xs text-green-600">✅ Créneau accepté</p>
                    )}
                    {lead.client_response === 'declined' && (
                      <p className="mt-1 text-xs text-red-500">❌ Créneau refusé</p>
                    )}
                  </td>
                  <td className="px-5 py-4 text-gray-600 hidden sm:table-cell">
                    {SERVICE_LABELS[lead.service] ?? lead.service}
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <p className="text-gray-700">{lead.email}</p>
                    <p className="text-xs text-gray-400">{lead.telephone}</p>
                  </td>
                  <td className="px-5 py-4">
                    <select
                      value={lead.status}
                      disabled={updating !== null}
                      onChange={(e) => changeStatus(lead.id, e.target.value as LeadStatus)}
                      className={`px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1D164E] ${STATUS_COLORS[lead.status]}`}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {STATUS_LABELS[s]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-5 py-4 text-gray-400 hidden lg:table-cell">
                    {new Date(lead.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-col gap-1.5">
                      {lead.status === 'new' && (
                        <button
                          onClick={() => setProposeModal(lead)}
                          className="whitespace-nowrap rounded-full bg-[#1D164E] px-3 py-1 text-xs font-medium text-white hover:bg-[#1D164E]/80 transition-colors"
                        >
                          📅 Proposer créneau
                        </button>
                      )}
                      {lead.client_response === 'accepted' && (
                        <button
                          onClick={() => setDepositModal(lead)}
                          className="whitespace-nowrap rounded-full bg-[#8B5A3A] px-3 py-1 text-xs font-medium text-white hover:bg-[#8B5A3A]/80 transition-colors"
                        >
                          💳 Envoyer acompte
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
