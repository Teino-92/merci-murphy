export const POIDS = [
  { value: '0-5kg', label: 'Moins de 5 kg' },
  { value: '5-10kg', label: '5 – 10 kg' },
  { value: '10-20kg', label: '10 – 20 kg' },
  { value: '20-30kg', label: '20 – 30 kg' },
  { value: '+30kg', label: 'Plus de 30 kg' },
]

export const ETAT_POIL = [
  { value: 'ras', label: 'Ras' },
  { value: 'court', label: 'Court' },
  { value: 'long', label: 'Long' },
  { value: 'long-emmele', label: 'Long et emmêlé' },
]

export const SERVICE_LABELS: Record<string, string> = {
  toilettage: 'Toilettage',
  bains: 'Bains',
  balneo: 'Balnéo',
  massage: 'Massage',
  creche: 'Crèche',
  education: 'Éducation',
  osteo: 'Ostéopathie',
  autre: 'Autre',
}

export const SERVICE_EMOJI: Record<string, string> = {
  toilettage: '✂️',
  bains: '🛁',
  balneo: '💧',
  massage: '🤗',
  creche: '🐾',
  education: '🎓',
  osteo: '🤲',
  autre: '📋',
}
