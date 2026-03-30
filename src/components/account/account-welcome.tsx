interface AccountWelcomeProps {
  prenom: string
  memberSince: string
  canBook: boolean
}

export function AccountWelcome({ prenom, memberSince, canBook }: AccountWelcomeProps) {
  return (
    <div
      className="rounded-[20px] p-7 mb-5 relative overflow-hidden"
      style={{ backgroundColor: '#B5A89A' }}
    >
      <p
        className="text-[10px] font-semibold tracking-[0.18em] uppercase mb-1.5"
        style={{ color: '#8B5A3A' }}
      >
        Mon espace
      </p>
      <h1 className="font-display text-[26px] font-bold leading-tight mb-1">
        Bonjour, {prenom} 👋
      </h1>
      <p className="text-sm" style={{ color: 'rgba(26,26,26,0.6)' }}>
        membre depuis {memberSince}
      </p>
      {canBook ? (
        <div
          className="inline-flex items-center gap-1.5 text-white text-[11px] font-semibold px-3 py-1.5 rounded-full mt-3.5"
          style={{ backgroundColor: '#8B5A3A' }}
        >
          <span>✓</span> Réservation en ligne activée
        </div>
      ) : (
        <p className="mt-3.5 text-[12px] leading-relaxed" style={{ color: 'rgba(26,26,26,0.55)' }}>
          Pour activer la réservation en ligne, venez nous rendre visite en boutique avec votre
          chien — nous aurons ainsi le plaisir de faire connaissance. 🐾
        </p>
      )}
    </div>
  )
}
