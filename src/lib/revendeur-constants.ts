export const TYPE_COMMERCE_LABELS: Record<string, string> = {
  boutique: 'Boutique indépendante',
  'concept-store': 'Concept-store',
  toiletteur: 'Toiletteur / salon',
  animalerie: 'Animalerie',
  ecommerce: 'E-commerce',
  autre: 'Autre',
}

export const TYPE_COMMERCE_VALUES = Object.keys(TYPE_COMMERCE_LABELS) as [string, ...string[]]
