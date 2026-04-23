import { PushToggle } from '@/components/dashboard/push-toggle'

export const metadata = { title: 'Réglages | Merci Murphy' }
export const dynamic = 'force-dynamic'

export default function SettingsPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-semibold text-[#1D164E]">Réglages</h1>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-lg font-semibold text-[#1D164E]">Notifications push</h2>
        <p className="mb-4 text-sm text-charcoal/70">
          Reçois une notification sur ce device pour les nouvelles demandes, réservations et
          acomptes. Fonctionne même app fermée (PWA installée).
        </p>
        <PushToggle />
      </section>
    </div>
  )
}
