import Link from 'next/link'
import Image from 'next/image'
import { SITE_CONFIG } from '@/config/site'
import { Container } from '@/components/ui/section'
import { NewsletterForm } from '@/components/forms/newsletter-form'

export function Footer() {
  return (
    <footer className="text-charcoal" style={{ backgroundColor: '#B5A89A' }}>
      {/* Newsletter band */}
      <div className="px-4 sm:px-6 lg:px-8">
        <Container className="py-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <p className="font-display text-base font-semibold shrink-0 lg:w-48">
              Restez informé(e)
            </p>
            <div className="flex-1 flex lg:justify-end">
              <NewsletterForm />
            </div>
          </div>
        </Container>
      </div>

      <div className="px-8 sm:px-12 lg:px-20">
        <div className="border-t-2 border-charcoal/20" />
      </div>
      <div className="px-4 sm:px-6 lg:px-8">
        <Container className="py-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            {/* Logo + tagline */}
            <div>
              <Image
                src="/logo.avif"
                alt="merci murphy®"
                width={280}
                height={96}
                loading="lazy"
                className="h-9 w-auto brightness-0"
              />
              <p className="mt-3 text-sm text-charcoal/60">
                Connecting pets (cats & dogs) wellness and city lifestyle.
              </p>
            </div>

            {/* Center 3 cols */}
            <div className="grid grid-cols-3 gap-6 lg:flex lg:gap-16">
              {/* Navigation */}
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-charcoal/60">
                  Navigation
                </p>
                <ul className="mt-4 space-y-2">
                  {SITE_CONFIG.nav.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="text-sm text-charcoal/70 transition-colors hover:text-charcoal"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Boutique */}
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-charcoal/60">
                  Éco-shop
                </p>
                <ul className="mt-4 space-y-2">
                  {[
                    { label: 'merci murphy®', handle: 'petlovers' },
                    { label: 'Chien', handle: 'chien' },
                    { label: 'Chat', handle: 'chat' },
                    { label: 'Petshop', handle: 'petshop' },
                  ].map((cat) => (
                    <li key={cat.handle}>
                      <Link
                        href={`/shop?collection=${cat.handle}`}
                        className="text-sm text-charcoal/70 transition-colors hover:text-charcoal"
                      >
                        {cat.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Services */}
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-charcoal/60">
                  Services
                </p>
                <ul className="mt-4 space-y-2">
                  {['Toilettage', 'Bains', 'Massage', 'Crèche', 'Éducation', 'Ostéopathie'].map(
                    (s) => (
                      <li key={s}>
                        <Link
                          href={`/services/${s.toLowerCase().replace('é', 'e')}`}
                          className="text-sm text-charcoal/70 transition-colors hover:text-charcoal"
                        >
                          {s}
                        </Link>
                      </li>
                    )
                  )}
                </ul>
              </div>
            </div>

            {/* Dog & cat illustration */}
            <div className="flex items-start justify-start">
              <Image
                src="/chien-chat-white.png"
                alt="Chien et chat merci murphy®"
                width={200}
                height={100}
                loading="lazy"
                className="w-36 h-auto brightness-0 opacity-70"
              />
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-8 pt-6" style={{ borderTop: '2px solid rgba(26,26,26,0.15)' }}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              {/* Legal links */}
              <p className="text-xs text-charcoal/60">
                © {new Date().getFullYear()} merci murphy®.{' '}
                <Link href="/mentions-legales" className="hover:text-charcoal">
                  Mentions légales
                </Link>{' '}
                ·{' '}
                <Link href="/cgv" className="hover:text-charcoal">
                  CGV
                </Link>{' '}
                ·{' '}
                <Link href="/confidentialite" className="hover:text-charcoal">
                  Confidentialité
                </Link>
              </p>

              {/* Payment icons */}
              <div className="flex min-h-[24px] items-center gap-1.5 flex-wrap">
                {[
                  { src: '/payments/visa.svg', alt: 'Visa' },
                  { src: '/payments/mastercard.svg', alt: 'Mastercard' },
                  { src: '/payments/amex.svg', alt: 'American Express' },
                  { src: '/payments/apple-pay.svg', alt: 'Apple Pay' },
                  { src: '/payments/paypal.svg', alt: 'PayPal' },
                  { src: '/payments/shop-pay.svg', alt: 'Shop Pay' },
                  { src: '/payments/google-pay.svg', alt: 'Google Pay' },
                ].map((pm) => (
                  <Image
                    key={pm.alt}
                    src={pm.src}
                    alt={pm.alt}
                    width={38}
                    height={24}
                    loading="lazy"
                    className="h-6 w-auto"
                  />
                ))}
              </div>
            </div>
          </div>
        </Container>
      </div>
    </footer>
  )
}
