'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { HoraireGroupe } from '@/sanity/queries/site-settings'

interface HorairesAccordionProps {
  groupes: HoraireGroupe[]
  variant?: 'dark' | 'light'
}

export function HorairesAccordion({ groupes, variant = 'dark' }: HorairesAccordionProps) {
  const [open, setOpen] = useState<number | null>(null)

  const isDark = variant === 'dark'

  return (
    <div className={cn('divide-y', isDark ? 'divide-cream/10' : 'divide-charcoal/10')}>
      {groupes.map((groupe, i) => (
        <div key={i}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="flex w-full items-center justify-between py-3 text-left"
          >
            <span className={cn('font-medium', isDark ? 'text-cream' : 'text-charcoal')}>
              {groupe.titre}
            </span>
            <ChevronDown
              className={cn(
                'h-4 w-4 shrink-0 text-terracotta-dark transition-transform duration-200',
                open === i && 'rotate-180'
              )}
            />
          </button>
          {open === i && (
            <dl className="pb-4 space-y-2">
              {groupe.lignes?.map((h, j) => (
                <div key={j} className="flex justify-between">
                  <dt className={cn('text-sm', isDark ? 'text-cream/60' : 'text-charcoal/60')}>
                    {h.jour}
                  </dt>
                  <dd
                    className={cn('text-sm font-medium', isDark ? 'text-cream' : 'text-charcoal')}
                  >
                    {h.heures}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      ))}
    </div>
  )
}
