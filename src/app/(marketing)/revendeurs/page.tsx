export const revalidate = 3600

import type { Metadata } from 'next'
import Link from 'next/link'
import { Section, Container } from '@/components/ui/section'
import { SITE_CONFIG } from '@/config/site'

const FAIRE_EMBED_URL = 'https://www.faire.com/embed/bw_2c49parae6'
const FAIRE_DIRECT_URL = 'https://mercimurphy.faire.com'

export const metadata: Metadata = {
  title: 'Revendeurs & grossistes — Catalogue wholesale',
  description:
    'Vous êtes une boutique, un concept-store ou un détaillant ? Découvrez le catalogue wholesale merci murphy® sur Faire : accessoires, friandises et soins premium pour chiens et chats.',
  alternates: {
    canonical: `${SITE_CONFIG.url}/revendeurs`,
  },
  openGraph: {
    title: 'Revendeurs merci murphy® — Catalogue wholesale sur Faire',
    description:
      'Catalogue professionnel pour revendeurs et concept-stores. Commandez en gros les essentiels bien-être chien & chat merci murphy® via Faire.',
    url: `${SITE_CONFIG.url}/revendeurs`,
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RevendeursPage() {
  return (
    <Section className="bg-cream">
      <Container className="max-w-4xl">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-terracotta-dark">
            Espace professionnels
          </p>
          <h1 className="mt-3 font-display text-3xl font-bold text-charcoal sm:text-4xl">
            Revendeurs & grossistes
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-charcoal/70 leading-relaxed">
            Vous êtes une boutique indépendante, un concept-store, un toiletteur ou un détaillant
            spécialisé ? Le catalogue wholesale merci murphy® est disponible sur Faire — la
            marketplace B2B de référence pour le commerce indépendant.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          <div className="rounded-lg border border-charcoal/10 bg-white/60 p-5">
            <p className="font-display text-base font-semibold text-charcoal">Paiement net 60</p>
            <p className="mt-2 text-sm text-charcoal/70">
              Payez 60 jours après réception de votre commande.
            </p>
          </div>
          <div className="rounded-lg border border-charcoal/10 bg-white/60 p-5">
            <p className="font-display text-base font-semibold text-charcoal">Retours gratuits</p>
            <p className="mt-2 text-sm text-charcoal/70">
              Première commande sans risque : retours offerts.
            </p>
          </div>
          <div className="rounded-lg border border-charcoal/10 bg-white/60 p-5">
            <p className="font-display text-base font-semibold text-charcoal">Sélection curée</p>
            <p className="mt-2 text-sm text-charcoal/70">
              Nos best-sellers chien & chat, prêts à rejoindre votre boutique.
            </p>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="font-display text-xl font-semibold text-charcoal">
            Parcourir le catalogue
          </h2>
          <p className="mt-2 text-sm text-charcoal/70">
            Connectez-vous ou créez un compte revendeur Faire pour voir les prix wholesale et
            commander.
          </p>
          <div className="mt-5 overflow-hidden rounded-lg border border-charcoal/10 bg-white">
            <iframe
              src={FAIRE_EMBED_URL}
              title="Catalogue wholesale merci murphy® sur Faire"
              loading="lazy"
              scrolling="no"
              className="mx-auto block h-[600px] w-full max-w-[900px] border-0"
            />
          </div>
          <p className="mt-4 text-center text-sm text-charcoal/60">
            L&apos;iframe ne s&apos;affiche pas ?{' '}
            <a
              href={`${FAIRE_DIRECT_URL}/?utm_source=mercimurphy.com&utm_medium=revendeurs-page&utm_campaign=wholesale`}
              target="_blank"
              rel="nofollow noopener noreferrer"
              className="text-terracotta-dark hover:underline"
            >
              Accéder directement à notre boutique Faire
            </a>
            .
          </p>
        </div>

        <div className="mt-14 rounded-lg bg-white/60 p-6 text-center">
          <h2 className="font-display text-xl font-semibold text-charcoal">
            Une question, un partenariat sur-mesure ?
          </h2>
          <p className="mt-2 text-charcoal/70">
            Pour les demandes spéciales, exclusivités territoriales ou collaborations,
            contactez-nous directement.
          </p>
          <Link
            href="/contact"
            className="mt-4 inline-block rounded-md bg-charcoal px-6 py-3 text-sm font-semibold text-cream transition-colors hover:bg-charcoal/85"
          >
            Nous contacter
          </Link>
        </div>
      </Container>
    </Section>
  )
}
