'use client'

import { useState } from 'react'
import Image from 'next/image'
import { MoreHorizontal } from 'lucide-react'
import { DogForm } from '@/components/account/dog-form'
import type { Dog } from '@/lib/auth-actions'

interface DogsCardProps {
  dogs: Dog[]
}

export function DogsCard({ dogs }: DogsCardProps) {
  const [addingNew, setAddingNew] = useState(false)
  const [editingDog, setEditingDog] = useState<Dog | null>(null)

  return (
    <div className="bg-white rounded-[18px] p-5 mb-3.5 border border-[#f0ebe3]">
      <div className="mb-4">
        <span className="text-[13px] font-bold uppercase tracking-[0.1em] text-[#888]">
          Mes chiens
        </span>
      </div>

      {dogs.map((dog) => (
        <div key={dog.id}>
          {editingDog?.id === dog.id ? (
            <div className="mb-3 p-4 rounded-[14px]" style={{ backgroundColor: '#fdf9f5' }}>
              <p className="text-[13px] font-semibold mb-3">Modifier {dog.name}</p>
              <DogForm dog={dog} onClose={() => setEditingDog(null)} />
            </div>
          ) : (
            <DogSubCard dog={dog} onEdit={() => setEditingDog(dog)} />
          )}
        </div>
      ))}

      {addingNew ? (
        <div className="p-4 rounded-[14px] mb-2.5" style={{ backgroundColor: '#fdf9f5' }}>
          <p className="text-[13px] font-semibold mb-3">Ajouter un chien</p>
          <DogForm onClose={() => setAddingNew(false)} />
        </div>
      ) : (
        <button
          onClick={() => setAddingNew(true)}
          className="w-full flex items-center justify-center gap-2 py-3.5 border-2 border-dashed rounded-[14px] text-[14px] font-medium text-[#888] transition-colors hover:border-[#C4845A] hover:text-[#8B5A3A]"
          style={{ borderColor: '#e8dece' }}
        >
          + Ajouter un chien
        </button>
      )}
    </div>
  )
}

function DogSubCard({ dog, onEdit }: { dog: Dog; onEdit: () => void }) {
  return (
    <div
      className="flex items-center gap-3.5 p-3.5 rounded-[14px] mb-2.5 border border-[#f0ebe3]"
      style={{ backgroundColor: '#fdf9f5' }}
    >
      <div
        className="w-[60px] h-[60px] rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center text-2xl relative"
        style={{ backgroundColor: '#e8dece' }}
      >
        {dog.photo_url ? (
          <Image src={dog.photo_url} alt={dog.name} fill className="object-cover" sizes="60px" />
        ) : (
          <span>🐶</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-bold text-[#1a1a1a] mb-0.5">{dog.name}</p>
        {(dog.breed || dog.age) && (
          <p className="text-[12px] text-[#888]">
            {[dog.breed, dog.age].filter(Boolean).join(' · ')}
          </p>
        )}
        <div className="flex flex-wrap gap-1 mt-1">
          {dog.poids && <DogTag>{dog.poids}</DogTag>}
          {dog.etat_poil && <DogTag>{dog.etat_poil}</DogTag>}
          {dog.grooming_duration && <DogTag>{dog.grooming_duration} min</DogTag>}
        </div>
      </div>
      <button
        onClick={onEdit}
        className="p-1.5 rounded-lg text-[#999] hover:text-[#8B5A3A] hover:bg-[#f0ebe3] transition-colors flex-shrink-0"
        aria-label={`Modifier ${dog.name}`}
      >
        <MoreHorizontal className="w-5 h-5" />
      </button>
    </div>
  )
}

function DogTag({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full"
      style={{ backgroundColor: '#f0ebe3', color: '#8B5A3A' }}
    >
      {children}
    </span>
  )
}
