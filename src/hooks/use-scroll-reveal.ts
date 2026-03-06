'use client'

import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface ScrollRevealOptions {
  y?: number
  duration?: number
  stagger?: number
  delay?: number
}

/**
 * Fade-up reveal on scroll for a container ref.
 * Pass `childSelector` to animate children individually (stagger).
 */
export function useScrollReveal<T extends HTMLElement>(
  childSelector?: string,
  options: ScrollRevealOptions = {}
): RefObject<T> {
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const { y = 30, duration = 0.7, stagger = 0.1, delay = 0 } = options

    const targets = childSelector ? el.querySelectorAll(childSelector) : [el]

    const ctx = gsap.context(() => {
      gsap.fromTo(
        targets,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration,
          delay,
          stagger,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      )
    }, el)

    return () => ctx.revert()
  }, [childSelector, options.y, options.duration, options.stagger, options.delay])

  return ref
}
