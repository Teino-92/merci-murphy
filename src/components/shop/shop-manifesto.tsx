'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Globe, Heart, Leaf, RefreshCw, Plus, Minus } from 'lucide-react'
import { Reveal } from '@/components/ui/reveal'
import { BLUR_PLACEHOLDER } from '@/lib/utils'

export function ShopManifesto() {
  const [expanded, setExpanded] = useState(false)

  return (
    <>
      <div className="text-center lg:text-left lg:order-1">
        <Reveal>
          <h1 className="mt-3 font-display text-4xl font-bold sm:text-6xl">
            Boutique éthique & éco-responsable pour chiens et chats
          </h1>
          <h2 className="mt-2 text-sm font-medium uppercase tracking-widest text-terracotta-dark">
            Une seule planète
          </h2>
          <p className="mt-3 text-charcoal/50 text-sm">
            merci murphy®, c&apos;est aussi un dog shop engagé. Nos achats ont un sens — pour nos
            poilus et pour la planète.
          </p>
          <button
            onClick={() => setExpanded((o) => !o)}
            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-terracotta-dark"
          >
            {expanded ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {expanded ? 'Moins' : 'En savoir plus'}
          </button>
        </Reveal>

        <div
          className={`mt-8 space-y-5 text-sm text-charcoal/70 leading-relaxed ${expanded ? '' : 'hidden'}`}
        >
          <Reveal delay={100}>
            <div className="flex gap-3">
              <Globe className="mt-0.5 h-4 w-4 shrink-0 text-terracotta-dark" />
              <p>
                Le collectif <span className="text-charcoal font-medium">merci murphy®</span> vous
                propose une offre resserrée de produits, choisis strictement pour leurs bénéfices
                pour votre chien et selon des critères exigeants éco-responsables et éthiques. Cela
                signifie questionner la composition, toutes les étapes de réalisation et la
                durabilité de chaque produit.
              </p>
            </div>
          </Reveal>
          <Reveal delay={200}>
            <div className="flex gap-3">
              <Heart className="mt-0.5 h-4 w-4 shrink-0 text-terracotta-dark" />
              <p>
                <span className="text-charcoal font-medium">merci murphy®</span> aime le vrai et les
                savoir-faire des passionnés. La plupart de nos fournisseurs-partenaires sont des
                artisans locaux. Nos produits voyagent le moins possible — fabrication engagé pour
                favoriser la mixité dans l&apos;entreprenariat.{' '}
                <span className="not-italic font-medium text-charcoal">merci murphy®</span> est
                engagé pour favoriser la mixité dans l&apos;entreprenariat. Nous favorisons les
                marques dirigées par des femmes.
              </p>
            </div>
          </Reveal>
          <Reveal delay={300}>
            <div className="flex gap-3">
              <Leaf className="mt-0.5 h-4 w-4 shrink-0 text-terracotta-dark" />
              <p>
                Seuls les produits éco-responsables — matières premières biologiques, recyclées et
                innovantes, sans compromis sur leur origine et leur traçabilité — entrent dans la
                sélection. Pas de souffrance animale : vous ne trouverez pas de cuir animal chez{' '}
                <span className="text-charcoal font-medium">merci murphy®</span>.
              </p>
            </div>
          </Reveal>
          <Reveal delay={400}>
            <div className="flex gap-3">
              <RefreshCw className="mt-0.5 h-4 w-4 shrink-0 text-terracotta-dark" />
              <p>
                La durabilité est un critère essentiel.{' '}
                <span className="text-charcoal font-medium">merci murphy®</span> est la première
                boutique pour chien à proposer du{' '}
                <span className="text-charcoal font-medium">second-hand</span> et une consommation
                en vrac. Réutiliser est la meilleure option pour la planète — pour une consommation
                éclairée et responsable.
              </p>
            </div>
          </Reveal>
        </div>
      </div>

      {/* Desktop image — shown when expanded */}
      {expanded && (
        <div className="hidden lg:block lg:order-2 lg:self-stretch">
          <div className="relative w-full h-full min-h-[600px] overflow-hidden rounded-2xl">
            <Image
              src="/boutique-hero.jpg"
              alt="La boutique merci murphy®"
              fill
              placeholder="blur"
              blurDataURL={BLUR_PLACEHOLDER}
              className="object-cover object-center"
              sizes="33vw"
            />
          </div>
        </div>
      )}
    </>
  )
}
