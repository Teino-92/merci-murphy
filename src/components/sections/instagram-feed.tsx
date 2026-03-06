'use client'

import { useEffect } from 'react'
import { Instagram } from 'lucide-react'
import { Section, Container } from '@/components/ui/section'

interface InstagramFeedProps {
  feedId: string
}

export function InstagramFeed({ feedId }: InstagramFeedProps) {
  useEffect(() => {
    if (document.querySelector('script[src*="behold.so"]')) return
    const script = document.createElement('script')
    script.src = 'https://w.behold.so/widget.js'
    script.type = 'module'
    document.head.appendChild(script)
  }, [])

  return (
    <Section className="bg-rose/20">
      <Container>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold text-charcoal sm:text-4xl">
              Sur Instagram
            </h2>
            <p className="mt-2 text-charcoal/60">La vie de Merci Murphy au quotidien.</p>
          </div>
          <a
            href="https://instagram.com/mercimurphy"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm font-medium text-terracotta hover:gap-2.5 transition-all"
          >
            <Instagram className="h-4 w-4" />
            Nous suivre
          </a>
        </div>
        <div className="mt-10">
          {/* @ts-expect-error behold-widget is a custom element */}
          <behold-widget feed-id={feedId} />
        </div>
      </Container>
    </Section>
  )
}
