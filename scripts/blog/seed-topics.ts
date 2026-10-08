/**
 * Seed de la file de sujets thématiques du blog (créneau du jeudi).
 *
 * Usage : npm run blog:seed
 *
 * Idempotent : createIfNotExists sur un ID stable, un sujet déjà traité garde son statut.
 * Règle : aucun sujet médical (santé, maladies, alimentation chiffrée, parasites…).
 */

import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { config as loadEnv } from 'dotenv'
import { getWriteClient } from '../seo/lib/sanity-write'

const __dirname = dirname(fileURLToPath(import.meta.url))
loadEnv({ path: join(__dirname, '..', '..', '.env.local') })

type Animal = 'chien' | 'chat' | 'les-deux'
type Category = 'Conseils' | 'Bien-être' | 'Produits' | 'Éducation' | 'Vie à Paris'

interface Topic {
  id: string
  title: string
  angle: string
  animal: Animal
  category: Category
  months?: number[]
}

const TOPICS: Topic[] = [
  {
    id: 'feux-14-juillet-chien',
    title: "Feux d'artifice du 14 juillet : aider son chien à passer la soirée",
    angle:
      'Préparer la soirée en amont : balade plus tôt, pièce calme, fenêtres fermées, bruit de fond, présence. Comportement à adopter soi-même. Aucun produit ni médicament.',
    animal: 'chien',
    category: 'Conseils',
    months: [6, 7],
  },
  {
    id: 'nouvel-an-chat',
    title: 'Réveillon et feux du Nouvel An : un chat serein à la maison',
    angle:
      'Les bruits et les invités du réveillon vus par un chat. Cachettes, pièce refuge, routine conservée, consignes aux invités.',
    animal: 'chat',
    category: 'Bien-être',
    months: [12],
  },
  {
    id: 'sel-trottoirs-coussinets',
    title: "Sel sur les trottoirs l'hiver : prendre soin des coussinets",
    angle:
      "Le sel de déneigement sur les trottoirs parisiens. Rincer et sécher les pattes au retour, baumes, chaussons, éviter les zones très salées. Rester sur l'entretien courant.",
    animal: 'chien',
    category: 'Conseils',
    months: [12, 1, 2],
  },
  {
    id: 'balades-pluie-paris',
    title: 'Promener son chien sous la pluie parisienne',
    angle:
      'Organiser les sorties les jours de pluie : imperméable ou pas, séchage au retour, serviette dans l’entrée, pelage qui sent le chien mouillé, jeux d’intérieur en complément.',
    animal: 'chien',
    category: 'Vie à Paris',
    months: [10, 11, 3],
  },
  {
    id: 'balades-chaleur-paris',
    title: 'Promener son chien pendant les fortes chaleurs à Paris',
    angle:
      'Décaler les horaires, chercher l’ombre et les quais, attention au bitume brûlant, eau en balade, appartement sous les toits. Uniquement confort et organisation.',
    animal: 'chien',
    category: 'Vie à Paris',
    months: [6, 7, 8],
  },
  {
    id: 'chat-appartement-enrichissement',
    title: "Chat d'appartement à Paris : enrichir son quotidien",
    angle:
      'Hauteur, cachettes, fenêtre avec vue, jeux de chasse, rotation des jouets, moments de jeu courts et réguliers dans un petit espace.',
    animal: 'chat',
    category: 'Bien-être',
  },
  {
    id: 'chien-transports-commun',
    title: 'Habituer son chien aux transports en commun',
    angle:
      'Familiariser progressivement son chien au métro, au bus et au taxi : bruits, foule, escaliers, sac de transport pour les petits. Ne pas détailler les règlements, inviter à vérifier les conditions du transporteur.',
    animal: 'chien',
    category: 'Vie à Paris',
  },
  {
    id: 'chiot-premieres-semaines-paris',
    title: 'Un chiot dans un appartement parisien : les premières semaines',
    angle:
      "Préparer l'appartement, coin repos, premières sorties en ville, découverte des bruits, ascenseur, voisins. Patience et routine.",
    animal: 'chien',
    category: 'Éducation',
  },
  {
    id: 'proprete-chiot-etage',
    title: 'Apprendre la propreté à un chiot quand on vit en étage',
    angle:
      'Sorties fréquentes et régulières, repérer les moments clés, récompenser dehors, gérer les escaliers et l’ascenseur, ne pas gronder les accidents.',
    animal: 'chien',
    category: 'Éducation',
  },
  {
    id: 'brossage-entre-toilettages',
    title: 'Le brossage entre deux toilettages : les bons gestes',
    angle:
      'Choisir la brosse selon le type de poil, fréquence, sens du brossage, zones qui feutrent vite (derrière les oreilles, aisselles), faire du brossage un moment agréable.',
    animal: 'chien',
    category: 'Conseils',
  },
  {
    id: 'brosser-son-chat',
    title: 'Brosser son chat : pourquoi et comment s’y prendre',
    angle:
      'Chat à poil court ou long, habituer progressivement, séances courtes, lire les signaux d’agacement, outils adaptés. Quand passer par un toilettage félin.',
    animal: 'chat',
    category: 'Conseils',
  },
  {
    id: 'mue-printemps',
    title: 'La mue de printemps : gérer les poils à la maison',
    angle:
      'Pourquoi les poils tombent davantage au printemps, brossage plus fréquent, démêlage du sous-poil, entretien de l’appartement, intérêt d’un toilettage de saison.',
    animal: 'les-deux',
    category: 'Conseils',
    months: [3, 4, 5],
  },
  {
    id: 'premier-toilettage',
    title: 'Préparer son chien à son premier toilettage',
    angle:
      'Habituer aux manipulations (pattes, oreilles), au bruit du séchoir, venir en visite avant, déroulé d’une séance, à quoi s’attendre au retour.',
    animal: 'chien',
    category: 'Conseils',
  },
  {
    id: 'bain-maison-ou-salon',
    title: 'Le bain à la maison ou au salon : ce qui change',
    angle:
      'Comparer honnêtement : matériel, séchage complet, démêlage, temps passé, salle de bain parisienne étroite. Quand la maison suffit, quand le salon apporte un plus.',
    animal: 'chien',
    category: 'Conseils',
  },
  {
    id: 'chien-seul-journee',
    title: 'Laisser son chien seul en journée quand on travaille à Paris',
    angle:
      'Organiser les absences : balade avant de partir, occupations, retour progressif à la solitude, promeneur, crèche canine certains jours.',
    animal: 'chien',
    category: 'Éducation',
  },
  {
    id: 'creche-premiere-journee',
    title: 'Crèche canine : comment se passe une première journée',
    angle:
      'Ce que vit le chien : accueil, découverte des autres chiens, jeux, repos, retour le soir. Comment préparer la première fois, sans promesse excessive.',
    animal: 'chien',
    category: 'Vie à Paris',
  },
  {
    id: 'chien-au-cafe',
    title: 'Sortir au café avec son chien : les bonnes manières',
    angle:
      'Choisir une table au calme, tapis ou plaid, eau, chien posé au pied de la chaise, demander avant d’entrer, éviter les heures de pointe. Ne citer aucun établissement.',
    animal: 'chien',
    category: 'Vie à Paris',
  },
  {
    id: 'aboiements-immeuble',
    title: 'Chien et voisinage : apaiser les aboiements en immeuble',
    angle:
      'Comprendre pourquoi un chien aboie en appartement (bruits du palier, solitude, ennui), aménagements simples, dépense quotidienne, dialogue avec les voisins.',
    animal: 'chien',
    category: 'Éducation',
  },
  {
    id: 'chien-chat-cohabitation',
    title: 'Faire cohabiter un chien et un chat sous le même toit',
    angle:
      'Présentations progressives, espaces séparés en hauteur pour le chat, gamelles à part, signaux à observer, patience sur plusieurs semaines.',
    animal: 'les-deux',
    category: 'Éducation',
  },
  {
    id: 'vacances-avec-son-chat',
    title: 'Partir en vacances avec son chat ou le faire garder ?',
    angle:
      'Peser les deux options : trajet, caisse de transport, nouveaux lieux, ou garde à domicile. Préparer la caisse en amont. Pour toute question de santé liée au voyage, renvoyer au vétérinaire en une phrase.',
    animal: 'chat',
    category: 'Conseils',
    months: [6, 7],
  },
  {
    id: 'weekend-garde-chien',
    title: 'Partir en week-end : faire garder son chien à Paris',
    angle:
      'Les options de garde (proches, pet-sitter, crèche, pension), préparer ses affaires, transmettre sa routine, anticiper les ponts de mai et la Toussaint.',
    animal: 'chien',
    category: 'Vie à Paris',
    months: [4, 5, 10],
  },
  {
    id: 'manteau-chien-hiver',
    title: "Manteau pour chien l'hiver : utile ou pas ?",
    angle:
      'Selon le pelage et le gabarit, quand un manteau apporte du confort, comment choisir la taille, habituer le chien, entretien. Sans discours santé.',
    animal: 'chien',
    category: 'Produits',
    months: [11, 12, 1],
  },
  {
    id: 'harnais-ou-collier-ville',
    title: 'Harnais ou collier pour marcher en ville',
    angle:
      'Différences de confort, prise en main dans la foule et aux passages piétons, ajustement, laisse adaptée à la ville, entretien du matériel.',
    animal: 'chien',
    category: 'Produits',
  },
  {
    id: 'coin-repas-chat',
    title: 'Aménager le coin repas de son chat dans un petit appartement',
    angle:
      'Emplacement au calme, éloigné de la litière, gamelles larges et peu profondes, fontaine à eau, propreté. Aucune quantité ni régime alimentaire.',
    animal: 'chat',
    category: 'Produits',
  },
  {
    id: 'jouets-occupation-chien',
    title: "Les jouets d'occupation pour un chien d'appartement",
    angle:
      'Tapis de fouille, jouets à garnir, jeux de recherche maison, rotation des jouets, moments d’occupation pendant les absences courtes.',
    animal: 'chien',
    category: 'Produits',
  },
  {
    id: 'griffoir-arbre-a-chat',
    title: 'Griffoirs et arbre à chat quand on manque de place',
    angle:
      'Pourquoi le chat griffe, griffoirs verticaux et horizontaux, emplacements stratégiques, arbre à chat compact, protéger le canapé sans gronder.',
    animal: 'chat',
    category: 'Produits',
  },
  {
    id: 'langage-corporel-chat',
    title: 'Lire le langage corporel de son chat',
    angle:
      'Queue, oreilles, clignement des yeux, ronronnement selon le contexte, signaux pour arrêter une caresse. Mieux comprendre pour mieux cohabiter.',
    animal: 'chat',
    category: 'Éducation',
  },
  {
    id: 'langage-corporel-chien-ville',
    title: 'Comprendre le langage corporel de son chien en ville',
    angle:
      'Signaux d’apaisement, posture face aux autres chiens sur le trottoir, croisements serrés, laisser de l’espace, respecter les signaux de son chien.',
    animal: 'chien',
    category: 'Éducation',
  },
  {
    id: 'rentree-septembre-chien',
    title: 'Rentrée de septembre : retrouver un rythme avec son chien',
    angle:
      'Après l’été, reprendre les horaires de travail, réintroduire progressivement les absences, réorganiser les balades, prévoir un toilettage de rentrée.',
    animal: 'chien',
    category: 'Vie à Paris',
    months: [9],
  },
  {
    id: 'noel-chien-chat',
    title: 'Noël avec un chien ou un chat : des fêtes sans stress',
    angle:
      'Sapin stable, décorations hors de portée, invités et agitation, pièce refuge, cadeaux pour l’animal, garder la routine. Pas de liste d’aliments ni de discours santé.',
    animal: 'les-deux',
    category: 'Bien-être',
    months: [12],
  },
  {
    id: 'chat-balcon-paris',
    title: 'Un chat et un balcon parisien : aménager en sécurité',
    angle:
      'Filet de protection, rebords, plantes en pot, surveillance, premières sorties sur le balcon, fenêtres en position oscillo-battante à éviter.',
    animal: 'chat',
    category: 'Conseils',
    months: [4, 5, 6],
  },
  {
    id: 'rituel-detente-chien',
    title: 'Un rituel de détente pour son chien après la ville',
    angle:
      'Après une balade dans le bruit et la foule : retour au calme, coin repos, caresses lentes, brossage doux, mastication. Un moment de bien-être simple à la maison.',
    animal: 'chien',
    category: 'Bien-être',
  },
]

async function main() {
  const client = getWriteClient()
  let tx = client.transaction()
  for (const t of TOPICS) {
    tx = tx.createIfNotExists({
      _id: `blogTopic-${t.id}`,
      _type: 'blogTopic',
      title: t.title,
      angle: t.angle,
      animal: t.animal,
      category: t.category,
      months: t.months ?? [],
      status: 'todo',
    })
  }
  await tx.commit()
  console.log(`[blog:seed] ${TOPICS.length} sujets vérifiés (createIfNotExists)`)
}

main().catch((e) => {
  console.error('[blog:seed]', e)
  process.exit(1)
})
