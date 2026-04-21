'use client'

import Image from 'next/image'
import { useEffect, useRef } from 'react'

type Icon = {
  src: string
  width: number
  style: React.CSSProperties
  from: { x: number; y: number; rotate: number }
  to: { rotate: number; opacity: number }
  float: { duration: number; delay: number }
  position: React.CSSProperties
}

const ICONS: Icon[] = [
  {
    src: '/icons/scissors.png',
    width: 110,
    position: { top: '0%', left: '0%' },
    from: { x: -50, y: -50, rotate: -40 },
    to: { rotate: -20, opacity: 0.35 },
    float: { duration: 4.2, delay: 0 },
    style: {},
  },
  {
    src: '/icons/star.png',
    width: 90,
    position: { top: '2%', right: '2%' },
    from: { x: 50, y: -50, rotate: 30 },
    to: { rotate: 10, opacity: 0.32 },
    float: { duration: 5.1, delay: 0.3 },
    style: {},
  },
  {
    src: '/icons/heart.png',
    width: 115,
    position: { top: '38%', right: '8%' },
    from: { x: 50, y: 0, rotate: 10 },
    to: { rotate: -8, opacity: 0.3 },
    float: { duration: 5.5, delay: 0.6 },
    style: {},
  },
  {
    src: '/icons/comb.png',
    width: 86,
    position: { bottom: '4%', left: '1%' },
    from: { x: -50, y: 50, rotate: -5 },
    to: { rotate: 15, opacity: 0.3 },
    float: { duration: 4.8, delay: 0.2 },
    style: {},
  },
  {
    src: '/icons/scissors.png',
    width: 60,
    position: { bottom: '2%', right: '-2%' },
    from: { x: 50, y: 50, rotate: 5 },
    to: { rotate: 25, opacity: 0.28 },
    float: { duration: 3.7, delay: 0.5 },
    style: { transform: 'scaleX(-1)' },
  },
  {
    // Étoile gauche — remontée
    src: '/icons/star.png',
    width: 54,
    position: { top: '38%', left: '22%' },
    from: { x: -50, y: 0, rotate: -30 },
    to: { rotate: -12, opacity: 0.25 },
    float: { duration: 6, delay: 0.8 },
    style: {},
  },
  {
    // Cœur gauche — entre étoile et peigne, loin du slider
    src: '/icons/heart.png',
    width: 72,
    position: { bottom: '32%', left: '-9%' },
    from: { x: -50, y: 30, rotate: 15 },
    to: { rotate: 8, opacity: 0.28 },
    float: { duration: 4.6, delay: 0.9 },
    style: {},
  },
  {
    // Peigne droite — entre cœur et ciseaux bas droite, proche du slider
    src: '/icons/comb.png',
    width: 70,
    position: { top: '62%', right: '22%' },
    from: { x: 50, y: 20, rotate: -20 },
    to: { rotate: -10, opacity: 0.28 },
    float: { duration: 5.2, delay: 0.4 },
    style: {},
  },
]

export function FloatingIcons() {
  const refs = useRef<(HTMLSpanElement | null)[]>([])

  useEffect(() => {
    let gsapInstance: typeof import('gsap').gsap | null = null

    async function init() {
      const { gsap } = await import('gsap')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)
      gsapInstance = gsap

      refs.current.forEach((el, i) => {
        if (!el) return
        const icon = ICONS[i]

        gsap.fromTo(
          el,
          { opacity: 0, x: icon.from.x, y: icon.from.y, rotate: icon.from.rotate },
          {
            opacity: icon.to.opacity,
            x: 0,
            y: 0,
            rotate: icon.to.rotate,
            duration: 0.8,
            delay: icon.float.delay,
            ease: 'back.out(1.4)',
            scrollTrigger: {
              trigger: el,
              start: 'top 95%',
              toggleActions: 'play none none none',
            },
            onComplete: () => {
              gsap.to(el, {
                y: -8,
                duration: icon.float.duration / 2,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
                delay: icon.float.delay,
              })
            },
          }
        )
      })
    }

    init()

    const els = refs.current
    return () => {
      if (gsapInstance) {
        gsapInstance.killTweensOf(els)
      }
    }
  }, [])

  return (
    <>
      {ICONS.map((icon, i) => (
        <span
          key={i}
          ref={(el) => {
            refs.current[i] = el
          }}
          className="pointer-events-none absolute select-none"
          style={{ ...icon.position, opacity: 0 }}
          aria-hidden
        >
          <Image src={icon.src} alt="" width={icon.width} height={icon.width} style={icon.style} />
        </span>
      ))}
    </>
  )
}
