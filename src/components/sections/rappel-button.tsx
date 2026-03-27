'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createSupabaseBrowserClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'

export function RappelButton() {
  const [canBook, setCanBook] = useState<boolean | null>(null)

  useEffect(() => {
    const supabase = createSupabaseBrowserClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        setCanBook(false)
        return
      }
      supabase
        .from('profiles')
        .select('can_book')
        .eq('id', data.user.id)
        .single()
        .then(({ data: profile }) => {
          setCanBook(profile?.can_book ?? false)
        })
    })
  }, [])

  // null = loading, hide to avoid flash
  if (canBook === null || canBook === true) return null

  return (
    <Button
      asChild
      size="lg"
      className="bg-terracotta-dark text-white hover:bg-terracotta-dark/90 hover:text-white"
    >
      <Link href="/compte/inscription">Être rappelé·e</Link>
    </Button>
  )
}
