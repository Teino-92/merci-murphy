export const revalidate = 3600

import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import { RevendeurForm } from '@/components/forms/revendeur-form'
import { FaqV2 } from '@/components/sections/faq-v2'
import { PageHeaderV2 } from '@/components/sections/page-header-v2'
import { Button } from '@/components/ui/button'
import { CONTAINER, DisplayTitle, INLINE_LINK, TEXT_LINK } from '@/components/ui/editorial'
import { SITE_CONFIG } from '@/config/site'
import { cn, BLUR_PLACEHOLDER } from '@/lib/utils'
import { noOrphan } from '@/lib/typo'

const FAIRE_EMBED_URL = 'https://www.faire.com/embed/bw_2c49parae6'
const FAIRE_DIRECT_URL = 'https://mercimurphy.faire.com'
const FAIRE_UTM = '?utm_source=mercimurphy.com&utm_medium=revendeurs-page&utm_campaign=wholesale'

export const metadata: Metadata = {
  // Intention B2B « grossiste / fournisseur » : merci murphy® est une marque
  // (pas un grossiste multimarque), mais c'est le mot que tapent les acheteurs.
  title: {
    absolute: 'Grossiste accessoires chien — marque française pour boutiques et toiletteurs',
  },
  description:
    'Fournisseur de soins et accessoires chien & chat pour boutiques, toiletteurs et animaleries. Marque française testée dans notre boutique parisienne. Net 60, retours offerts.',
  keywords: [
    'grossiste accessoires chien',
    'fournisseur produits chien',
    'revendeur produits chien',
    'wholesale chien France',
    'fournisseur toiletteur',
    'fournisseur animalerie',
    'grossiste shampoing chien',
    'marque chien pour boutique',
  ],
  alternates: { canonical: `${SITE_CONFIG.url}/revendeurs` },
  openGraph: {
    title: 'Devenir revendeur merci murphy® | Espace professionnels',
    description:
      'Référencez une marque chien & chat déjà testée en boutique. Catalogue wholesale sur Faire : net 60, retours offerts sur la première commande.',
    url: `${SITE_CONFIG.url}/revendeurs`,
    type: 'website',
  },
  robots: { index: true, follow: true },
}

// Formulaire prod repris tel quel : coins vifs, champs plus hauts, titre de
// confirmation en Playfair normal.
const FORM_SKIN =
  '[&_.rounded-md]:rounded-none [&_.h-9]:h-12 [&_.h-10]:h-12 [&_.font-bold]:font-normal'

const ADVANTAGES = [
  {
    title: 'Paiement net 60',
    text: 'Réglez 60 jours après réception. Vos premières ventes financent la commande, votre trésorerie reste disponible.',
  },
  {
    title: 'Retours gratuits',
    text: 'Première commande sans risque : les invendus sont repris. Vous testez la marque en rayon sans immobiliser de stock.',
  },
  {
    title: 'Sélection curée',
    text: 'Pas de catalogue fleuve : nos meilleures ventes chien & chat, celles qui tournent réellement en boutique.',
  },
]

// Blocs catégories : H3 orientés requêtes B2B (« grossiste shampoing chien »,
// « fournisseur toiletteur », « grossiste accessoires chien »).
const CATEGORIES = [
  {
    title: 'Shampoings & soins chien en gros',
    text: 'Le cœur de gamme, et la catégorie qui génère le réassort le plus régulier. Formules douces, sans sulfate.',
    items: [
      'Shampoing doux',
      'Shampoing sec',
      'Spray démêlant',
      'Après-shampooing adoucissant',
      'Eau de Cologne pour chien',
    ],
    forWho: 'Idéal toiletteurs : le client repart avec le soin adapté à son chien.',
  },
  {
    title: 'Accessoires chien & lifestyle',
    text: 'Des achats d’impulsion à l’esprit maison, qui font monter le panier moyen en caisse.',
    items: ['Bougies parfumées', 'Mugs', 'Casquettes', 'Petits objets cadeaux'],
    forWho: 'Idéal concept-stores et boutiques cadeaux.',
  },
  {
    title: 'Produits pour chat',
    text: 'Le rayon que beaucoup de marques oublient, souvent le plus rentable au mètre linéaire.',
    items: ['Spray démêlant chien & chat', 'Après-shampooing chien & chat'],
    forWho: 'Idéal animaleries et salons qui accueillent aussi les chats.',
  },
]

const FAQ = [
  {
    q: 'Faut-il un numéro SIRET pour devenir revendeur merci murphy® ?',
    a: 'Oui. Le catalogue wholesale est réservé aux professionnels enregistrés : boutiques, concept-stores, toiletteurs, animaleries et e-commerces. Un numéro SIRET (ou son équivalent européen) est demandé à l’ouverture du compte, que vous passiez par Faire ou par notre formulaire direct.',
  },
  {
    q: 'Suis-je obligé de passer par Faire pour commander ?',
    a: 'Non. Faire est la voie la plus simple : compte gratuit, paiement à 60 jours et retours offerts sur la première commande. Mais vous pouvez aussi nous écrire directement via le formulaire de cette page, notamment pour un partenariat sur-mesure ou si vous ne souhaitez pas créer de compte Faire.',
  },
  {
    q: 'Que se passe-t-il si les produits ne se vendent pas ?',
    a: 'Sur votre première commande passée via Faire, les retours sont gratuits. Vous testez la marque en rayon sans immobiliser de trésorerie : si l’assortiment ne trouve pas son public chez vous, vous renvoyez les invendus.',
  },
  {
    q: 'Acceptez-vous les toiletteurs et salons sans boutique ?',
    a: 'Oui. Les salons de toilettage font partie de nos profils revendeurs, avec ou sans espace de vente dédié. Un corner de quelques références en caisse suffit à démarrer. C’est d’ailleurs la configuration que nous connaissons le mieux, puisque nous la pratiquons nous-mêmes à Paris.',
  },
  {
    q: 'Quel est le minimum de commande pour un revendeur ?',
    a: 'Les conditions de commande sont affichées directement sur notre catalogue Faire, qui fait foi. Pour un projet particulier (corner, volumes importants, assortiment sur-mesure), écrivez-nous via le formulaire : nous vous répondons sous 48h ouvrées avec des conditions adaptées.',
  },
  {
    q: 'Puis-je obtenir l’exclusivité sur ma ville ou mon quartier ?',
    a: 'Nous étudions les demandes d’exclusivité territoriale au cas par cas, selon la zone, le type de commerce et le volume envisagé. Précisez votre ville et votre projet dans le formulaire : c’est exactement le type de demande que nous traitons en direct plutôt que par Faire.',
  },
  {
    q: 'Livrez-vous en dehors de la France ?',
    a: 'Notre catalogue Faire est accessible aux détaillants européens, et les zones desservies ainsi que les frais de port applicables y sont indiqués au moment de la commande. Pour une demande hors zone, contactez-nous directement.',
  },
  {
    q: 'Vendez-vous aussi en direct aux particuliers ?',
    a: 'Oui, dans notre boutique du 9e arrondissement de Paris et sur notre e-shop. C’est volontaire : nous testons chaque référence auprès de vrais clients avant de la proposer en gros. Nos tarifs publics conseillés sont donc cohérents avec ceux que vous pratiquerez.',
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

const BODY = 'text-base leading-relaxed text-charcoal/70'
const COLUMN =
  'border-b border-charcoal/15 py-7 lg:border-b-0 lg:border-l lg:px-8 lg:py-9 lg:first:border-l-0 lg:first:pl-0 lg:last:pr-0'

/**
 * Revendeurs. Les avantages
 * deviennent des colonnes à filets ; la FAQ passe sur l'ardoise partagée, les
 * questions restant des h3.
 */
export default function RevendeursPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <PageHeaderV2
        title="Devenir revendeur merci murphy®"
        sub="Espace professionnels"
        intro={
          <p>
            Vous tenez une boutique indépendante, un concept-store, un salon de toilettage ou une
            animalerie&nbsp;? merci murphy® est une marque française de soins, d&apos;accessoires et
            de friandises pour chiens et chats, née dans une boutique parisienne. Nous la vendons
            chaque jour dans cette même boutique avant de la proposer en gros.
          </p>
        }
        image={{
          src: '/boutique-hero.jpg',
          alt: 'La boutique merci murphy® à Paris',
        }}
      >
        <Button
          asChild
          size="lg"
          className="h-12 self-start bg-terracotta-dark px-8 text-[15px] text-white hover:bg-terracotta-dark/90 sm:self-auto"
        >
          <a href="#catalogue">Voir le catalogue pro</a>
        </Button>
        <a href="#demande-pro" className={cn(TEXT_LINK.light, 'self-start sm:self-center')}>
          Demander nos conditions
        </a>
      </PageHeaderV2>

      <section className="border-t border-charcoal/15 bg-white py-16 lg:py-24">
        <div className={CONTAINER}>
          <ul className="grid grid-cols-1 border-t border-charcoal/15 lg:grid-cols-3">
            {ADVANTAGES.map((adv) => (
              <li key={adv.title} className={COLUMN}>
                <p className="font-display text-2xl leading-tight text-charcoal">
                  {noOrphan(adv.title)}
                </p>
                <p className={cn(BODY, 'mt-3 max-w-sm')}>{noOrphan(adv.text)}</p>
              </li>
            ))}
          </ul>

          <div className="mt-16 grid grid-cols-1 gap-y-10 lg:mt-24 lg:grid-cols-2 lg:items-center lg:gap-x-20">
            <div className="relative aspect-[4/3] overflow-hidden bg-cream/50">
              <Image
                src="/boutique-products.jpg"
                alt="Rayonnage de la boutique merci murphy® à Paris : shampoings, soins et bougies de la marque alignés sur des étagères en bois"
                fill
                placeholder="blur"
                blurDataURL={BLUR_PLACEHOLDER}
                className="object-cover"
                sizes="(min-width: 1024px) 45vw, 100vw"
              />
            </div>
            <div>
              <DisplayTitle size="compact">
                Une marque testée en rayon avant d&apos;être proposée en gros
              </DisplayTitle>
              <div className={cn(BODY, 'mt-8 max-w-prose space-y-5 lg:text-lg')}>
                <p>
                  La plupart des fournisseurs n&apos;ont jamais tenu de caisse. Nous, si. merci
                  murphy® tient sa propre boutique au 18 rue Victor Massé, dans le 9<sup>e</sup>{' '}
                  arrondissement de Paris, où nous vendons nos produits en direct, tous les jours, à
                  de vrais clients.
                </p>
                <p>
                  Conséquence concrète pour vous&nbsp;: quand une référence entre au catalogue
                  professionnel, elle a déjà fait ses preuves en linéaire. Nous savons ce qui part
                  vite, ce qui demande à être expliqué en caisse, et ce qui ne mérite pas
                  votre facing.
                </p>
                <p>
                  C&apos;est aussi pour cette raison que nos tarifs publics conseillés sont
                  réalistes&nbsp;: ce sont ceux que nous{' '}
                  <span className="whitespace-nowrap">pratiquons nous-mêmes.</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-rose py-16 lg:py-24">
        <div className={CONTAINER}>
          <DisplayTitle className="max-w-3xl">
            Ce que vous référencez&nbsp;: soins, accessoires et produits chat en gros
          </DisplayTitle>
          <p className={cn(BODY, 'mt-6 max-w-2xl lg:text-lg')}>
            Un assortiment resserré, pensé pour occuper peu de place et tourner vite. Trois familles
            complémentaires qui se vendent ensemble.
          </p>

          <ul className="mt-12 grid grid-cols-1 border-t border-charcoal/20 lg:mt-16 lg:grid-cols-3">
            {CATEGORIES.map((cat) => (
              <li key={cat.title} className={cn(COLUMN, 'border-charcoal/20')}>
                <h3 className="font-display text-2xl leading-tight text-charcoal">
                  {noOrphan(cat.title)}
                </h3>
                <p className={cn(BODY, 'mt-3 max-w-sm text-charcoal/80')}>{noOrphan(cat.text)}</p>
                <ul className="mt-5 space-y-1.5 text-base text-charcoal">
                  {cat.items.map((item) => (
                    <li key={item}>{noOrphan(item)}</li>
                  ))}
                </ul>
                <p className="mt-5 font-display text-lg italic leading-snug text-charcoal/70">
                  {noOrphan(cat.forWho)}
                </p>
              </li>
            ))}
          </ul>

          <p className="mt-10 text-base text-charcoal/70">
            Le détail des références, des formats et des tarifs wholesale est consultable sur{' '}
            <a href="#catalogue" className={INLINE_LINK}>
              notre catalogue professionnel
            </a>
            .
          </p>
        </div>
      </section>

      <section className="bg-white py-16 lg:py-24">
        <div className={CONTAINER}>
          <DisplayTitle>Deux façons de travailler avec nous</DisplayTitle>

          <div className="mt-12 grid grid-cols-1 border-t border-charcoal/15 lg:mt-16 lg:grid-cols-2">
            <div className={COLUMN}>
              <h3 className="font-display text-2xl leading-tight text-charcoal">
                Via Faire : la voie rapide
              </h3>
              <p className={cn(BODY, 'mt-3 max-w-md')}>
                Faire est la marketplace B2B de référence du commerce indépendant. Compte gratuit,
                paiement à 60 jours, retours offerts sur la première commande, et conditions de
                commande affichées en toute transparence.
              </p>
              <p className={cn(BODY, 'mt-3 max-w-md')}>
                Le bon choix si vous voulez tester la marque sans négociation préalable.
              </p>
            </div>
            <div className={COLUMN}>
              <h3 className="font-display text-2xl leading-tight text-charcoal">
                En direct : pour un <span className="whitespace-nowrap">projet sur-mesure</span>
              </h3>
              <p className={cn(BODY, 'mt-3 max-w-md')}>
                Exclusivité sur votre ville, corner dédié, volumes importants, assortiment
                spécifique ou simple envie de nous parler avant de commander&nbsp;: écrivez-nous.
              </p>
              <p className={cn(BODY, 'mt-3 max-w-md')}>
                Réponse sous 48h ouvrées, par un interlocuteur unique.
              </p>
            </div>
          </div>

          <div id="catalogue" className="mt-20 scroll-mt-24 lg:mt-28">
            <DisplayTitle size="compact">Parcourir le catalogue professionnel</DisplayTitle>
            <p className={cn(BODY, 'mt-5 max-w-2xl')}>
              Connectez-vous ou créez un compte revendeur Faire pour afficher les prix wholesale,
              les conditions de commande et passer votre première commande.
            </p>
            <div className="mt-8 border border-charcoal/15 bg-white">
              <iframe
                src={FAIRE_EMBED_URL}
                title="Catalogue wholesale merci murphy® sur Faire"
                loading="lazy"
                scrolling="no"
                className="mx-auto block h-[600px] w-full max-w-[900px] border-0"
              />
            </div>
            <p className="mt-4 text-sm text-charcoal/60">
              L&apos;iframe ne s&apos;affiche pas&nbsp;?{' '}
              <a
                href={`${FAIRE_DIRECT_URL}/${FAIRE_UTM}`}
                target="_blank"
                rel="nofollow noopener noreferrer"
                className={INLINE_LINK}
              >
                Accéder directement à notre boutique Faire
              </a>
              .
            </p>
          </div>
        </div>
      </section>

      <FaqV2
        title="Questions fréquentes des revendeurs"
        questionAs="h3"
        items={FAQ.map(({ q, a }) => ({ question: q, reponse: a }))}
      />

      <section id="demande-pro" className="scroll-mt-24 bg-cream py-16 lg:py-24">
        <div
          className={cn(
            CONTAINER,
            'grid grid-cols-1 gap-y-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-x-20'
          )}
        >
          <div>
            <DisplayTitle size="compact">Demander nos conditions revendeur</DisplayTitle>
            <p className={cn(BODY, 'mt-5 max-w-md')}>
              Exclusivité territoriale, corner, volumes spécifiques ou simple demande de
              tarifs&nbsp;: écrivez-nous directement, sans passer par Faire.
            </p>
            <p className="mt-10 max-w-md border-t border-charcoal/15 pt-6 text-sm leading-relaxed text-charcoal/60">
              merci murphy®, {SITE_CONFIG.address}. Vous cherchez plutôt nos services ou notre
              boutique en ligne&nbsp;?{' '}
              <Link href="/shop" className={INLINE_LINK}>
                Visiter l&apos;éco-shop
              </Link>
              .
            </p>
          </div>
          <div className={FORM_SKIN}>
            <RevendeurForm />
          </div>
        </div>
      </section>
    </>
  )
}
