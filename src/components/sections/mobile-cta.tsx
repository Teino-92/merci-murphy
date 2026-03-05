'use client'

import Link from 'next/link'
import { Phone, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MobileCtaProps {
  phone?: string
  type?: 'reservation' | 'telephone'
  label?: string
}

export function MobileCta({ phone, type = 'reservation', label }: MobileCtaProps) {
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
        {type === 'reservation' && (
          <Button asChild className="flex-1 bg-terracotta text-white hover:bg-terracotta/90">
            <Link href="/reservation" className="flex items-center justify-center gap-2">
              <Calendar className="h-4 w-4" />
              {label ?? 'Réserver'}
            </Link>
          </Button>
        )}
      </div>
    </div>
  )
}
