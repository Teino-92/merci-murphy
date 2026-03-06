'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { HoraireGroupe } from '@/sanity/queries/site-settings'

export function HorairesAccordion({ groupes }: { groupes: HoraireGroupe[] }) {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="divide-y divide-cream/10">
      {groupes.map((groupe, i) => (
        <div key={i}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="flex w-full items-center justify-between py-3 text-left"
          >
            <span className="font-medium text-cream">{groupe.titre}</span>
            <ChevronDown
              className={cn(
                'h-4 w-4 shrink-0 text-terracotta transition-transform duration-200',
                open === i && 'rotate-180'
              )}
            />
          </button>
          {open === i && (
            <dl className="pb-4 space-y-2">
              {groupe.lignes?.map((h, j) => (
                <div key={j} className="flex justify-between">
                  <dt className="text-cream/60 text-sm">{h.jour}</dt>
                  <dd className="text-sm font-medium text-cream">{h.heures}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      ))}
    </div>
  )
}
