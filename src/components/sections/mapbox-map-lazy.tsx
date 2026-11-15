'use client'

import dynamic from 'next/dynamic'

// `ssr: false` n'est autorisé que dans un Client Component (Next 15+).
// Mapbox GL dépend de `window` : on le charge uniquement côté navigateur.
export const MapboxMapLazy = dynamic(
  () => import('@/components/sections/mapbox-map').then((m) => m.MapboxMap),
  { ssr: false, loading: () => <div className="h-[420px] w-full bg-cream/50" /> }
)
