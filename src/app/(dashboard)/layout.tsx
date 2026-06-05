import type { Metadata, Viewport } from 'next'
import { fontVariables } from '@/lib/fonts'
import '../globals.css'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function DashboardRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={`${fontVariables} font-sans antialiased`}>{children}</body>
    </html>
  )
}
