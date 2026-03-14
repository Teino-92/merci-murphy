import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { CookieBanner } from '@/components/ui/cookie-banner'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://mercimurphy.com'),
  title: {
    default: 'Merci Murphy — Boutique bien-être pour chiens à Paris',
    template: '%s | Merci Murphy',
  },
  description:
    'Toilettage, spa, crèche, éducation et ostéopathie pour votre chien. Boutique premium de bien-être animal à Paris.',
  openGraph: {
    siteName: 'Merci Murphy',
    locale: 'fr_FR',
    type: 'website',
    images: [
      {
        url: '/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'Merci Murphy — Boutique bien-être pour chiens à Paris',
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <head>
        <script async src="https://plausible.io/js/pa-PYgdr6VtQ4YY6wh9emEkQ.js" />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};plausible.init()`,
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${playfair.variable} font-sans antialiased overflow-x-hidden`}
      >
        {children}
        <CookieBanner />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
