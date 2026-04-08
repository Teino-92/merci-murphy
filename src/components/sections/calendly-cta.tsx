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
  /** Override the booking URL (e.g. '/reservation' for internal pages) */
  href?: string
}

export function CalendlyCta({ calendlyUrl, label, mobile = false, phone, href }: CalendlyCtaProps) {
  const bookingUrl = href ?? calendlyUrl
  const isExternal = !bookingUrl.startsWith('/')
  const [canBook, setCanBook] = useState(false)

  useEffect(() => {
    const supabase = createSupabaseBrowserClient()
    void (async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) return
      const { data: profile } = await supabase
        .from('profiles')
        .select('can_book')
        .eq('id', data.user.id)
        .single()
      if (profile?.can_book) setCanBook(true)
    })()
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
              {isExternal ? (
                <a
                  href={bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  {label ?? 'Réserver'}
                </a>
              ) : (
                <Link href={bookingUrl} className="flex items-center justify-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {label ?? 'Réserver'}
                </Link>
              )}
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

  // Desktop: Réserver (terracotta-dark) when can_book, hidden otherwise
  if (!canBook) return null

  return (
    <Button asChild size="lg" className="bg-terracotta-dark text-white hover:bg-terracotta-dark/90">
      {isExternal ? (
        <a href={bookingUrl} target="_blank" rel="noopener noreferrer">
          {label ?? 'Réserver en ligne'}
        </a>
      ) : (
        <Link href={bookingUrl}>{label ?? 'Réserver en ligne'}</Link>
      )}
    </Button>
  )
}
