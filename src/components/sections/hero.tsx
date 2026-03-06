'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { Button } from '@/components/ui/button'
import { SITE_CONFIG } from '@/config/site'
import { cn } from '@/lib/utils'

interface HeroProps {
  title: string
  subtitle: string
  imageSrc?: string
  className?: string
}

export function Hero({ title, subtitle, imageSrc, className }: HeroProps) {
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
    tl.fromTo(titleRef.current, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.9 })
      .fromTo(
        subtitleRef.current,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.7 },
        '-=0.5'
      )
      .fromTo(ctaRef.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.4')
  }, [])

  return (
    <div className={cn('relative min-h-[85vh] w-full overflow-hidden bg-charcoal', className)}>
      {imageSrc && (
        <Image
          src={imageSrc}
          alt="Merci Murphy"
          fill
          priority
          className="object-cover opacity-60"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-charcoal/20 to-transparent" />

      <div className="relative flex h-full min-h-[85vh] flex-col items-center justify-center px-4 text-center sm:px-6 lg:px-8">
        <h1
          ref={titleRef}
          className="font-display text-4xl font-bold leading-tight text-cream sm:text-5xl lg:text-6xl"
          style={{ opacity: 0 }}
        >
          {title}
        </h1>
        <p
          ref={subtitleRef}
          className="mt-6 max-w-2xl text-lg leading-relaxed text-cream/80"
          style={{ opacity: 0 }}
        >
          {subtitle}
        </p>
        <div ref={ctaRef} className="mt-8 flex flex-col gap-3 sm:flex-row" style={{ opacity: 0 }}>
          <Button asChild size="lg" className="bg-terracotta text-white hover:bg-terracotta/90">
            <Link href="/reservation">Prendre rendez-vous</Link>
          </Button>
          {SITE_CONFIG.phone && (
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-cream text-cream hover:bg-cream hover:text-charcoal"
            >
              <a href={`tel:${SITE_CONFIG.phone}`}>Nous appeler</a>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
