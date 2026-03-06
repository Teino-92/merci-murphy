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
        <Container className="py-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-display text-base font-semibold shrink-0">Restez informé(e)</p>
            <div className="w-full sm:max-w-xs">
              <NewsletterForm />
            </div>
          </div>
        </Container>
      </div>

      <Container className="py-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
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
          </div>

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

          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-cream/40">Contact</p>
            <ul className="mt-4 space-y-2 text-sm text-cream/70">
              {SITE_CONFIG.phone && <li>{SITE_CONFIG.phone}</li>}
              {SITE_CONFIG.email && <li>{SITE_CONFIG.email}</li>}
              {SITE_CONFIG.address && <li>{SITE_CONFIG.address}</li>}
              <li>
                <a
                  href={SITE_CONFIG.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-cream"
                >
                  Instagram
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-cream/10 pt-6 text-center text-xs text-cream/40">
          <p>
            © {new Date().getFullYear()} Merci Murphy.{' '}
            <Link href="/mentions-legales" className="hover:text-cream/60">
              Mentions légales
            </Link>{' '}
            ·{' '}
            <Link href="/confidentialite" className="hover:text-cream/60">
              Politique de confidentialité
            </Link>
          </p>
        </div>
      </Container>
    </footer>
  )
}
