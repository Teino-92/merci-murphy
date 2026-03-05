import { Leaf, Heart, MapPin, Sparkles } from 'lucide-react'
import { Section, Container } from '@/components/ui/section'

const VALUES = [
  {
    icon: Heart,
    title: 'Bien-être avant tout',
    description:
      "Chaque soin est pensé pour le confort et l'épanouissement de votre chien, dans le respect de son rythme.",
  },
  {
    icon: Leaf,
    title: 'Écoresponsable',
    description: 'Produits naturels, emballages recyclés, démarche écoresponsable à chaque étape.',
  },
  {
    icon: Sparkles,
    title: 'Expertise premium',
    description:
      'Une équipe passionnée et formée aux meilleures techniques de toilettage, éducation et ostéopathie.',
  },
  {
    icon: MapPin,
    title: 'Ancrage parisien',
    description:
      'Une boutique-concept au cœur de Paris, pensée comme un espace chaleureux pour vous et votre chien.',
  },
]

export function Values() {
  return (
    <Section className="bg-rose/40">
      <Container>
        <div className="text-center">
          <h2 className="font-display text-3xl font-bold text-charcoal sm:text-4xl">
            Nos engagements
          </h2>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((value) => (
            <div key={value.title} className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose">
                <value.icon className="h-6 w-6 text-terracotta" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold text-charcoal">
                {value.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-charcoal/60">{value.description}</p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  )
}
