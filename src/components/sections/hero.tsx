'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
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
  return (
    <div className={cn('w-full bg-charcoal overflow-hidden', className)}>
      {/* Mobile — full-bleed image with text overlay */}
      {imageSrc && (
        <div className="relative lg:hidden w-full" style={{ aspectRatio: '3017/3278' }}>
          <Image
            src={imageSrc}
            alt="Merci Murphy"
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/20 to-transparent" />
          <div className="absolute bottom-0 left-0 px-8 pb-12 max-w-lg">
            <h1 className="font-display text-4xl font-bold leading-tight text-cream">{title}</h1>
            <motion.p
              className="mt-4 text-base leading-relaxed text-cream/80"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
            >
              {subtitle}
            </motion.p>
            <motion.div
              className="mt-6 flex flex-col gap-3"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: 0.25 }}
            >
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
            </motion.div>
          </div>
        </div>
      )}

      {/* Desktop — split layout */}
      <div className="hidden lg:grid lg:grid-cols-[1fr_1.4fr] min-h-[85vh]">
        {/* Left — text */}
        <div className="flex items-center px-14">
          <div>
            <h1 className="font-display text-6xl font-bold leading-tight text-cream">{title}</h1>
            <motion.p
              className="mt-6 text-lg leading-relaxed text-cream/80 max-w-md"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
            >
              {subtitle}
            </motion.p>
            <motion.div
              className="mt-8 flex gap-3"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: 0.25 }}
            >
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
            </motion.div>
          </div>
        </div>

        {/* Right — full image, rounded corners */}
        {imageSrc && (
          <div className="flex items-stretch">
            <div className="relative w-full overflow-hidden rounded-tl-3xl rounded-bl-3xl">
              <Image
                src={imageSrc}
                alt="Merci Murphy"
                width={3017}
                height={3278}
                priority
                className="w-full h-auto object-contain"
                sizes="60vw"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
