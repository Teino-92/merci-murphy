'use client'

import { useRef, useState } from 'react'

export type AntiSpamPayload = {
  /** Honeypot field — must stay empty. Bots fill it because it exists in the DOM. */
  website: string
  /** Milliseconds elapsed between form mount and submission. */
  elapsedMs: number
}

/**
 * Client-side bot deterrents for public forms: a hidden honeypot field and a
 * mount-to-submit timer. Both values are re-validated server-side.
 */
export function useAntiSpam() {
  const [website, setWebsite] = useState('')
  const mountedAt = useRef(Date.now())

  const getPayload = (): AntiSpamPayload => ({
    website,
    elapsedMs: Date.now() - mountedAt.current,
  })

  /** Props for the hidden input. Render it inside the form, before the submit button. */
  const honeypotProps = {
    type: 'text' as const,
    name: 'website',
    tabIndex: -1,
    autoComplete: 'off',
    'aria-hidden': true,
    value: website,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setWebsite(e.target.value),
    style: {
      position: 'absolute' as const,
      width: '1px',
      height: '1px',
      padding: 0,
      margin: '-1px',
      overflow: 'hidden',
      clip: 'rect(0,0,0,0)',
      whiteSpace: 'nowrap' as const,
      border: 0,
    },
  }

  return { getPayload, honeypotProps }
}
