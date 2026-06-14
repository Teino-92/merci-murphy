'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Phone, Calendar } from 'lucide-react'
import { createSupabaseBrowserClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'

interface BookingCtaProps {
  /** Renders the mobile sticky bottom bar variant instead of a single button */
  mobile?: boolean
  /** Phone number for the "Appeler" button (mobile variant only) */
  phone?: string
  /** Button label, defaults to "Prendre RDV" */
  label?: string
}

/**
 * Booking call-to-action. Routes to the native booking flow:
 * - logged in & allowed to book → /reservation
 * - otherwise → /compte/inscription (account creation)
 *
 * Desktop renders a single button; mobile renders a sticky bottom bar with
 * an "Appeler" button alongside.
 */
export function BookingCta({ mobile = false, phone, label = 'Prendre RDV' }: BookingCtaProps) {
  const [canBook, setCanBook] = useState<boolean | null>(null)

  useEffect(() => {
    const supabase = createSupabaseBrowserClient()
    void (async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        setCanBook(false)
        return
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('can_book')
        .eq('id', data.user.id)
        .single()
      setCanBook(profile?.can_book ?? false)
    })()
  }, [])

  // While loading (null) we optimistically point to /reservation; resolves on mount.
  const bookingHref = canBook === false ? '/compte/inscription' : '/reservation'

  if (mobile) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-charcoal/10 bg-cream p-4 lg:hidden">
        <div className="flex gap-3">
          {phone && (
            <Button asChild variant="outline" className="flex-1 border-charcoal/20">
              <a href={`tel:${phone}`} className="flex items-center justify-center gap-2">
                <Phone className="h-4 w-4" />
                Appeler
              </a>
            </Button>
          )}
          <Button
            asChild
            className="flex-1 bg-terracotta-dark text-white hover:bg-terracotta-dark/90"
          >
            <Link href={bookingHref} className="flex items-center justify-center gap-2">
              <Calendar className="h-4 w-4" />
              {label}
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Button asChild size="lg" className="bg-terracotta-dark text-white hover:bg-terracotta-dark/90">
      <Link href={bookingHref}>{label}</Link>
    </Button>
  )
}
