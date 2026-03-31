'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createSupabaseBrowserClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'

type State = 'loading' | 'no-account' | 'has-account'

export function RappelButton() {
  const [state, setState] = useState<State>('loading')

  useEffect(() => {
    const supabase = createSupabaseBrowserClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        setState('no-account')
        return
      }
      supabase
        .from('profiles')
        .select('can_book')
        .eq('id', data.user.id)
        .single()
        .then(({ data: profile }) => {
          setState(profile ? 'has-account' : 'no-account')
        })
    })
  }, [])

  if (state === 'loading') return null

  // has-account (can_book false) → /reservation (autofilled form)
  // no-account → /compte/inscription
  const href = state === 'has-account' ? '/reservation' : '/compte/inscription'

  return (
    <Button
      asChild
      size="lg"
      className="bg-terracotta-dark text-white hover:bg-terracotta-dark/90 hover:text-white"
    >
      <Link href={href}>Être rappelé·e</Link>
    </Button>
  )
}
