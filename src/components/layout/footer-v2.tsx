import Image from 'next/image'
import Link from 'next/link'

import { NewsletterForm } from '@/components/forms/newsletter-form'
import { SITE_CONFIG } from '@/config/site'
import { cn } from '@/lib/utils'
import { noOrphan } from '@/lib/typo'

export type FooterVariant = 'taupe' | 'ardoise'

interface FooterV2Props {
  variant: FooterVariant
  showBlog?: boolean
}

interface FooterLink {
  label: string
  href: string
}

const SHOP_LINKS: FooterLink[] = [
  { label: 'merci murphy®', href: '/shop?collection=petlovers' },
  { label: 'Chien', href: '/shop?collection=chien' },
  { label: 'Chat', href: '/shop?collection=chat' },
  { label: 'Petshop', href: '/shop?collection=petshop' },
]

const SERVICE_LINKS: FooterLink[] = [
  { label: 'Toilettage', href: '/services/le-toilettage-maison-poilus-r' },
  { label: 'Bains', href: '/services/le-bain-en-libre-service-maison-poilus-r' },
  { label: 'Balnéo', href: '/services/balneo-maison-poilus-r' },
  {
    label: 'Massage',
    href: '/services/le-massage-bien-etre-maison-poilus-r-and-le-petit-nenuphar',
  },
  { label: 'Crèche', href: '/services/la-creche' },
  { label: 'Éducation', href: '/services/l-education' },
  { label: 'Ostéopathie', href: '/services/l-osteopathie' },
  { label: 'Toilettage par race', href: '/toilettage' },
  { label: 'Toiletteur chien Paris', href: '/toilettage-chien-paris' },
  { label: 'Toiletteur chat Paris', href: '/toilettage-chat-paris' },
]

const LEGAL_LINKS: FooterLink[] = [
  { label: 'Mentions légales', href: '/mentions-legales' },
  { label: 'CGV', href: '/cgv' },
  { label: 'Confidentialité', href: '/confidentialite' },
]

const PAYMENTS = ['visa', 'mastercard', 'amex', 'apple-pay', 'paypal', 'shop-pay', 'google-pay']

// Habillage du formulaire newsletter depuis le conteneur : coins vifs, hauteur
// alignée sur les autres formulaires du refresh. La logique du formulaire ne change pas.
const NEWSLETTER_SKIN =
  '[&_input]:h-12 [&_input]:w-full [&_input]:rounded-none [&_input]:text-base sm:[&_input]:w-80 [&_button]:h-12 [&_button]:rounded-none [&_button]:px-6 [&_button]:text-[15px]'

const TONE = {
  taupe: {
    surface: 'bg-[#B5A89A] text-charcoal',
    rule: 'border-charcoal/25',
    link: 'text-charcoal/80 hover:text-charcoal',
    muted: 'text-charcoal/70',
    focus: 'focus-visible:outline-charcoal',
    button:
      '[&_button]:bg-charcoal [&_button]:text-white [&_button:hover]:bg-charcoal/85 [&_p]:text-charcoal',
    art: 'brightness-0 opacity-70',
  },
  ardoise: {
    surface: 'bg-[#4F6072] text-cream',
    rule: 'border-cream/25',
    link: 'text-cream/85 hover:text-cream',
    muted: 'text-cream/75',
    focus: 'focus-visible:outline-cream',
    button:
      '[&_button]:bg-cream [&_button]:text-charcoal [&_button:hover]:bg-white [&_p]:text-cream',
    art: 'brightness-0 invert opacity-80',
  },
} as const

type Tone = (typeof TONE)[FooterVariant]

function linkClass(tone: Tone) {
  return cn(
    'rounded-sm underline decoration-transparent decoration-1 underline-offset-4 transition-colors hover:decoration-current focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
    tone.link,
    tone.focus
  )
}

function LinkColumn({ title, links, tone }: { title: string; links: FooterLink[]; tone: Tone }) {
  return (
    <div className={cn('border-t pt-5', tone.rule)}>
      <p className="font-display text-lg italic">{noOrphan(title)}</p>
      <ul className="mt-4 space-y-2.5 text-[15px]">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className={linkClass(tone)}>
              {noOrphan(link.label)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

function ContactLines({ tone }: { tone: Tone }) {
  return (
    <ul className="space-y-2.5 text-[15px]">
      <li className={tone.link.split(' ')[0]}>{noOrphan(SITE_CONFIG.address)}</li>
      <li>
        <a href={`tel:${SITE_CONFIG.phone.replace(/\s/g, '')}`} className={linkClass(tone)}>
          {noOrphan(SITE_CONFIG.phone)}
        </a>
      </li>
      <li>
        <a href={`mailto:${SITE_CONFIG.email}`} className={linkClass(tone)}>
          {noOrphan(SITE_CONFIG.email)}
        </a>
      </li>
      <li>
        <a
          href={SITE_CONFIG.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass(tone)}
        >
          Instagram
        </a>
      </li>
    </ul>
  )
}

function BottomBar({ tone }: { tone: Tone }) {
  return (
    <div
      className={cn(
        'mt-14 flex flex-col gap-6 border-t pt-6 text-sm lg:flex-row lg:items-center lg:justify-between',
        tone.rule,
        tone.muted
      )}
    >
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <span>© {new Date().getFullYear()} merci murphy®</span>
        {LEGAL_LINKS.map((link) => (
          <Link key={link.href} href={link.href} className={linkClass(tone)}>
            {link.label}
          </Link>
        ))}
        <span>
          Made by{' '}
          <a
            href="https://matteogarbugli.com"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(linkClass(tone), 'decoration-current')}
          >
            Matteo Garbugli
          </a>
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
        <ul className="flex flex-wrap items-center gap-2">
          {PAYMENTS.map((name) => (
            <li key={name}>
              <Image
                src={`/payments/${name}.svg`}
                alt={name.replace('-', ' ')}
                width={38}
                height={24}
                className="h-6 w-auto"
              />
            </li>
          ))}
        </ul>
        <a href="#" className={cn(linkClass(tone), 'decoration-current')}>
          Haut de page
        </a>
      </div>
    </div>
  )
}

/**
 * Footer v2 — deux propositions pour le refresh.
 * « taupe » : la newsletter ouvre le pied de page, puis quatre colonnes à filets.
 * « ardoise » : la signature de la maison à gauche, les liens à droite, newsletter discrète.
 * Liens identiques au footer actuel (maillage intact), sans titres Hn.
 */
export function FooterV2({ variant, showBlog = false }: FooterV2Props) {
  const tone = TONE[variant]
  const navLinks: FooterLink[] = [
    ...SITE_CONFIG.nav,
    ...(showBlog ? [{ label: 'Blog', href: '/blog' }] : []),
    ...SITE_CONFIG.secondaryNav,
  ]

  if (variant === 'taupe') {
    return (
      <footer className={tone.surface}>
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
            <p className="font-display text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">
              Restez informé.e
            </p>
            <div className={cn(NEWSLETTER_SKIN, tone.button)}>
              <NewsletterForm />
            </div>
          </div>

          <div className="mt-16 grid grid-cols-2 gap-x-8 gap-y-12 lg:grid-cols-4">
            <LinkColumn title="Navigation" links={navLinks} tone={tone} />
            <LinkColumn title="Éco-shop" links={SHOP_LINKS} tone={tone} />
            <LinkColumn title="Services" links={SERVICE_LINKS} tone={tone} />
            <div className={cn('col-span-2 border-t pt-5 lg:col-span-1', tone.rule)}>
              <p className="font-display text-lg italic">Nous trouver</p>
              <div className="mt-4">
                <ContactLines tone={tone} />
              </div>
            </div>
          </div>

          <div className="mt-16 flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Image
                src="/logo.avif"
                alt="merci murphy®"
                width={500}
                height={72}
                className="h-9 w-auto opacity-80 brightness-0"
              />
              <p className={cn('mt-4 max-w-xs text-[15px]', tone.muted)}>
                Connecting cats &amp; dogs wellness and city lifestyle.
              </p>
            </div>
            <Image
              src="/chien-chat-white.png"
              alt=""
              width={916}
              height={478}
              className={cn('h-24 w-auto self-start sm:self-auto lg:h-28', tone.art)}
            />
          </div>

          <BottomBar tone={tone} />
        </div>
      </footer>
    )
  }

  return (
    <footer className={tone.surface}>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-14 xl:grid-cols-12 xl:gap-12">
          <div className="xl:col-span-5">
            <Image
              src="/logo.avif"
              alt="merci murphy®"
              width={500}
              height={72}
              className="h-9 w-auto brightness-0 invert"
            />
            <p className="mt-8 max-w-md font-display text-3xl italic leading-[1.15] sm:text-4xl">
              Connecting cats &amp; dogs wellness and city lifestyle.
            </p>
            <div className="mt-10">
              <ContactLines tone={tone} />
            </div>
            <Image
              src="/chien-chat-white.png"
              alt=""
              width={916}
              height={478}
              className={cn('mt-12 h-24 w-auto lg:h-28', tone.art)}
            />
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-3 xl:col-span-7">
            <LinkColumn title="Navigation" links={navLinks} tone={tone} />
            <LinkColumn title="Éco-shop" links={SHOP_LINKS} tone={tone} />
            <LinkColumn title="Services" links={SERVICE_LINKS} tone={tone} />
          </div>
        </div>

        <div
          className={cn(
            'mt-14 flex flex-col gap-5 border-t pt-8 xl:flex-row xl:items-center xl:justify-between',
            tone.rule
          )}
        >
          <p className="font-display text-2xl">Restez informé.e</p>
          <div className={cn(NEWSLETTER_SKIN, tone.button)}>
            <NewsletterForm />
          </div>
        </div>

        <BottomBar tone={tone} />
      </div>
    </footer>
  )
}
