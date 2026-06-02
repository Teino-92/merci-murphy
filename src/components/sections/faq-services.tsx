'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Section, Container } from '@/components/ui/section'
import { Reveal } from '@/components/ui/reveal'
import { FAQ_SERVICES } from './faq-services-data'

export function FaqServices() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div style={{ backgroundColor: '#4F6072' }}>
      <div className="px-4 sm:px-6 lg:px-8">
        <Container>
          <div className="border-t-2 border-white/20" />
        </Container>
      </div>
      <Section>
        <Container className="max-w-3xl">
          <Reveal>
            <div className="text-center mb-10">
              <h2 className="font-display text-3xl font-bold text-cream sm:text-4xl">
                Questions fréquentes
              </h2>
            </div>
          </Reveal>
          <div className="divide-y divide-cream/20">
            {FAQ_SERVICES.map((item, i) => (
              <div key={i}>
                <button
                  className="flex w-full items-center justify-between py-5 text-left"
                  onClick={() => setOpen(open === i ? null : i)}
                  aria-expanded={open === i}
                >
                  <span className="font-medium text-cream">{item.question}</span>
                  <ChevronDown
                    className={cn(
                      'ml-4 h-5 w-5 shrink-0 text-cream/60 transition-transform duration-200',
                      open === i && 'rotate-180'
                    )}
                  />
                </button>
                {open === i && (
                  <div className="pb-5 text-sm leading-relaxed text-cream/70">{item.reponse}</div>
                )}
              </div>
            ))}
          </div>
        </Container>
      </Section>
    </div>
  )
}
