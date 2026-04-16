'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { BreedCombobox } from '@/components/ui/breed-combobox'
import { DogPhotoUpload } from '@/components/account/dog-photo-upload'
import { addDog, updateDog } from '@/lib/dog-actions'
import type { Dog } from '@/lib/auth-actions'
import { POIDS, ETAT_POIL } from '@/lib/dog-constants'

interface DogFormProps {
  dog?: Dog
  onClose: () => void
  required?: boolean
}

export function DogForm({ dog, onClose, required = false }: DogFormProps) {
  const [name, setName] = useState(dog?.name ?? '')
  const [breed, setBreed] = useState(dog?.breed ?? '')
  const [age, setAge] = useState(dog?.age ?? '')
  const [poids, setPoids] = useState(dog?.poids ?? '')
  const [etatPoil, setEtatPoil] = useState(dog?.etat_poil ?? '')
  const [photoUrl, setPhotoUrl] = useState(dog?.photo_url ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    const payload = { name, breed, age, poids, etat_poil: etatPoil, photo_url: photoUrl }
    const result = dog ? await updateDog(dog.id, payload) : await addDog(payload)
    setLoading(false)
    if (result.success) {
      onClose()
    } else {
      setError(result.error ?? 'Une erreur est survenue.')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <DogPhotoUpload
          currentUrl={photoUrl || null}
          dogName={name || 'Chien'}
          onUpload={setPhotoUrl}
        />
      </div>
      <div>
        <label className="block text-[13px] text-[#888] mb-1">Prénom du chien *</label>
        <Input
          placeholder="Ex: Rocky, Bella…"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-[13px] text-[#888] mb-1">Race {required ? '*' : ''}</label>
        <BreedCombobox value={breed} onChange={setBreed} />
      </div>
      <div>
        <label className="block text-[13px] text-[#888] mb-1">Âge {required ? '*' : ''}</label>
        <Select value={age} onValueChange={setAge}>
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
        <label className="block text-[13px] text-[#888] mb-1">Poids {required ? '*' : ''}</label>
        <Select value={poids} onValueChange={setPoids}>
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
        <label className="block text-[13px] text-[#888] mb-1">État du pelage</label>
        <Select value={etatPoil} onValueChange={setEtatPoil}>
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
      <div className="flex gap-2 pt-1">
        {!required && (
          <Button variant="outline" onClick={onClose} className="flex-1" disabled={loading}>
            Annuler
          </Button>
        )}
        <Button
          onClick={handleSubmit}
          disabled={loading || !name || (required && (!breed || !age || !poids))}
          className="flex-1 text-white"
          style={{ backgroundColor: '#8B5A3A' }}
        >
          {loading
            ? 'Enregistrement…'
            : required
              ? 'Enregistrer et continuer'
              : dog
                ? 'Enregistrer'
                : 'Ajouter'}
        </Button>
      </div>
    </div>
  )
}
