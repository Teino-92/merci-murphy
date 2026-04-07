'use client'

import Link from 'next/link'
import Image from 'next/image'

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ backgroundColor: '#f5f0eb' }}
    >
      <Image src="/logo.avif" alt="merci murphy®" width={140} height={48} className="mb-10" />

      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-terracotta-dark mb-4">
        Erreur 500
      </p>
      <h1 className="font-display text-4xl sm:text-5xl font-normal text-charcoal mb-4 leading-tight">
        Une erreur est survenue
      </h1>
      <p className="text-sm text-charcoal/50 max-w-sm mb-10 leading-relaxed">
        Quelque chose s&apos;est mal passé de notre côté. Nous faisons le nécessaire pour résoudre
        ça au plus vite.
      </p>
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 bg-charcoal text-cream text-sm font-medium px-6 py-3 rounded-full hover:bg-charcoal/90 transition-colors"
        >
          Réessayer
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 border border-charcoal/20 text-charcoal text-sm font-medium px-6 py-3 rounded-full hover:bg-charcoal/5 transition-colors"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  )
}
