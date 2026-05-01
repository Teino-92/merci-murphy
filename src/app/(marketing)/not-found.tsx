import Link from 'next/link'
import Image from 'next/image'

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ backgroundColor: '#f5f0eb' }}
    >
      <Image src="/logo.avif" alt="merci murphy®" width={140} height={48} className="mb-10" />

      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-terracotta-dark mb-4">
        Erreur 404
      </p>
      <h1 className="font-display text-4xl sm:text-5xl font-normal text-charcoal mb-4 leading-tight">
        Page introuvable
      </h1>
      <p className="text-sm text-charcoal/50 max-w-sm mb-10 leading-relaxed">
        Cette page n&apos;existe pas ou a été déplacée. Pas de panique — votre chien, lui, sait
        toujours où il est.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 bg-charcoal text-cream text-sm font-medium px-6 py-3 rounded-full hover:bg-charcoal/90 transition-colors"
      >
        Retour à l&apos;accueil
      </Link>
    </div>
  )
}
