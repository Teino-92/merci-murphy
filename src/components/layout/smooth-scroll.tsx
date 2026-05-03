'use client'

import { useEffect } from 'react'

export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return

    let cancelled = false
    let cleanup: (() => void) | null = null

    const start = async () => {
      const { default: Lenis } = await import('lenis')
      if (cancelled) return
      const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      })
      let rafId = 0
      const raf = (time: number) => {
        lenis.raf(time)
        rafId = requestAnimationFrame(raf)
      }
      rafId = requestAnimationFrame(raf)
      cleanup = () => {
        cancelAnimationFrame(rafId)
        lenis.destroy()
      }
    }

    const idle = (cb: () => void) =>
      'requestIdleCallback' in window
        ? (window as Window & typeof globalThis).requestIdleCallback(cb)
        : setTimeout(cb, 200)
    idle(start)

    return () => {
      cancelled = true
      cleanup?.()
    }
  }, [])

  return null
}
