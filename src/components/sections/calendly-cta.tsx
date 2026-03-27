'use client'

import { useEffect, useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Calendar } from 'lucide-react'
import Link from 'next/link'

interface CalendlyCtaProps {
  calendlyUrl: string
  label?: string
  /** If true, renders the mobile sticky bar variant */
  mobile?: boolean
  phone?: string
}

export function CalendlyCta({ calendlyUrl, label, mobile = false, phone }: CalendlyCtaProps) {
  const [canBook, setCanBook] = useState(false)

  useEffect(() => {
    const supabase = createSupabaseBrowserClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return
      supabase
        .from('profiles')
        .select('can_book')
        .eq('id', data.user.id)
        .single()
        .then(({ data: profile }) => {
          if (profile?.can_book) setCanBook(true)
        })
    })
  }, [])

  if (mobile) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-charcoal/10 bg-cream p-4 lg:hidden">
        <div className="flex gap-3">
          {phone && (
            <Button asChild variant="outline" className="flex-1 border-charcoal/20">
              <a href={`tel:${phone}`} className="flex items-center justify-center gap-2">
                <Calendar className="h-4 w-4" />
                Appeler
              </a>
            </Button>
          )}
          {canBook ? (
            <Button
              asChild
              className="flex-1 bg-terracotta-dark text-white hover:bg-terracotta-dark/90"
            >
              <a
                href={calendlyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                {label ?? 'Réserver'}
              </a>
            </Button>
          ) : (
            <Button
              asChild
              className="flex-1 bg-terracotta-dark text-white hover:bg-terracotta-dark/90"
            >
              <Link href="/compte/inscription" className="flex items-center justify-center gap-2">
                <Calendar className="h-4 w-4" />
                Être rappelé·e
              </Link>
            </Button>
          )}
        </div>
      </div>
    )
  }

  if (!canBook) return null

  return (
    <Button asChild size="lg" className="bg-terracotta text-white hover:bg-terracotta/90">
      <a href={calendlyUrl} target="_blank" rel="noopener noreferrer">
        {label ?? 'Réserver en ligne'}
      </a>
    </Button>
  )
}
