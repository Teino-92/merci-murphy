import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import { ConceptValuesV2 } from '@/components/sections/concept-values-v2'
import { PageHeaderV2 } from '@/components/sections/page-header-v2'
import { ValuesV2 } from '@/components/sections/values-v2'
import { CONTAINER, DisplayTitle, INLINE_LINK, TEXT_LINK } from '@/components/ui/editorial'
import { cn, BLUR_PLACEHOLDER } from '@/lib/utils'

export const revalidate = 86400

export const metadata: Metadata = {
  alternates: { canonical: '/concept' },
  title: 'Le concept',
  description:
    "Découvrez l'histoire de merci murphy®, notre équipe et nos engagements pour le bien-être animal à Paris.",
  openGraph: {
    images: [
      { url: '/og/og-home.jpg', width: 1200, height: 630, alt: 'Le concept - Merci Murphy' },
    ],
  },
}

const BRAND = <span className="font-medium text-charcoal">merci murphy®</span>

/**
 * Le concept : h1 de marque, histoire, valeurs, engagements. L'équipe reste
 * masquée.
 */
export default function ConceptPage() {
  return (
    <>
      <PageHeaderV2
        title="merci murphy®"
        sub="ambassadeur d'un art de vivre partagé entre l'humain et son animal."
        image={{
          src: '/concept-hero.jpg',
          alt: "L'intérieur de la boutique merci murphy®",
          position: '58% center',
        }}
      >
        <a href="#valeurs" className={cn(TEXT_LINK.light, 'self-start')}>
          Nos valeurs
        </a>
      </PageHeaderV2>

      <section className="border-t border-charcoal/15 bg-white py-16 lg:py-24">
        <div
          className={cn(
            CONTAINER,
            'grid grid-cols-1 gap-y-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-center lg:gap-x-20'
          )}
        >
          <div>
            <DisplayTitle size="compact" className="max-w-xl">
              Vivre heureux avec son chien et son chat à Paris
            </DisplayTitle>

            <div className="mt-8 max-w-prose space-y-5 text-base leading-relaxed text-charcoal/70 lg:mt-10 lg:text-lg">
              <p>
                {BRAND} c&apos;est un lieu unique, chaleureux et bienveillant au cœur de Paris où
                l&apos;on peut confier son compagnon ou simplement échanger avec un expert ou entre
                &laquo;&nbsp;pet-parents&nbsp;&raquo;.
              </p>
              <p>
                {BRAND} c&apos;est un collectif engagé d&apos;experts et de passionnés pour répondre
                aux besoins de votre compagnon urbain et vous facilite la vie.
              </p>
              <p>
                {BRAND} c&apos;est le spot pour se retrouver entre copains chiens, entre
                &laquo;&nbsp;parents&nbsp;&raquo; de chiens, entre ceux qui aiment les chiens. Le
                temps d&apos;une journée à la crèche canine, pour un toilettage, pour un moment
                détente au spa maison POILUS pour profiter d&apos;un massage, d&apos;un bain,
                d&apos;une balnéo, ou même juste pour un conseil d&apos;éducation.
              </p>
              <p>
                Ce que nous vendons en boutique, nous le proposons aussi aux détaillants qui
                partagent cette exigence : boutiques indépendantes, concept-stores et toiletteurs
                peuvent consulter nos{' '}
                <Link href="/revendeurs" className={INLINE_LINK}>
                  conditions revendeur
                </Link>
                .
              </p>
            </div>
          </div>

          <div className="relative mx-auto aspect-[4/5] w-[78%] overflow-hidden sm:w-1/2 lg:w-full">
            <Image
              src="/murphy-2.jpg"
              alt="Murphy, le carlin mascotte de merci murphy®"
              fill
              placeholder="blur"
              blurDataURL={BLUR_PLACEHOLDER}
              className="object-cover object-[30%_center]"
              sizes="(min-width: 1024px) 36vw, (min-width: 640px) 50vw, 78vw"
            />
          </div>
        </div>
      </section>

      <section
        id="maison-poilus"
        className="scroll-mt-28 border-t border-charcoal/15 bg-cream py-16 lg:py-24"
      >
        <div
          className={cn(
            CONTAINER,
            'grid grid-cols-1 gap-y-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-x-20'
          )}
        >
          <div>
            <DisplayTitle size="compact" sub="nos soins et notre savoir-faire">
              maison POILUS®
            </DisplayTitle>
            <p className="mt-8 max-w-prose text-base leading-relaxed text-charcoal/70 lg:text-lg">
              maison POILUS® est la marque de {BRAND} pour tout ce qui touche au soin du poil :
              notre gamme de produits faits maison et l&apos;expertise de nos toiletteurs, Andrea et
              Titouan.
            </p>
          </div>

          <div className="space-y-10 text-base leading-relaxed text-charcoal/70 lg:text-lg">
            <div>
              <h2 className="font-display text-2xl text-charcoal">Des soins 100 % naturels</h2>
              <p className="mt-3">
                maison POILUS® a développé une gamme de soins naturels adaptés aux chiens, fabriqués
                en France : shampoings et démêlants formulés à partir de plantes, d&apos;huiles
                essentielles et d&apos;élixirs floraux. Ce sont ces produits que nous utilisons au
                salon et que vous retrouvez en{' '}
                <Link href="/shop" className={INLINE_LINK}>
                  boutique
                </Link>
                .
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl text-charcoal">
                Un toilettage sans stress, par Andrea et Titouan
              </h2>
              <ul className="mt-3 list-disc space-y-2 pl-5">
                <li>
                  Un temps d&apos;acclimatation pour que chaque chien découvre le lieu à son rythme.
                </li>
                <li>
                  Un chien par pièce avec son toiletteur : jamais deux chiens dans la même pièce
                  pour la même prestation.
                </li>
                <li>Des gestes doux et un vrai travail à la main.</li>
              </ul>
              <p className="mt-4">
                Découvrir le{' '}
                <Link href="/services/toilettage" className={INLINE_LINK}>
                  toilettage
                </Link>
                , le{' '}
                <Link href="/services/spa-chien" className={INLINE_LINK}>
                  spa
                </Link>
                , la{' '}
                <Link href="/services/balneo-chien" className={INLINE_LINK}>
                  balnéo
                </Link>
                , le{' '}
                <Link href="/services/massage-chien" className={INLINE_LINK}>
                  massage
                </Link>{' '}
                ou le{' '}
                <Link href="/services/bain-libre-service" className={INLINE_LINK}>
                  bain en libre-service
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </section>

      <ConceptValuesV2 />

      <ValuesV2
        className="bg-[#B5A89A]"
        image={{
          src: '/boutique-products.jpg',
          alt: 'Flacons de soins et pots merci murphy® sur les étagères de la boutique',
        }}
      />
    </>
  )
}
