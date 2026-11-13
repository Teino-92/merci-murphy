import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import { ConceptValuesV2 } from '@/components/sections/concept-values-v2'
import { PageHeaderV2 } from '@/components/sections/page-header-v2'
import { ValuesV2 } from '@/components/sections/values-v2'
import { CONTAINER, DisplayTitle, INLINE_LINK, TEXT_LINK } from '@/components/ui/editorial'
import { cn, BLUR_PLACEHOLDER } from '@/lib/utils'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Le concept',
  description:
    "Découvrez l'histoire de merci murphy®, notre équipe et nos engagements pour le bien-être animal à Paris.",
  openGraph: {
    images: [
      { url: '/og/og-home.jpg', width: 1200, height: 630, alt: 'Le concept — Merci Murphy' },
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
