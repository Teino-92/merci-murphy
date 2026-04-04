'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Section, Container } from '@/components/ui/section'
import { Reveal } from '@/components/ui/reveal'

const FAQ: { question: string; reponse: string }[] = [
  // TODO: add FAQ items
  {
    question: 'À quelle fréquence faut-il faire toiletter son chien ?',
    reponse:
      'La fréquence dépend surtout de la race, du type de poil et du mode de vie. En général, un toilettage toutes les 6 à 8 semaines permet de garder un pelage sain, d’éviter les nœuds et de maintenir une bonne hygiène. Les chiens à poil long ou bouclé peuvent nécessiter des séances plus régulières.',
  },
  {
    question: 'Que comprend une séance de toilettage ?',
    reponse:
      'Une séance inclut généralement le bain avec des produits adaptés, le séchage, le brossage, la coupe ou la tonte selon la race, ainsi que l’entretien des oreilles et des griffes. L’objectif est d’assurer à la fois le confort et la santé du chien.',
  },
  {
    question: 'Mon chien est stressé chez le toiletteur, que faire ?',
    reponse:
      'C’est assez fréquent, surtout pour une première visite. Les toiletteurs prennent le temps d’habituer le chien progressivement au bain, au séchage et aux manipulations. Apporter son jouet ou une petite friandise peut aussi aider à le rassurer.',
  },
  {
    question: 'Dois-je préparer mon chien avant le rendez-vous ?',
    reponse:
      'Il est conseillé de promener votre chien avant la séance pour qu’il soit plus détendu. Si possible, brossez-le légèrement pour enlever les saletés superficielles, mais évitez de couper les nœuds vous-même afin de ne pas risquer de le blesser.',
  },
  {
    question: 'Pourquoi les prix varient-ils selon les chiens ?',
    reponse:
      'Les tarifs indiqués sur le site sont présentés sous forme de fourchette car le prix d’un toilettage dépend de plusieurs critères propres à chaque chien. La race, le poids, l’âge ainsi que le type et l’état du pelage influencent le temps et les soins nécessaires pour réaliser le toilettage dans de bonnes conditions. Un chien de petite taille à poil court demandera généralement moins de travail qu’un chien plus grand avec un pelage long ou très dense. De la même manière, un pelage très emmêlé ou un chien qui nécessite plus de temps et de douceur peut demander un peu plus de travail. La fourchette de prix permet donc de donner une estimation transparente tout en tenant compte des besoins spécifiques de chaque chien. Le tarif précis est confirmé au moment du rendez-vous ou après avoir pris connaissance de votre compagnon.',
  },
]

export function FaqServices() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div style={{ backgroundColor: '#B5A89A' }}>
      <Section>
        <Container className="max-w-3xl">
          <Reveal>
            <div className="text-center mb-10">
              <h2 className="font-display text-3xl font-bold text-charcoal sm:text-4xl">
                Questions fréquentes
              </h2>
            </div>
          </Reveal>
          <div className="divide-y divide-charcoal/10">
            {FAQ.map((item, i) => (
              <div key={i}>
                <button
                  className="flex w-full items-center justify-between py-5 text-left"
                  onClick={() => setOpen(open === i ? null : i)}
                  aria-expanded={open === i}
                >
                  <span className="font-medium text-charcoal">{item.question}</span>
                  <ChevronDown
                    className={cn(
                      'ml-4 h-5 w-5 shrink-0 text-terracotta-dark transition-transform duration-200',
                      open === i && 'rotate-180'
                    )}
                  />
                </button>
                {open === i && (
                  <div className="pb-5 text-sm leading-relaxed text-charcoal/70">
                    {item.reponse}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Container>
      </Section>
    </div>
  )
}
