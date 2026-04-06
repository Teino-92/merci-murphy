import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { CookieBanner } from '@/components/ui/cookie-banner'
import { CartProvider } from '@/context/cart-context'
import { SiteShell } from '@/components/layout/site-shell'
import { SmoothScroll } from '@/components/layout/smooth-scroll'
import { getPublishedPostCount } from '@/sanity/queries/posts'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
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
        url: '/og/og-home.jpg',
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const postCount = await getPublishedPostCount()
  const showBlog = postCount > 0

  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://cdn.sanity.io" />
        <link rel="preconnect" href="https://cdn.shopify.com" />
        <link rel="dns-prefetch" href="https://feeds.behold.so" />
        {/* Google Analytics 4 */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-C25GTVLGR0" />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-C25GTVLGR0');`,
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${playfair.variable} font-sans antialiased overflow-x-hidden`}
      >
        <SmoothScroll />
        <CartProvider>
          <SiteShell showBlog={showBlog}>{children}</SiteShell>
        </CartProvider>
        <CookieBanner />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
