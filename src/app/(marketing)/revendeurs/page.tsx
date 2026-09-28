export const revalidate = 3600

import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Section, Container } from '@/components/ui/section'
import { RevendeurForm } from '@/components/forms/revendeur-form'
import { SITE_CONFIG } from '@/config/site'

const FAIRE_EMBED_URL = 'https://www.faire.com/embed/bw_2c49parae6'
const FAIRE_DIRECT_URL = 'https://mercimurphy.faire.com'
const FAIRE_UTM = '?utm_source=mercimurphy.com&utm_medium=revendeurs-page&utm_campaign=wholesale'

export const metadata: Metadata = {
  title: 'Devenir revendeur merci murphy® : fournisseur chien & chat pour boutiques',
  description:
    'Boutique, concept-store, toiletteur ou animalerie ? Référencez merci murphy® : soins, accessoires et friandises chien & chat testés dans notre propre boutique parisienne. Paiement net 60, retours offerts sur la première commande.',
  keywords: [
    'grossiste accessoires chien',
    'fournisseur produits chien',
    'revendeur produits chien',
    'wholesale chien France',
    'fournisseur toiletteur',
    'marque chien pour boutique',
  ],
  alternates: {
    canonical: `${SITE_CONFIG.url}/revendeurs`,
  },
  openGraph: {
    title: 'Devenir revendeur merci murphy® | Espace professionnels',
    description:
      'Référencez une marque chien & chat déjà testée en boutique. Catalogue wholesale sur Faire : net 60, retours offerts sur la première commande.',
    url: `${SITE_CONFIG.url}/revendeurs`,
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
}

const FAQ = [
  {
    q: 'Faut-il un numéro SIRET pour devenir revendeur merci murphy® ?',
    a: 'Oui. Le catalogue wholesale est réservé aux professionnels enregistrés : boutiques, concept-stores, toiletteurs, animaleries et e-commerces. Un numéro SIRET (ou son équivalent européen) est demandé à l’ouverture du compte, que vous passiez par Faire ou par notre formulaire direct.',
  },
  {
    q: 'Suis-je obligé de passer par Faire pour commander ?',
    a: 'Non. Faire est la voie la plus simple : compte gratuit, paiement à 60 jours et retours offerts sur la première commande. Mais vous pouvez aussi nous écrire directement via le formulaire de cette page, notamment pour un partenariat sur-mesure ou si vous ne souhaitez pas créer de compte Faire.',
  },
  {
    q: 'Que se passe-t-il si les produits ne se vendent pas ?',
    a: 'Sur votre première commande passée via Faire, les retours sont gratuits. Vous testez la marque en rayon sans immobiliser de trésorerie : si l’assortiment ne trouve pas son public chez vous, vous renvoyez les invendus.',
  },
  {
    q: 'Acceptez-vous les toiletteurs et salons sans boutique ?',
    a: 'Oui. Les salons de toilettage font partie de nos profils revendeurs, avec ou sans espace de vente dédié. Un corner de quelques références en caisse suffit à démarrer. C’est d’ailleurs la configuration que nous connaissons le mieux, puisque nous la pratiquons nous-mêmes à Paris.',
  },
  {
    q: 'Quel est le minimum de commande pour un revendeur ?',
    a: 'Les conditions de commande sont affichées directement sur notre catalogue Faire, qui fait foi. Pour un projet particulier (corner, volumes importants, assortiment sur-mesure), écrivez-nous via le formulaire : nous vous répondons sous 48h ouvrées avec des conditions adaptées.',
  },
  {
    q: 'Puis-je obtenir l’exclusivité sur ma ville ou mon quartier ?',
    a: 'Nous étudions les demandes d’exclusivité territoriale au cas par cas, selon la zone, le type de commerce et le volume envisagé. Précisez votre ville et votre projet dans le formulaire : c’est exactement le type de demande que nous traitons en direct plutôt que par Faire.',
  },
  {
    q: 'Livrez-vous en dehors de la France ?',
    a: 'Notre catalogue Faire est accessible aux détaillants européens, et les zones desservies ainsi que les frais de port applicables y sont indiqués au moment de la commande. Pour une demande hors zone, contactez-nous directement.',
  },
  {
    q: 'Vendez-vous aussi en direct aux particuliers ?',
    a: 'Oui, dans notre boutique du 9e arrondissement de Paris et sur notre e-shop. C’est volontaire : nous testons chaque référence auprès de vrais clients avant de la proposer en gros. Nos tarifs publics conseillés sont donc cohérents avec ceux que vous pratiquerez.',
  },
]

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
}

export default function RevendeursPage() {
  return (
    <Section className="bg-cream">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <Container className="max-w-4xl">
        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-terracotta-dark">
            Espace professionnels
          </p>
          <h1 className="mt-3 font-display text-3xl font-bold text-charcoal sm:text-4xl">
            Devenir revendeur merci murphy®
          </h1>
          <p className="mx-auto mt-5 max-w-2xl leading-relaxed text-charcoal/70">
            Vous tenez une boutique indépendante, un concept-store, un salon de toilettage ou une
            animalerie&nbsp;? merci murphy® est une marque française de soins, d&apos;accessoires et
            de friandises pour chiens et chats, née dans une boutique parisienne. Nous la vendons
            chaque jour dans cette même boutique avant de la proposer en gros.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#catalogue"
              className="rounded-md bg-charcoal px-6 py-3 text-sm font-semibold text-cream transition-colors hover:bg-charcoal/85"
            >
              Voir le catalogue pro
            </a>
            <a
              href="#demande-pro"
              className="rounded-md border border-charcoal/20 px-6 py-3 text-sm font-semibold text-charcoal transition-colors hover:bg-charcoal/5"
            >
              Demander nos conditions
            </a>
          </div>
        </div>

        {/* ── Avantages ────────────────────────────────────────────────── */}
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          <div className="rounded-lg border border-charcoal/10 bg-white/60 p-5">
            <p className="font-display text-base font-semibold text-charcoal">Paiement net 60</p>
            <p className="mt-2 text-sm text-charcoal/70">
              Réglez 60 jours après réception. Vos premières ventes financent la commande, votre
              trésorerie reste disponible.
            </p>
          </div>
          <div className="rounded-lg border border-charcoal/10 bg-white/60 p-5">
            <p className="font-display text-base font-semibold text-charcoal">Retours gratuits</p>
            <p className="mt-2 text-sm text-charcoal/70">
              Première commande sans risque&nbsp;: les invendus sont repris. Vous testez la marque
              en rayon sans immobiliser de stock.
            </p>
          </div>
          <div className="rounded-lg border border-charcoal/10 bg-white/60 p-5">
            <p className="font-display text-base font-semibold text-charcoal">Sélection curée</p>
            <p className="mt-2 text-sm text-charcoal/70">
              Pas de catalogue fleuve&nbsp;: nos meilleures ventes chien &amp; chat, celles qui
              tournent réellement en boutique.
            </p>
          </div>
        </div>

        {/* ── H2 1 — Surprise Gap : la preuve retail ───────────────────── */}
        <div className="mt-16 grid items-center gap-8 md:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
            <Image
              src="/boutique-products.jpg"
              alt="Rayonnage de la boutique merci murphy® à Paris : shampoings, soins et bougies de la marque alignés sur des étagères en bois"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <div>
            <h2 className="font-display text-2xl font-semibold text-charcoal">
              Une marque testée en rayon avant d&apos;être proposée en gros
            </h2>
            <div className="mt-4 space-y-4 text-charcoal/75 leading-relaxed">
              <p>
                La plupart des fournisseurs n&apos;ont jamais tenu de caisse. Nous, si. merci
                murphy® tient sa propre boutique au 18 rue Victor Massé, dans le 9<sup>e</sup>{' '}
                arrondissement de Paris, où nous vendons nos produits en direct, tous les jours, à
                de vrais clients.
              </p>
              <p>
                Conséquence concrète pour vous&nbsp;: quand une référence entre au catalogue
                professionnel, elle a déjà fait ses preuves en linéaire. Nous savons ce qui part
                vite, ce qui demande à être expliqué en caisse, et ce qui ne mérite pas votre
                facing.
              </p>
              <p>
                C&apos;est aussi pour cette raison que nos tarifs publics conseillés sont
                réalistes&nbsp;: ce sont ceux que nous pratiquons nous-mêmes.
              </p>
            </div>
          </div>
        </div>

        {/* ── H2 2 — Catalogue ─────────────────────────────────────────── */}
        <div className="mt-16">
          <h2 className="font-display text-2xl font-semibold text-charcoal">
            Ce que vous référencez
          </h2>
          <p className="mt-3 max-w-2xl text-charcoal/70 leading-relaxed">
            Un assortiment resserré, pensé pour occuper peu de place et tourner vite. Trois familles
            complémentaires qui se vendent ensemble.
          </p>
          <div className="mt-6 grid gap-5 sm:grid-cols-3">
            <div className="rounded-lg border border-charcoal/10 bg-white/60 p-5">
              <h3 className="font-display text-base font-semibold text-charcoal">
                Soins &amp; toilettage
              </h3>
              <p className="mt-2 text-sm text-charcoal/70">
                Shampoings doux, sprays démêlants, soins sans sulfate. Le cœur de gamme, et la
                catégorie qui génère le réassort le plus régulier.
              </p>
            </div>
            <div className="rounded-lg border border-charcoal/10 bg-white/60 p-5">
              <h3 className="font-display text-base font-semibold text-charcoal">
                Accessoires &amp; lifestyle
              </h3>
              <p className="mt-2 text-sm text-charcoal/70">
                Bougies, mugs, casquettes et petits objets à l&apos;esprit maison. Des achats
                d&apos;impulsion qui font monter le panier moyen en caisse.
              </p>
            </div>
            <div className="rounded-lg border border-charcoal/10 bg-white/60 p-5">
              <h3 className="font-display text-base font-semibold text-charcoal">
                Chien &amp; chat
              </h3>
              <p className="mt-2 text-sm text-charcoal/70">
                Une gamme pensée pour les deux, là où beaucoup de marques oublient le rayon chat,
                souvent le plus rentable au mètre linéaire.
              </p>
            </div>
          </div>
          <p className="mt-5 text-sm text-charcoal/60">
            Le détail des références, des formats et des tarifs wholesale est consultable sur{' '}
            <a href="#catalogue" className="text-terracotta-dark hover:underline">
              notre catalogue professionnel
            </a>
            .
          </p>
        </div>

        {/* ── H2 3 — Comment travailler ensemble ───────────────────────── */}
        <div className="mt-16">
          <h2 className="font-display text-2xl font-semibold text-charcoal">
            Deux façons de travailler avec nous
          </h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div className="rounded-lg border border-charcoal/10 bg-white/60 p-6">
              <h3 className="font-display text-lg font-semibold text-charcoal">
                Via Faire : la voie rapide
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-charcoal/70">
                Faire est la marketplace B2B de référence du commerce indépendant. Compte gratuit,
                paiement à 60 jours, retours offerts sur la première commande, et conditions de
                commande affichées en toute transparence.
              </p>
              <p className="mt-3 text-sm text-charcoal/70">
                Le bon choix si vous voulez tester la marque sans négociation préalable.
              </p>
            </div>
            <div className="rounded-lg border border-charcoal/10 bg-white/60 p-6">
              <h3 className="font-display text-lg font-semibold text-charcoal">
                En direct : pour un projet sur-mesure
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-charcoal/70">
                Exclusivité sur votre ville, corner dédié, volumes importants, assortiment
                spécifique ou simple envie de nous parler avant de commander&nbsp;: écrivez-nous.
              </p>
              <p className="mt-3 text-sm text-charcoal/70">
                Réponse sous 48h ouvrées, par un interlocuteur unique.
              </p>
            </div>
          </div>
        </div>

        {/* ── Catalogue Faire ──────────────────────────────────────────── */}
        <div id="catalogue" className="mt-16 scroll-mt-24">
          <h2 className="font-display text-2xl font-semibold text-charcoal">
            Parcourir le catalogue professionnel
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-charcoal/70">
            Connectez-vous ou créez un compte revendeur Faire pour afficher les prix wholesale, les
            conditions de commande et passer votre première commande.
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
            L&apos;iframe ne s&apos;affiche pas&nbsp;?{' '}
            <a
              href={`${FAIRE_DIRECT_URL}/${FAIRE_UTM}`}
              target="_blank"
              rel="nofollow noopener noreferrer"
              className="text-terracotta-dark hover:underline"
            >
              Accéder directement à notre boutique Faire
            </a>
            .
          </p>
        </div>

        {/* ── FAQ ──────────────────────────────────────────────────────── */}
        <div className="mt-16">
          <h2 className="font-display text-2xl font-semibold text-charcoal">
            Questions fréquentes des revendeurs
          </h2>
          <div className="mt-6 divide-y divide-charcoal/10 border-y border-charcoal/10">
            {FAQ.map(({ q, a }) => (
              <details key={q} className="group py-4">
                <summary className="cursor-pointer list-none">
                  <h3 className="flex items-center justify-between gap-4 font-display text-base font-semibold text-charcoal">
                    {q}
                    <span className="shrink-0 text-charcoal/40 transition-transform group-open:rotate-45">
                      +
                    </span>
                  </h3>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-charcoal/70">{a}</p>
              </details>
            ))}
          </div>
        </div>

        {/* ── Formulaire ───────────────────────────────────────────────── */}
        <div id="demande-pro" className="mt-16 scroll-mt-24 rounded-lg bg-white/60 p-6 sm:p-8">
          <div className="text-center">
            <h2 className="font-display text-2xl font-semibold text-charcoal">
              Demander nos conditions revendeur
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-charcoal/70">
              Exclusivité territoriale, corner, volumes spécifiques ou simple demande de
              tarifs&nbsp;: écrivez-nous directement, sans passer par Faire.
            </p>
          </div>
          <div className="mx-auto mt-8 max-w-2xl">
            <RevendeurForm />
          </div>
        </div>

        {/* ── Réassurance finale ───────────────────────────────────────── */}
        <p className="mt-10 text-center text-sm text-charcoal/60">
          merci murphy®, {SITE_CONFIG.address}. Vous cherchez plutôt nos services ou notre boutique
          en ligne&nbsp;?{' '}
          <Link href="/shop" className="text-terracotta-dark hover:underline">
            Visiter l&apos;éco-shop
          </Link>
          .
        </p>
      </Container>
    </Section>
  )
}
