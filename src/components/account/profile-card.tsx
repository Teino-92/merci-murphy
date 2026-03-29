'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { updateProfile, updateNewsletter } from '@/lib/auth-actions'
import type { Profile } from '@/lib/auth-actions'

interface ProfileCardProps {
  profile: Profile
  email: string
}

export function ProfileCard({ profile, email }: ProfileCardProps) {
  const [editing, setEditing] = useState(false)
  const [nom, setNom] = useState(profile.nom)
  const [telephone, setTelephone] = useState(profile.telephone)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(
    profile.newsletter_subscribed ?? false
  )
  const [newsletterLoading, setNewsletterLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    setError(null)
    const result = await updateProfile({ nom, telephone })
    setLoading(false)
    if (result.success) {
      setEditing(false)
    } else {
      setError(result.error ?? 'Erreur lors de la mise à jour.')
    }
  }

  const handleNewsletterToggle = async () => {
    setNewsletterLoading(true)
    const newValue = !newsletterSubscribed
    const result = await updateNewsletter(newValue)
    setNewsletterLoading(false)
    if (result.success) setNewsletterSubscribed(newValue)
  }

  return (
    <div className="bg-white rounded-[18px] p-5 mb-3.5 border border-[#f0ebe3]">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[13px] font-bold uppercase tracking-[0.1em] text-[#888]">
          Mon profil
        </span>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="text-[13px] font-semibold"
            style={{ color: '#8B5A3A' }}
          >
            Modifier
          </button>
        )}
      </div>

      {editing ? (
        <div className="space-y-3">
          <div>
            <label className="block text-[13px] text-[#888] mb-1">Nom</label>
            <Input value={nom} onChange={(e) => setNom(e.target.value)} />
          </div>
          <div>
            <label className="block text-[13px] text-[#888] mb-1">Téléphone</label>
            <Input value={telephone} onChange={(e) => setTelephone(e.target.value)} />
          </div>
          <div>
            <label className="block text-[13px] text-[#888] mb-1">Email</label>
            <Input value={email} disabled className="opacity-50" />
            <p className="text-[11px] text-[#aaa] mt-1">
              L&apos;email ne peut pas être modifié ici.
            </p>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex gap-2 pt-1">
            <Button
              variant="outline"
              onClick={() => setEditing(false)}
              className="flex-1"
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading || !nom || !telephone}
              className="flex-1 text-white"
              style={{ backgroundColor: '#8B5A3A' }}
            >
              {loading ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </div>
        </div>
      ) : (
        <>
          <InfoRow label="Nom" value={profile.nom} />
          <InfoRow label="Téléphone" value={profile.telephone} />
          <InfoRow label="Email" value={email} />
          <div className="flex justify-between items-center py-2.5">
            <span className="text-[13px] text-[#888]">Newsletter</span>
            <button
              onClick={handleNewsletterToggle}
              disabled={newsletterLoading}
              className={`relative w-10 h-5.5 rounded-full transition-colors duration-200 ${
                newsletterSubscribed ? 'bg-[#8B5A3A]' : 'bg-[#e0d8ce]'
              }`}
              style={{ height: '22px', width: '40px' }}
              aria-label="Toggle newsletter"
            >
              <span
                className={`absolute top-0.5 left-0.5 w-[18px] h-[18px] rounded-full bg-white shadow transition-transform duration-200 ${
                  newsletterSubscribed ? 'translate-x-[18px]' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </>
      )}
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-[#f5f0eb] last:border-0">
      <span className="text-[13px] text-[#888]">{label}</span>
      <span className="text-[14px] font-medium text-[#1a1a1a]">{value}</span>
    </div>
  )
}
