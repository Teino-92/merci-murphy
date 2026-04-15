'use client'

import { useState } from 'react'
import { Download } from 'lucide-react'

const EXPORTS = [
  { table: 'profiles', label: 'Profils clients', description: 'Noms, téléphones, statuts' },
  { table: 'dogs', label: 'Chiens', description: 'Races, poids, pelage, notes' },
  { table: 'visits', label: 'Visites', description: 'Services, dates, prix, statuts' },
]

export default function ExportPage() {
  const [loading, setLoading] = useState<string | null>(null)

  async function handleExport(table: string) {
    setLoading(table)
    try {
      const res = await fetch(`/api/dashboard/export?table=${table}`)
      if (!res.ok) throw new Error('Erreur export')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${table}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1D164E]">Export</h1>
        <p className="text-sm text-gray-400 mt-1">Téléchargez les données en CSV</p>
      </div>
      <div className="grid gap-4 max-w-lg">
        {EXPORTS.map(({ table, label, description }) => (
          <div
            key={table}
            className="flex items-center justify-between rounded-2xl bg-white p-5 shadow-sm border border-gray-100"
          >
            <div>
              <p className="font-semibold text-[#1D164E]">{label}</p>
              <p className="text-sm text-gray-400 mt-0.5">{description}</p>
            </div>
            <button
              onClick={() => handleExport(table)}
              disabled={loading === table}
              className="flex items-center gap-2 rounded-xl bg-[#1D164E] px-4 py-2 text-sm font-medium text-white hover:bg-[#1D164E]/90 disabled:opacity-50 transition-colors"
            >
              <Download className="h-4 w-4" />
              {loading === table ? 'Export…' : 'CSV'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
