'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PortableTextBlock } from '@portabletext/react'
import { PortableText } from './portable-text'

interface FaqItem {
  question: string
  reponse: PortableTextBlock[]
}

interface FaqAccordionProps {
  items: FaqItem[]
}

export function FaqAccordion({ items }: FaqAccordionProps) {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="divide-y divide-charcoal/10">
      {items.map((item, i) => (
        <div key={i}>
          <button
            className="flex w-full items-center justify-between py-5 text-left"
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
          >
            <span className="font-medium text-charcoal">{item.question}</span>
            <ChevronDown
              className={cn(
                'ml-4 h-5 w-5 shrink-0 text-terracotta transition-transform duration-200',
                open === i && 'rotate-180'
              )}
            />
          </button>
          {open === i && (
            <div className="pb-5">
              <PortableText value={item.reponse} />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
