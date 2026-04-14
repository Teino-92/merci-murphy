import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { SITE_CONFIG } from '@/config/site'
import { cn, BLUR_PLACEHOLDER } from '@/lib/utils'

interface HeroProps {
  subtitle: string
  imageSrc?: string
  className?: string
}

export function Hero({ subtitle, imageSrc, className }: HeroProps) {
  return (
    <div className={cn('w-full overflow-hidden', className)} style={{ backgroundColor: '#B5A89A' }}>
      {/* Mobile — photo top, text below */}
      <div className="lg:hidden">
        {imageSrc && (
          <div className="relative w-full" style={{ height: '55vw', minHeight: '220px' }}>
            <Image
              src={imageSrc}
              alt="Merci Murphy"
              fill
              priority
              placeholder="blur"
              blurDataURL={BLUR_PLACEHOLDER}
              className="object-cover object-top"
              sizes="100vw"
            />
          </div>
        )}
        <div className="px-6 py-8" style={{ backgroundColor: '#B5A89A' }}>
          <div className="flex items-center gap-3 mb-4">
            <span className="block w-6 h-px bg-terracotta-dark flex-shrink-0" />
            <span className="text-[10px] font-semibold tracking-[0.18em] uppercase text-terracotta-dark">
              Vivre heureux avec son chien et son chat à Paris.
            </span>
          </div>
          <h1 className="font-display text-[7.5vw] font-normal leading-tight text-charcoal mb-4">
            Toilettage et spa,{' '}
            <em style={{ fontStyle: 'italic', color: '#8B5A3A' }}>crèche canine</em> et éducation
          </h1>
          <p
            className="text-sm leading-relaxed text-charcoal/60 mb-6 reveal-anim"
            style={{ animationDelay: '100ms', animationPlayState: 'running' }}
          >
            {subtitle}
          </p>
          <div
            className="flex flex-col gap-3 reveal-anim"
            style={{ animationDelay: '250ms', animationPlayState: 'running' }}
          >
            <Button
              asChild
              size="lg"
              className="w-full bg-terracotta-dark text-white hover:bg-terracotta-dark/90"
            >
              <Link href="/reservation">Prendre rendez-vous</Link>
            </Button>
            {SITE_CONFIG.phone && (
              <Button
                asChild
                size="lg"
                variant="ghost"
                className="w-full text-charcoal/60 hover:text-charcoal"
              >
                <a href={`tel:${SITE_CONFIG.phone}`}>Nous appeler →</a>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Desktop — split */}
      <div className="hidden lg:grid lg:grid-cols-[48%_52%] lg:min-h-[88vh]">
        <div className="relative flex flex-col justify-center px-14 py-14">
          <div>
            <div className="flex items-center gap-3 mb-7">
              <span className="block w-7 h-px bg-terracotta-dark flex-shrink-0" />
              <span
                className="text-[13px] font-semibold tracking-[0.18em] uppercase font-sans"
                style={{ color: '#8B5A3A' }}
              >
                Vivre heureux avec son chien et son chat à Paris.
              </span>
            </div>
            <h1 className="font-display text-[3.4vw] font-normal leading-[1.08] text-charcoal tracking-[-0.02em]">
              Toilettage et spa,{' '}
              <em className="not-italic" style={{ fontStyle: 'italic', color: '#8B5A3A' }}>
                crèche canine
              </em>{' '}
              et éducation
            </h1>
          </div>

          <div className="mt-10">
            <div
              className="w-12 h-px mb-5"
              style={{ background: 'linear-gradient(to right, #C4845A, transparent)' }}
            />
            <p
              className="text-[18px] leading-[1.7] text-charcoal/60 mb-8 max-w-[400px] font-sans reveal-anim"
              style={{ animationDelay: '100ms', animationPlayState: 'running' }}
            >
              {subtitle}
            </p>
            <div
              className="flex items-center gap-6 reveal-anim"
              style={{ animationDelay: '250ms', animationPlayState: 'running' }}
            >
              <Button
                asChild
                size="lg"
                className="bg-terracotta-dark text-white hover:bg-terracotta-dark/90"
              >
                <Link href="/reservation">Prendre rendez-vous</Link>
              </Button>
              {SITE_CONFIG.phone && (
                <a
                  href={`tel:${SITE_CONFIG.phone}`}
                  className="text-[13px] text-charcoal/50 hover:text-charcoal transition-colors font-sans after:content-['→'] after:ml-1.5 after:text-terracotta-dark"
                >
                  Nous appeler
                </a>
              )}
            </div>
          </div>

          <div
            className="absolute right-0 top-12 bottom-12 w-px"
            style={{
              background:
                'linear-gradient(to bottom, transparent, #e8dece 20%, #e8dece 80%, transparent)',
            }}
          />
        </div>

        {imageSrc && (
          <div className="relative overflow-hidden" style={{ backgroundColor: '#B5A89A' }}>
            <Image
              src={imageSrc}
              alt="Merci Murphy — boutique intérieur"
              fill
              priority
              placeholder="blur"
              blurDataURL={BLUR_PLACEHOLDER}
              className="object-cover object-center"
              sizes="52vw"
            />
          </div>
        )}
      </div>
    </div>
  )
}
