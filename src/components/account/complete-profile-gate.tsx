'use client'

import { useRouter } from 'next/navigation'
import { DogForm } from '@/components/account/dog-form'

export function CompleteProfileGate({ prenom }: { prenom: string }) {
  const router = useRouter()

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <p className="text-[13px] font-bold uppercase tracking-[0.1em] text-[#888] mb-1">
          Bienvenue {prenom} !
        </p>
        <h1 className="text-[22px] font-bold text-[#1a1a1a] leading-tight">
          Une dernière étape avant de continuer
        </h1>
        <p className="mt-2 text-[14px] text-[#888] leading-relaxed">
          Pour personnaliser votre expérience et prendre rendez-vous, nous avons besoin des
          informations sur votre chien.
        </p>
      </div>

      <div className="bg-white rounded-[18px] p-5 border border-[#f0ebe3]">
        <p className="text-[13px] font-bold uppercase tracking-[0.1em] text-[#888] mb-4">
          Mon chien
        </p>
        <DogForm required onClose={() => router.refresh()} />
      </div>
    </div>
  )
}
