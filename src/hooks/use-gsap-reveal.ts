'use client'

import { useEffect, useRef } from 'react'

export function useGsapReveal(delay = 0) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let gsapInstance: typeof import('gsap').gsap | null = null
    let scrollTriggerInstance: typeof import('gsap/ScrollTrigger').ScrollTrigger | null = null

    async function init() {
      const { gsap } = await import('gsap')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')

      gsapInstance = gsap
      scrollTriggerInstance = ScrollTrigger

      gsap.registerPlugin(ScrollTrigger)

      gsap.fromTo(
        el,
        { opacity: 0, y: 12 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          delay: delay / 1000,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 90%',
            toggleActions: 'play none none none',
          },
        }
      )
    }

    init()

    return () => {
      if (gsapInstance && scrollTriggerInstance && el) {
        scrollTriggerInstance.getAll().forEach((t) => {
          if (t.trigger === el) t.kill()
        })
      }
    }
  }, [delay])

  return ref
}
