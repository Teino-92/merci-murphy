import Link from 'next/link'
import Image from 'next/image'
import { SITE_CONFIG } from '@/config/site'
import { Container } from '@/components/ui/section'
import { NewsletterForm } from '@/components/forms/newsletter-form'

export function Footer() {
  return (
    <footer className="border-t border-charcoal/10 bg-charcoal text-cream">
      {/* Newsletter band */}
      <div className="border-b border-cream/10">
        <Container className="py-5 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-display text-base font-semibold shrink-0">Restez informé(e)</p>
            <div className="w-full sm:max-w-xs">
              <NewsletterForm />
            </div>
          </div>
        </Container>
      </div>

      <Container className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Logo + tagline */}
          <div className="col-span-2 sm:col-span-2 lg:col-span-1">
            <Image
              src="/logo.avif"
              alt="Merci Murphy"
              width={120}
              height={40}
              className="h-9 w-auto brightness-0 invert"
            />
            <p className="mt-3 text-sm text-cream/60">
              Boutique premium de bien-être pour chiens à Paris.
            </p>
            <Image
              src="/chien-chat.webp"
              alt="Chien et chat Merci Murphy"
              width={200}
              height={100}
              className="mt-4 w-40 h-auto"
              style={{ filter: 'grayscale(1) invert(1)', mixBlendMode: 'screen' }}
            />
          </div>

          {/* Navigation */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-cream/40">
              Navigation
            </p>
            <ul className="mt-4 space-y-2">
              {SITE_CONFIG.nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-cream/70 transition-colors hover:text-cream"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Boutique */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-cream/40">
              Boutique
            </p>
            <ul className="mt-4 space-y-2">
              {[
                { label: 'Chien', handle: 'chien' },
                { label: 'Petlovers', handle: 'petlovers' },
                { label: 'Chat', handle: 'chat' },
                { label: 'Petshop', handle: 'petshop' },
              ].map((cat) => (
                <li key={cat.handle}>
                  <Link
                    href={`/shop?collection=${cat.handle}`}
                    className="text-sm text-cream/70 transition-colors hover:text-cream"
                  >
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-cream/40">
              Services
            </p>
            <ul className="mt-4 space-y-2">
              {['Toilettage', 'Bains', 'Crèche', 'Éducation', 'Ostéopathie'].map((s) => (
                <li key={s}>
                  <Link
                    href={`/services/${s.toLowerCase().replace('é', 'e')}`}
                    className="text-sm text-cream/70 transition-colors hover:text-cream"
                  >
                    {s}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 border-t border-cream/10 pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Legal links */}
            <p className="text-xs text-cream/40">
              © {new Date().getFullYear()} Merci Murphy.{' '}
              <Link href="/mentions-legales" className="hover:text-cream/60">
                Mentions légales
              </Link>{' '}
              ·{' '}
              <Link href="/cgv" className="hover:text-cream/60">
                CGV
              </Link>{' '}
              ·{' '}
              <Link href="/confidentialite" className="hover:text-cream/60">
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
                  className="h-6 w-auto"
                />
              ))}
            </div>
          </div>
        </div>
      </Container>
    </footer>
  )
}
