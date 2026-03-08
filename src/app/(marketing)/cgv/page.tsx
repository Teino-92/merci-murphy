import type { Metadata } from 'next'
import { Section, Container } from '@/components/ui/section'

export const metadata: Metadata = {
  title: 'Conditions générales de vente',
  description: 'Conditions générales de vente de merci murphy®.',
}

export default function CGVPage() {
  return (
    <Section className="bg-cream">
      <Container className="max-w-3xl">
        <h1 className="font-display text-3xl font-bold text-charcoal sm:text-4xl">
          Conditions générales de vente
        </h1>

        <div className="mt-4 space-y-2 text-charcoal/60 text-sm">
          <p>merci murphy®, pour vous et vos compagnons urbains !</p>
          <p>
            Voici nos Conditions Générales de Vente (CGV), qui vous permettent d&apos;accéder à une
            sélection de nos produits présentés dans votre boutique parisienne, même à distance.
          </p>
          <p>
            Une question ? On est là ! Écrivez-nous à{' '}
            <a href="mailto:bonjour@mercimurphy.com" className="text-terracotta hover:underline">
              bonjour@mercimurphy.com
            </a>
            .
          </p>
          <p className="italic">Dernière mise à jour : janvier 2025</p>
        </div>

        <div className="mt-10 space-y-8 text-charcoal/80 leading-relaxed">
          <div>
            <h2 className="font-display text-xl font-semibold text-charcoal mb-3">
              1) Objet des CGV
            </h2>
            <p>
              Ces conditions visent à définir les modalités de vente à distance entre notre société
              (Murphy Honsha) et vous (client), de la commande au paiement et à la livraison. Elles
              règlent toutes les étapes nécessaires à la passation de la commande et assurent le
              suivi de cette commande entre nous.
            </p>
            <p className="mt-3">
              Les CGV s&apos;appliquent à toutes les commandes passées sur{' '}
              <a href="https://www.mercimurphy.com" className="text-terracotta hover:underline">
                www.mercimurphy.com
              </a>{' '}
              et/ou{' '}
              <a
                href="https://mercimurphy.myshopify.com"
                className="text-terracotta hover:underline"
              >
                mercimurphy.myshopify.com
              </a>{' '}
              (le site).
            </p>
            <p className="mt-3">
              Nos CGV pouvant faire l&apos;objet de modifications, les conditions applicables sont
              celles en vigueur sur le site à la date de votre passation de commande. Elles
              prévaudront, le cas échéant, sur toute autre version ou tout autre document
              contradictoire.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl font-semibold text-charcoal mb-3">2) Commandes</h2>
            <p>
              Tout client garantit être âgé d&apos;au moins 18 ans et avoir la capacité juridique ou
              être mineur émancipé ou titulaire d&apos;une autorisation parentale lui permettant
              d&apos;effectuer une commande sur le site.
            </p>
            <p className="mt-3">
              Toute commande vaut acceptation expresse et irrévocable des prix et des descriptions
              des produits disponibles à la vente. Le client déclare avoir pris connaissance et
              accepté irrévocablement les CGV avant la passation de sa commande. La validation de la
              commande vaut donc acceptation expresse des CGV.
            </p>
            <p className="mt-3">
              Le client a la possibilité de passer sa commande en ligne 7 jours sur 7 dans la limite
              des stocks disponibles. La disponibilité peut varier dans une même journée en fonction
              du niveau des ventes. Aussi, bien que Murphy Honsha effectue une mise à jour très
              fréquente des disponibilités, il est possible qu&apos;un article se vende en boutique
              sans avoir été décompté immédiatement du stock en ligne.
            </p>
            <p className="mt-3">
              En cas d&apos;indisponibilité du produit concerné, le client sera prévenu directement
              sur le site ou par email, afin de déterminer s&apos;il convient d&apos;annuler la
              commande ou de modifier le produit concerné.
            </p>
            <p className="mt-3">
              Le client devra vérifier l&apos;exhaustivité et la conformité des renseignements
              fournis lors de sa commande, en particulier concernant son adresse de livraison.
              Murphy Honsha ne sera pas tenu responsable d&apos;éventuelles erreurs de saisie et des
              retards ou erreurs de livraison qui en découleraient.
            </p>
            <p className="mt-3">
              Lorsque le client aura complété l&apos;adresse et le mode de livraison et validé son
              mode de paiement, la commande sera validée. La vente sera considérée comme définitive
              après encaissement par Murphy Honsha de l&apos;intégralité du coût de la commande.
            </p>
            <p className="mt-3">
              Dans certains cas, notamment défaut de paiement, adresse erronée ou autre problème sur
              le compte du client, Murphy Honsha se réserve le droit de bloquer la commande
              jusqu&apos;à la résolution du problème. Les mauvais comportements ou signes
              d&apos;agressivité envers merci murphy® entraîneront immédiatement l&apos;annulation
              de la commande concernée.
            </p>
            <p className="mt-3">
              Pour suivre l&apos;avancement de sa commande, exercer son droit de rétractation, pour
              toute question ou besoin d&apos;information notre service client est à votre
              disposition :
            </p>
            <ul className="mt-2 ml-4 space-y-1 text-charcoal/70">
              <li>
                Par email :{' '}
                <a
                  href="mailto:bonjour@mercimurphy.com"
                  className="text-terracotta hover:underline"
                >
                  bonjour@mercimurphy.com
                </a>
              </li>
              <li>Par courrier : Murphy Honsha, 18, rue Victor Massé, 75009 Paris — France</li>
            </ul>
          </div>

          <div>
            <h2 className="font-display text-xl font-semibold text-charcoal mb-3">3) Prix</h2>
            <p>
              Les prix sont indiqués en euros TTC incluant la TVA et hors frais de livraison, qui
              restent à la charge du client sauf conditions particulières.
            </p>
            <p className="mt-3">
              Murphy Honsha peut modifier ses prix à tout moment mais s&apos;engage à appliquer les
              tarifs en vigueur indiqués au moment de l&apos;enregistrement de la commande, sous
              réserve de disponibilité à cette date.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl font-semibold text-charcoal mb-3">
              4) Mode et Sécurisation du paiement
            </h2>
            <p>
              Toute commande passée sur le site est une commande avec obligation de paiement, ce qui
              signifie que la passation de la commande implique un règlement du client.
            </p>
            <p className="mt-3">
              Le client aura le choix de régler sa commande au moyen de l&apos;ensemble des modes de
              paiement mis à sa disposition par Murphy Honsha et listés sur le site.
            </p>
            <p className="mt-3">
              Murphy Honsha se réserve le droit de suspendre toute gestion de commande et toute
              livraison en cas de refus d&apos;autorisation de paiement par carte bancaire de la
              part des organismes officiellement accrédités ou en cas de non-paiement.
            </p>
            <p className="mt-3">
              Le paiement du prix s&apos;effectue en totalité au jour de la commande. Le paiement
              est entièrement sécurisé sur notre site grâce au système de paiement en ligne de notre
              partenaire Sumup®.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl font-semibold text-charcoal mb-3">
              5) Confirmation et suivi de commande
            </h2>
            <p>
              À la suite de la validation de sa commande, le client recevra une confirmation de
              commande sur l&apos;email renseigné au moment de la passation de cette dernière.
            </p>
            <p className="mt-3">
              Pour toute question relative au suivi d&apos;une commande, le client peut envoyer un
              mail à{' '}
              <a href="mailto:bonjour@mercimurphy.com" className="text-terracotta hover:underline">
                bonjour@mercimurphy.com
              </a>
              .
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl font-semibold text-charcoal mb-3">
              6) Informations sur les produits
            </h2>
            <p>
              Les produits proposés à la vente par Murphy Honsha sont ceux figurant sur le site, au
              jour de la consultation du site par le client. Les produits sont décrits avec la plus
              grande exactitude possible. Toutefois, si des erreurs ou des omissions venaient à se
              produire dans cette présentation, la responsabilité de Murphy Honsha ne pourrait être
              engagée. Les photographies et les textes illustrant les produits n&apos;ont
              qu&apos;une valeur indicative et n&apos;ont pas de valeur contractuelle.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl font-semibold text-charcoal mb-3">
              7) Livraison et frais de livraison
            </h2>
            <p>
              Les frais de livraison sont facturés au client en fonction du poids et volume du
              colis, du lieu de livraison et du mode de transport choisis. Ils sont affichés en
              fonction du mode de livraison choisi, sur la page avant la validation de la commande.
            </p>
            <p className="mt-3">
              Pour les commandes en dehors de l&apos;Union Européenne, le client est
              l&apos;importateur des produits concernés. Des droits de douane, taxes locales, droits
              d&apos;importation ou taxes d&apos;État sont susceptibles d&apos;être exigés. Ces
              droits et sommes ne sont pas du ressort de Murphy Honsha. Ils sont à la charge du
              client et relèvent de son entière responsabilité.
            </p>
            <p className="mt-3">Délai de traitement et de livraison :</p>
            <ul className="mt-2 ml-4 space-y-3 text-charcoal/70">
              <li>
                Murphy Honsha s&apos;engage à traiter toutes commandes passées en ligne avec
                diligence. Selon les articles commandés et l&apos;affluence en boutique, le délai de
                traitement et de préparation d&apos;une commande est de 3 à 5 jours ouvrés suivant
                le paiement de la commande.
              </li>
              <li>
                Les délais de transport dépendent du transporteur choisi par le client et du lieu de
                livraison. Ces délais sont donnés à titre indicatif et ne comprennent pas les
                samedis, dimanches et jours fériés.
              </li>
            </ul>
            <p className="mt-3">
              En cas de colis égaré, le client doit déclarer la perte dans les 10 jours suivant la
              réception de l&apos;avis d&apos;expédition. Murphy Honsha effectuera les réclamations
              nécessaires auprès du transporteur. Si le colis n&apos;est pas retrouvé, le client
              pourra demander le renvoi du même produit ou le remboursement de la somme versée.
            </p>
            <p className="mt-3">
              Toute réclamation doit être adressée à{' '}
              <a href="mailto:bonjour@mercimurphy.com" className="text-terracotta hover:underline">
                bonjour@mercimurphy.com
              </a>{' '}
              ou par courrier à Murphy Honsha, 18 rue Victor Massé, 75009 Paris — France, le jour
              même de la livraison ou au plus tard le premier jour ouvré suivant.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl font-semibold text-charcoal mb-3">
              8) Garantie et conformité
            </h2>
            <p>
              En cas de produit non conforme, vous pourrez formuler vos réclamations auprès de notre
              service client (
              <a href="mailto:bonjour@mercimurphy.com" className="text-terracotta hover:underline">
                bonjour@mercimurphy.com
              </a>
              ). En cas de vice apparent ou de non-conformité dûment constaté, le client pourra
              obtenir le remplacement gratuit ou le remboursement du produit, au choix de Murphy
              Honsha.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl font-semibold text-charcoal mb-3">
              9) Droit de rétractation, retours et échanges
            </h2>
            <p>
              Conformément aux dispositions du code de la consommation, le client dispose d&apos;un
              délai de 14 jours à compter de la date de livraison de sa commande pour retourner tout
              article ne lui convenant pas et demander l&apos;échange ou le remboursement sans
              pénalité, à l&apos;exception des frais de retour qui restent à la charge du client.
            </p>
            <p className="mt-3">
              Les articles personnalisés (médailles, produits brodés, etc.) ne sont ni repris, ni
              remboursés ni échangés, de même que les articles soldés.
            </p>
            <p className="mt-3">
              La demande de retour peut s&apos;effectuer en contactant Murphy Honsha par email à{' '}
              <a href="mailto:bonjour@mercimurphy.com" className="text-terracotta hover:underline">
                bonjour@mercimurphy.com
              </a>
              . Murphy Honsha s&apos;engage à rembourser le client dans un délai de 15 jours ouvrés
              à compter de la réception du retour.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl font-semibold text-charcoal mb-3">
              10) Cas de force majeure
            </h2>
            <p>
              Toutes circonstances indépendantes de la volonté de Murphy Honsha empêchant
              l&apos;exécution dans des conditions normales de leurs obligations sont considérées
              comme des causes d&apos;exonération de ses obligations et entraînent leur suspension
              (grève, incendies, inondations, arrêt des réseaux de télécommunication, etc.).
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl font-semibold text-charcoal mb-3">
              11) Traitement des données personnelles
            </h2>
            <p>
              Pour en savoir plus sur la manière dont nous traitons vos données, rendez-vous sur
              notre{' '}
              <a href="/confidentialite" className="text-terracotta hover:underline">
                Politique de confidentialité
              </a>
              .
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl font-semibold text-charcoal mb-3">
              12) Propriété intellectuelle
            </h2>
            <p>
              Le contenu du site est la propriété seule de Murphy Honsha, seul titulaire des droits
              de propriété intellectuelle sur ce contenu. Les clients s&apos;engagent à ne faire
              aucun usage de ce contenu ; toute reproduction totale ou partielle est strictement
              interdite et est susceptible de constituer un délit de contrefaçon.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl font-semibold text-charcoal mb-3">
              13) Législation en vigueur
            </h2>
            <p>
              Toute disposition des CGV qui viendrait à être nulle, illégale ou non applicable pour
              quelque raison que ce soit sera réputée dissociée du reste des CGV qui demeureront
              valables et exécutoires.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl font-semibold text-charcoal mb-3">
              14) Durée et application
            </h2>
            <p>
              Les CGV s&apos;appliquent pendant toute la durée de mise en ligne des produits
              proposés par Murphy Honsha. Murphy Honsha peut décider à tout moment d&apos;apporter
              des modifications aux présentes CGV. Dans tous les cas, les CGV applicables sont
              celles en vigueur au jour de l&apos;enregistrement de la commande du client.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl font-semibold text-charcoal mb-3">
              15) Territorialité et juridiction
            </h2>
            <p>
              Les CGV sont soumises à l&apos;application du droit français. En cas de litige ou de
              réclamation, le client s&apos;adressera en priorité au service client de Murphy Honsha
              pour obtenir une solution amiable. En l&apos;absence de solution amiable, le tribunal
              compétent sera le tribunal de commerce de Paris.
            </p>
            <p className="mt-3">
              Le client peut ouvrir un litige en adressant une demande écrite à Murphy Honsha, 18
              rue Victor Massé, 75009 Paris, ou par email à{' '}
              <a href="mailto:bonjour@mercimurphy.com" className="text-terracotta hover:underline">
                bonjour@mercimurphy.com
              </a>
              .
            </p>
            <p className="mt-3">
              Conformément à l&apos;article L.616-1 du code de la consommation, le client peut
              gratuitement recourir à un service de médiation. Il peut également saisir la
              plateforme de règlement en ligne des litiges via :{' '}
              <a
                href="https://ec.europa.eu/consumers/odr/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-terracotta hover:underline"
              >
                ec.europa.eu/consumers/odr
              </a>
              .
            </p>
          </div>
        </div>
      </Container>
    </Section>
  )
}
