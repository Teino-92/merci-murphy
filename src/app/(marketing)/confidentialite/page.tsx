export const revalidate = 3600

import type { Metadata } from 'next'
import { Section, Container } from '@/components/ui/section'

export const metadata: Metadata = {
  title: 'Politique de confidentialité',
  description:
    'Politique de confidentialité et protection des données personnelles de merci murphy®.',
}

export default function ConfidentialitePage() {
  return (
    <Section className="bg-cream">
      <Container className="max-w-3xl">
        <h1 className="font-display text-3xl font-bold text-charcoal sm:text-4xl">
          Politique de confidentialité
        </h1>

        <div className="mt-4 text-sm text-charcoal/60 italic">
          Dernière mise à jour : janvier 2025
        </div>

        <div className="mt-10 space-y-8 text-charcoal/80 leading-relaxed">
          <div>
            <h2 className="font-display text-xl font-semibold text-charcoal mb-3">
              1) Responsable du traitement
            </h2>
            <p>
              Le responsable du traitement des données collectées sur le site{' '}
              <a
                href="https://www.mercimurphy.com"
                className="text-terracotta-dark hover:underline"
              >
                www.mercimurphy.com
              </a>{' '}
              est :
            </p>
            <ul className="mt-3 ml-4 space-y-1 text-charcoal/70">
              <li>
                <span className="font-medium text-charcoal">Société :</span> Murphy Honsha
              </li>
              <li>
                <span className="font-medium text-charcoal">Adresse :</span> 18, rue Victor Massé,
                75009 Paris — France
              </li>
              <li>
                <span className="font-medium text-charcoal">Email :</span>{' '}
                <a
                  href="mailto:bonjour@mercimurphy.com"
                  className="text-terracotta-dark hover:underline"
                >
                  bonjour@mercimurphy.com
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="font-display text-xl font-semibold text-charcoal mb-3">
              2) Données collectées
            </h2>
            <p>
              Dans le cadre de l&apos;utilisation du site, nous sommes susceptibles de collecter les
              données suivantes :
            </p>
            <ul className="mt-3 ml-4 space-y-2 text-charcoal/70 list-disc list-inside">
              <li>Nom et prénom</li>
              <li>Adresse email</li>
              <li>Adresse postale (pour la livraison)</li>
              <li>Numéro de téléphone</li>
              <li>Données de navigation (cookies, adresse IP)</li>
              <li>Historique de commandes</li>
            </ul>
            <p className="mt-3">
              Ces données sont collectées lorsque vous passez une commande, créez un compte,
              remplissez le formulaire de contact ou vous inscrivez à notre newsletter.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl font-semibold text-charcoal mb-3">
              3) Finalités du traitement
            </h2>
            <p>Vos données personnelles sont utilisées pour :</p>
            <ul className="mt-3 ml-4 space-y-2 text-charcoal/70 list-disc list-inside">
              <li>Gérer vos commandes et assurer leur suivi</li>
              <li>Vous envoyer des confirmations et informations relatives à votre commande</li>
              <li>Gérer votre compte client</li>
              <li>Répondre à vos demandes via le formulaire de contact</li>
              <li>Vous envoyer notre newsletter (avec votre consentement)</li>
              <li>Améliorer notre site et notre offre de produits et services</li>
              <li>Respecter nos obligations légales et réglementaires</li>
            </ul>
          </div>

          <div>
            <h2 className="font-display text-xl font-semibold text-charcoal mb-3">
              4) Base légale du traitement
            </h2>
            <p>Le traitement de vos données est fondé sur :</p>
            <ul className="mt-3 ml-4 space-y-2 text-charcoal/70 list-disc list-inside">
              <li>
                L&apos;exécution d&apos;un contrat : pour le traitement des commandes et la gestion
                de votre compte client
              </li>
              <li>
                Votre consentement : pour l&apos;envoi de la newsletter et l&apos;utilisation de
                cookies non essentiels
              </li>
              <li>
                Notre intérêt légitime : pour l&apos;amélioration de nos services et la sécurité du
                site
              </li>
              <li>
                Le respect d&apos;une obligation légale : pour la conservation de certaines données
                comptables et fiscales
              </li>
            </ul>
          </div>

          <div>
            <h2 className="font-display text-xl font-semibold text-charcoal mb-3">
              5) Durée de conservation
            </h2>
            <p>
              Vos données sont conservées pendant la durée strictement nécessaire aux finalités pour
              lesquelles elles ont été collectées :
            </p>
            <ul className="mt-3 ml-4 space-y-2 text-charcoal/70 list-disc list-inside">
              <li>Données de compte client : jusqu&apos;à la suppression du compte</li>
              <li>Données de commande : 10 ans (obligation légale comptable)</li>
              <li>Données newsletter : jusqu&apos;au désabonnement</li>
              <li>Données de contact : 3 ans à compter du dernier échange</li>
              <li>Cookies : 13 mois maximum</li>
            </ul>
          </div>

          <div>
            <h2 className="font-display text-xl font-semibold text-charcoal mb-3">
              6) Partage des données
            </h2>
            <p>
              Vos données personnelles ne sont jamais vendues à des tiers. Elles peuvent être
              transmises à nos sous-traitants dans le cadre strict de la réalisation de nos services
              :
            </p>
            <ul className="mt-3 ml-4 space-y-2 text-charcoal/70 list-disc list-inside">
              <li>Prestataires de paiement (Sumup®, Shopify Payments)</li>
              <li>Transporteurs et prestataires logistiques</li>
              <li>Outils d&apos;emailing (pour la newsletter)</li>
              <li>Outils d&apos;analyse d&apos;audience</li>
            </ul>
            <p className="mt-3">
              Ces prestataires sont soumis à des obligations contractuelles de confidentialité et ne
              peuvent utiliser vos données qu&apos;aux fins pour lesquelles elles leur ont été
              transmises.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl font-semibold text-charcoal mb-3">7) Cookies</h2>
            <p>
              Le site merci murphy® utilise des cookies pour améliorer la navigation et analyser
              l&apos;audience. Vous pouvez paramétrer vos préférences à tout moment via les
              paramètres de votre navigateur.
            </p>
            <p className="mt-3">Nous utilisons notamment :</p>
            <ul className="mt-3 ml-4 space-y-2 text-charcoal/70 list-disc list-inside">
              <li>
                <span className="font-medium text-charcoal">Cookies essentiels :</span> nécessaires
                au bon fonctionnement du site (panier, session)
              </li>
              <li>
                <span className="font-medium text-charcoal">Cookies analytiques :</span> pour
                mesurer l&apos;audience et améliorer nos contenus (Plausible Analytics — sans
                tracking individuel)
              </li>
            </ul>
          </div>

          <div>
            <h2 className="font-display text-xl font-semibold text-charcoal mb-3">8) Vos droits</h2>
            <p>
              Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi
              Informatique et Libertés, vous disposez des droits suivants :
            </p>
            <ul className="mt-3 ml-4 space-y-2 text-charcoal/70 list-disc list-inside">
              <li>Droit d&apos;accès à vos données personnelles</li>
              <li>Droit de rectification des données inexactes</li>
              <li>Droit à l&apos;effacement (droit à l&apos;oubli)</li>
              <li>Droit à la limitation du traitement</li>
              <li>Droit à la portabilité de vos données</li>
              <li>Droit d&apos;opposition au traitement</li>
              <li>Droit de retirer votre consentement à tout moment</li>
            </ul>
            <p className="mt-3">
              Pour exercer ces droits, contactez-nous à :{' '}
              <a
                href="mailto:bonjour@mercimurphy.com"
                className="text-terracotta-dark hover:underline"
              >
                bonjour@mercimurphy.com
              </a>{' '}
              ou par courrier à Murphy Honsha, 18, rue Victor Massé, 75009 Paris — France.
            </p>
            <p className="mt-3">
              En cas de réponse insatisfaisante, vous pouvez introduire une réclamation auprès de la{' '}
              <a
                href="https://www.cnil.fr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-terracotta-dark hover:underline"
              >
                CNIL
              </a>{' '}
              (Commission Nationale de l&apos;Informatique et des Libertés).
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl font-semibold text-charcoal mb-3">9) Sécurité</h2>
            <p>
              Murphy Honsha met en œuvre toutes les mesures techniques et organisationnelles
              appropriées pour protéger vos données contre tout accès non autorisé, perte,
              destruction ou divulgation. Le site est sécurisé par le protocole HTTPS. Les paiements
              sont traités par des prestataires certifiés PCI-DSS.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl font-semibold text-charcoal mb-3">
              10) Modifications
            </h2>
            <p>
              Cette politique de confidentialité peut être mise à jour à tout moment. La version en
              vigueur est celle publiée sur le site. Nous vous encourageons à la consulter
              régulièrement.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl font-semibold text-charcoal mb-3">11) Contact</h2>
            <p>
              Pour toute question relative à cette politique de confidentialité ou à la protection
              de vos données personnelles, contactez-nous :
            </p>
            <ul className="mt-3 ml-4 space-y-1 text-charcoal/70">
              <li>
                <span className="font-medium text-charcoal">Email :</span>{' '}
                <a
                  href="mailto:bonjour@mercimurphy.com"
                  className="text-terracotta-dark hover:underline"
                >
                  bonjour@mercimurphy.com
                </a>
              </li>
              <li>
                <span className="font-medium text-charcoal">Courrier :</span> Murphy Honsha, 18, rue
                Victor Massé, 75009 Paris — France
              </li>
            </ul>
          </div>
        </div>
      </Container>
    </Section>
  )
}
