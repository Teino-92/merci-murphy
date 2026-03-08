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

    // Custom paw marker
    const el = document.createElement('div')
    el.style.cssText = `
      width: 44px;
      height: 44px;
      background-image: url('/paw.png');
      background-size: contain;
      background-repeat: no-repeat;
      background-position: center;
      filter: brightness(0) saturate(100%) invert(9%) sepia(47%) saturate(1200%) hue-rotate(220deg) brightness(80%) contrast(110%);
      cursor: pointer;
    `

    new mapboxgl.Marker({ element: el }).setLngLat([lng, lat]).addTo(map)

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right')

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [lat, lng, zoom])

  return (
    <div
      ref={containerRef}
      className="h-full w-full rounded-2xl overflow-hidden"
      style={{
        cursor: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 100 100'%3E%3Cpath d='M50 38 C42 38,38 41,34 46 C26 44,18 50,18 60 C18 74,32 86,50 97 C68 86,82 74,82 60 C82 50,74 44,66 46 C62 41,58 38,50 38Z' fill='%231D164E'/%3E%3Cellipse cx='24' cy='28' rx='9' ry='11' fill='%231D164E' transform='rotate(-20 24 28)'/%3E%3Cellipse cx='40' cy='18' rx='8.5' ry='11' fill='%231D164E' transform='rotate(-8 40 18)'/%3E%3Cellipse cx='60' cy='18' rx='8.5' ry='11' fill='%231D164E' transform='rotate(8 60 18)'/%3E%3Cellipse cx='76' cy='28' rx='9' ry='11' fill='%231D164E' transform='rotate(20 76 28)'/%3E%3C/svg%3E") 16 16, crosshair`,
      }}
    />
  )
}
