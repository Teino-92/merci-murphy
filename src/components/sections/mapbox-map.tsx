'use client'

import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

interface MapboxMapProps {
  lat: number
  lng: number
  zoom?: number
}

export function MapboxMap({ lat, lng, zoom = 15 }: MapboxMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [lng, lat],
      zoom,
      attributionControl: false,
    })

    mapRef.current = map

    // Custom dog marker
    const el = document.createElement('div')
    el.style.cssText = `
      width: 48px;
      height: 48px;
      background-image: url('/cursor-dog-sm.png');
      background-size: contain;
      background-repeat: no-repeat;
      background-position: center;
      cursor: pointer;
    `

    new mapboxgl.Marker({ element: el }).setLngLat([lng, lat]).addTo(map)

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right')

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [lat, lng, zoom])

  return <div ref={containerRef} className="h-full w-full rounded-2xl overflow-hidden" />
}
