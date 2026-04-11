import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'merci murphy®',
    short_name: 'merci murphy',
    description: 'Dashboard merci murphy®',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#F5F0E8',
    theme_color: '#1A1A1A',
    orientation: 'portrait',
    icons: [
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/pwa-icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/pwa-icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
