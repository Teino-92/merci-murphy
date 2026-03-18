'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createSupabaseBrowserClient } from '@/lib/supabase'

const supabase = createSupabaseBrowserClient()

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }
    if (
      password.length < 8 ||
      !/[a-z]/.test(password) ||
      !/[A-Z]/.test(password) ||
      !/[0-9]/.test(password)
    ) {
      setError(
        'Le mot de passe doit faire au moins 8 caractères et contenir une majuscule, une minuscule et un chiffre.'
      )
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (error) {
      setError('Lien expiré ou invalide. Faites une nouvelle demande de réinitialisation.')
      return
    }

    setSuccess(true)
    setTimeout(() => router.push('/compte/connexion'), 2500)
  }

  return (
    <div className="min-h-screen bg-[#1D164E] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Image
            src="/logo.avif"
            alt="Merci Murphy"
            width={160}
            height={56}
            className="brightness-0 invert"
          />
        </div>
        <div className="bg-white rounded-2xl p-8 shadow-xl">
          {success ? (
            <div className="text-center">
              <p className="text-lg font-semibold text-[#1D164E]">Mot de passe mis à jour !</p>
              <p className="mt-2 text-sm text-gray-500">Redirection en cours…</p>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-semibold text-[#1D164E] mb-2">Nouveau mot de passe</h1>
              <p className="text-sm text-gray-500 mb-6">Choisissez un mot de passe sécurisé.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D164E]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmer le mot de passe
                  </label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D164E]"
                  />
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#1D164E] text-white rounded-lg py-2 text-sm font-medium hover:bg-[#1D164E]/90 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Mise à jour…' : 'Mettre à jour'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
