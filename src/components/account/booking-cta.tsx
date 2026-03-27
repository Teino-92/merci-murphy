export function BookingCta() {
  const calendlyUrl = process.env.NEXT_PUBLIC_CALENDLY_URL ?? '#'

  return (
    <div
      className="rounded-[18px] p-5 px-6 mb-3.5 text-white"
      style={{ backgroundColor: '#8B5A3A' }}
    >
      <h3 className="font-display text-[18px] mb-1.5">Prendre rendez-vous</h3>
      <p className="text-[13px] mb-4" style={{ opacity: 0.8 }}>
        Réservez directement en ligne pour votre chien.
      </p>
      <a
        href={calendlyUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block bg-white text-[13px] font-bold px-5 py-2.5 rounded-full"
        style={{ color: '#8B5A3A' }}
      >
        Réserver en ligne
      </a>
    </div>
  )
}
