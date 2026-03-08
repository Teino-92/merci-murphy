import type { Metadata } from 'next'
import { Section, Container } from '@/components/ui/section'

export const metadata: Metadata = {
  title: 'Mentions légales',
  description: 'Mentions légales du site merci murphy®.',
}

export default function MentionsLegalesPage() {
  return (
    <Section className="bg-cream">
      <Container className="max-w-3xl">
        <h1 className="font-display text-3xl font-bold text-charcoal sm:text-4xl">
          Mentions légales
        </h1>

        <div className="mt-10 space-y-8 text-charcoal/80 leading-relaxed">
          <div>
            <h2 className="font-display text-xl font-semibold text-charcoal mb-3">
              Propriété intellectuelle
            </h2>
            <p>
              L&apos;ensemble du contenu du site merci murphy® (textes, images, graphismes, logo,
              vidéos, etc.) est protégé par les lois en vigueur sur la propriété intellectuelle et
              demeure la propriété exclusive de merci murphy®, sauf mention contraire. Toute
              reproduction, représentation, modification ou exploitation, totale ou partielle, du
              site ou de ses contenus, sans autorisation écrite préalable, est strictement
              interdite.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl font-semibold text-charcoal mb-3">
              Données personnelles &amp; Confidentialité
            </h2>
            <p>
              Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi
              Informatique et Libertés, les informations recueillies via le site font l&apos;objet
              d&apos;un traitement destiné à améliorer l&apos;expérience utilisateur et assurer la
              gestion des commandes et services.
            </p>
            <p className="mt-3">
              Vous disposez d&apos;un droit d&apos;accès, de rectification et de suppression des
              données personnelles vous concernant. Pour exercer ce droit, vous pouvez nous
              contacter à l&apos;adresse suivante :{' '}
              <a href="mailto:bonjour@mercimurphy.com" className="text-terracotta hover:underline">
                bonjour@mercimurphy.com
              </a>
              .
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl font-semibold text-charcoal mb-3">Cookies</h2>
            <p>
              Le site merci murphy® utilise des cookies pour améliorer la navigation et analyser
              l&apos;audience. Vous pouvez paramétrer vos préférences en matière de cookies à tout
              moment via les paramètres de votre navigateur.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl font-semibold text-charcoal mb-3">
              Responsabilité
            </h2>
            <p>
              Les informations fournies sur le site sont données à titre indicatif. Nous nous
              efforçons d&apos;assurer l&apos;exactitude des contenus, mais ne pouvons être tenus
              responsables des erreurs, omissions ou d&apos;une éventuelle indisponibilité du site.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl font-semibold text-charcoal mb-3">
              Liens hypertextes
            </h2>
            <p>
              Le site peut contenir des liens vers des sites tiers. Nous ne pouvons être tenus
              responsables du contenu ou des pratiques de ces sites externes.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl font-semibold text-charcoal mb-3">
              Droit applicable
            </h2>
            <p>
              Les présentes mentions légales sont soumises au droit français. En cas de litige, et
              après une tentative de résolution amiable, les tribunaux compétents seront ceux du
              ressort du siège social de merci murphy®.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl font-semibold text-charcoal mb-3">Contact</h2>
            <p>
              Pour toute question relative aux mentions légales, vous pouvez nous contacter à
              l&apos;adresse suivante :{' '}
              <a href="mailto:bonjour@mercimurphy.com" className="text-terracotta hover:underline">
                bonjour@mercimurphy.com
              </a>
              .
            </p>
          </div>
        </div>
      </Container>
    </Section>
  )
}
