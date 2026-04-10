import Link from 'next/link'

export function BookingCta() {
  return (
    <div
      className="rounded-[18px] p-5 px-6 mb-3.5 text-white"
      style={{ backgroundColor: '#8B5A3A' }}
    >
      <h3 className="font-display text-[18px] mb-1.5">Être rappelé(e)</h3>
      <p className="text-[13px] mb-4" style={{ opacity: 0.8 }}>
        Remplissez le formulaire et notre équipe vous rappelle pour organiser votre rendez-vous.
      </p>
      <Link
        href="/reservation?contact=1"
        className="inline-block bg-white text-[13px] font-bold px-5 py-2.5 rounded-full"
        style={{ color: '#8B5A3A' }}
      >
        Être rappelé(e)
      </Link>
    </div>
  )
}
