import { Leaf, Heart, Sparkles, Recycle, Hand } from 'lucide-react'
import { Section, Container } from '@/components/ui/section'
import { Reveal } from '@/components/ui/reveal'

const VALUES = [
  {
    icon: Heart,
    title: 'Bien-être avant tout',
    description:
      'Chaque service, chaque soin est pensé pour le confort de votre animal, dans le respect de ses besoins physiologiques, et de son tempérament.',
  },
  {
    icon: Leaf,
    title: 'Produits naturels & éthiques',
    description:
      'Produits naturels, matières biologiques, recyclées, production artisanale française et européenne.',
  },
  {
    icon: Recycle,
    title: 'Ecoresponsabilité',
    description:
      "Emballages recyclés, produits écoresponsables, consomation d'eau raisonée - nous agissons à notre échelle.",
  },
  {
    icon: Sparkles,
    title: 'Expertise certifiée',
    description:
      'Une équipe passionnée et engagée, un collectif d’experts avec une approche bienveillante.',
  },
  {
    icon: Hand,
    title: 'Ecoute et bienveillance',
    description:
      'Un lieu unique et convivial au cœur de Paris,où l’on peut confier son compagnon ou simplement échanger avec un expert ou entre « pet-parents »',
  },
]

export function Values() {
  return (
    <Section className="bg-rose/40">
      <Container>
        <Reveal>
          <div className="text-center">
            <h2 className="font-display text-3xl font-bold text-charcoal sm:text-4xl">
              Nos engagements
            </h2>
          </div>
        </Reveal>
        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {VALUES.map((value, i) => (
            <Reveal key={value.title} delay={i * 100}>
              <div className="flex flex-col items-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose">
                  <value.icon className="h-6 w-6 text-terracotta-dark" />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold text-charcoal">
                  {value.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-charcoal/60">{value.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  )
}
