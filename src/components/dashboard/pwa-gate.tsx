'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

function isMobile(): boolean {
  if (typeof window === 'undefined') return false
  return /Android|iPhone|iPad|iPod/i.test(window.navigator.userAgent)
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return true
  // Android / desktop Chrome
  if (window.matchMedia('(display-mode: standalone)').matches) return true
  // iOS Safari
  if (
    'standalone' in window.navigator &&
    (window.navigator as { standalone?: boolean }).standalone === true
  )
    return true
  return false
}

export function PwaGate({ children }: { children: React.ReactNode }) {
  const [checked, setChecked] = useState(false)
  const [standalone, setStandalone] = useState(true)

  useEffect(() => {
    // Desktop always passes through — PWA gate is mobile-only
    setStandalone(isStandalone() || !isMobile())
    setChecked(true)
  }, [])

  if (!checked) return null

  if (!standalone) {
    return (
      <div className="min-h-screen bg-[#F5F0E8] flex flex-col items-center justify-center px-6 text-center">
        <Image
          src="/apple-touch-icon.png"
          alt="merci murphy"
          width={80}
          height={80}
          className="rounded-2xl shadow-md mb-8"
        />
        <h1 className="font-display text-2xl font-bold text-charcoal mb-3">
          Installez l&apos;application
        </h1>
        <p className="text-charcoal/60 text-sm max-w-xs leading-relaxed mb-8">
          Le dashboard merci murphy® est réservé à l&apos;application installée sur votre appareil.
        </p>

        <div className="bg-white rounded-2xl border border-charcoal/10 p-5 max-w-xs w-full text-left space-y-4">
          {/* iOS */}
          <div>
            <p className="text-xs font-semibold text-charcoal uppercase tracking-wide mb-2">
              Sur iPhone / iPad
            </p>
            <ol className="text-sm text-charcoal/70 space-y-1.5 list-none">
              <li className="flex items-start gap-2">
                <span className="shrink-0 w-5 h-5 rounded-full bg-rose flex items-center justify-center text-[10px] font-bold text-charcoal mt-0.5">
                  1
                </span>
                Appuyez sur <strong className="text-charcoal mx-1">⎋ Partager</strong> dans Safari
              </li>
              <li className="flex items-start gap-2">
                <span className="shrink-0 w-5 h-5 rounded-full bg-rose flex items-center justify-center text-[10px] font-bold text-charcoal mt-0.5">
                  2
                </span>
                Choisissez{' '}
                <strong className="text-charcoal mx-1">
                  &laquo;&nbsp;Sur l&apos;écran d&apos;accueil&nbsp;&raquo;
                </strong>
              </li>
              <li className="flex items-start gap-2">
                <span className="shrink-0 w-5 h-5 rounded-full bg-rose flex items-center justify-center text-[10px] font-bold text-charcoal mt-0.5">
                  3
                </span>
                Ouvrez l&apos;app depuis votre écran d&apos;accueil
              </li>
            </ol>
          </div>

          <div className="border-t border-charcoal/10" />

          {/* Android */}
          <div>
            <p className="text-xs font-semibold text-charcoal uppercase tracking-wide mb-2">
              Sur Android
            </p>
            <ol className="text-sm text-charcoal/70 space-y-1.5 list-none">
              <li className="flex items-start gap-2">
                <span className="shrink-0 w-5 h-5 rounded-full bg-rose flex items-center justify-center text-[10px] font-bold text-charcoal mt-0.5">
                  1
                </span>
                Appuyez sur <strong className="text-charcoal mx-1">⋮ Menu</strong> dans Chrome
              </li>
              <li className="flex items-start gap-2">
                <span className="shrink-0 w-5 h-5 rounded-full bg-rose flex items-center justify-center text-[10px] font-bold text-charcoal mt-0.5">
                  2
                </span>
                Choisissez{' '}
                <strong className="text-charcoal mx-1">
                  &laquo;&nbsp;Ajouter à l&apos;écran d&apos;accueil&nbsp;&raquo;
                </strong>
              </li>
              <li className="flex items-start gap-2">
                <span className="shrink-0 w-5 h-5 rounded-full bg-rose flex items-center justify-center text-[10px] font-bold text-charcoal mt-0.5">
                  3
                </span>
                Ouvrez l&apos;app depuis votre écran d&apos;accueil
              </li>
            </ol>
          </div>
        </div>

        <p className="mt-8 text-xs text-charcoal/30">merci murphy® · accès équipe uniquement</p>
      </div>
    )
  }

  return <>{children}</>
}
