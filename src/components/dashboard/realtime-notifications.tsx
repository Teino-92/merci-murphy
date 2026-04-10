'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase'

function playChime() {
  try {
    const ctx = new (
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    )()
    const now = ctx.currentTime

    // Two-note chime: C5 then E5
    const notes = [523.25, 659.25]
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0, now + i * 0.18)
      gain.gain.linearRampToValueAtTime(0.18, now + i * 0.18 + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.18 + 0.5)
      osc.start(now + i * 0.18)
      osc.stop(now + i * 0.18 + 0.5)
    })
  } catch {
    // AudioContext not available
  }
}

function notify(title: string, body: string) {
  playChime()
  if (typeof Notification === 'undefined') return
  if (Notification.permission === 'granted') {
    new Notification(title, { body, icon: '/favicon.ico' })
  } else if (Notification.permission === 'default') {
    Notification.requestPermission().then((perm) => {
      if (perm === 'granted') new Notification(title, { body, icon: '/favicon.ico' })
    })
  }
}

export function RealtimeNotifications() {
  const mounted = useRef(false)
  const router = useRouter()

  useEffect(() => {
    if (mounted.current) return
    mounted.current = true

    // Request notification permission on mount (silent — no prompt if already decided)
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    const supabase = createSupabaseBrowserClient()

    const channel = supabase
      .channel('dashboard-notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'leads' },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (payload: { new: Record<string, any> }) => {
          const lead = payload.new
          notify(
            'Nouvelle demande',
            `${(lead.nom as string | undefined) ?? "Quelqu'un"} a fait une demande de ${(lead.service as string | undefined) ?? 'service'}.`
          )
          router.refresh()
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'visits' },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (payload: { new: Record<string, any> }) => {
          const visit = payload.new
          notify(
            'Nouvelle réservation',
            `Un rendez-vous ${(visit.service as string | undefined) ?? ''} le ${(visit.date as string | undefined) ?? ''} vient d'être créé.`
          )
          router.refresh()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [router])

  return null
}
