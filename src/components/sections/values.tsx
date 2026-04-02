import Image from 'next/image'
import { Leaf, Heart, Sparkles } from 'lucide-react'
import { Section, Container } from '@/components/ui/section'
import { Reveal } from '@/components/ui/reveal'
import { BLUR_PLACEHOLDER } from '@/lib/utils'

const VALUES = [
  {
    icon: Heart,
    title: 'Bien-être animal',
    description:
      'Chaque service, chaque soin est pensé pour le confort de votre animal, dans le respect de ses besoins physiologiques, et de son tempérament.',
  },
  {
    icon: Leaf,
    title: 'Ecoresponsabilité',
    description:
      "Produits naturels, matières biologiques, recyclées, production artisanale française et européenne. consomation d'eau raisonée ",
  },
  {
    icon: Sparkles,
    title: 'Expertise & Bienveillance',
    description:
      'Une équipe passionnée et engagée, un collectif d’experts avec une approche bienveillante et positive',
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
            <p className="mt-3 text-base text-charcoal/60">
              Pour des chiens et des chats bien dans leurs pattes
            </p>
          </div>
        </Reveal>
        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
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

        <Reveal delay={200}>
          <div className="mt-12 relative w-full aspect-[16/7] overflow-hidden rounded-2xl">
            <Image
              src="/vrac-snacks.jpg"
              alt="Distributeurs de snacks en vrac merci murphy®"
              fill
              placeholder="blur"
              blurDataURL={BLUR_PLACEHOLDER}
              className="object-cover object-center"
              sizes="100vw"
            />
          </div>
        </Reveal>
      </Container>
    </Section>
  )
}
