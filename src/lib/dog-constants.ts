export const POIDS = [
  { value: '0-5kg', label: 'Moins de 5 kg' },
  { value: '5-10kg', label: '5 – 10 kg' },
  { value: '10-20kg', label: '10 – 20 kg' },
  { value: '20-40kg', label: '20 – 40 kg' },
  { value: '+40kg', label: 'Plus de 40 kg' },
]

export const ETAT_POIL = [
  { value: 'normal', label: 'Normal' },
  { value: 'emmele', label: 'Emmêlé / Nœuds' },
  { value: 'long', label: 'Long' },
  { value: 'court', label: 'Court' },
]

export const SERVICE_LABELS: Record<string, string> = {
  toilettage: 'Toilettage',
  bains: 'Bains',
  creche: 'Crèche',
  education: 'Éducation',
  osteo: 'Ostéopathie',
  autre: 'Autre',
}

export const SERVICE_EMOJI: Record<string, string> = {
  toilettage: '✂️',
  bains: '🛁',
  creche: '🐾',
  education: '🎓',
  osteo: '🤲',
  autre: '📋',
}
