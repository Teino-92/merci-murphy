import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { CookieBanner } from '@/components/ui/cookie-banner'
import { CartProvider } from '@/context/cart-context'
import { PromoProvider } from '@/context/promo-context'
import { SiteShell } from '@/components/layout/site-shell'
import { SmoothScroll } from '@/components/layout/smooth-scroll'
import { getPublishedPostCount } from '@/sanity/queries/posts'
import { getSiteSettings } from '@/sanity/queries/site-settings'
import { fontVariables } from '@/lib/fonts'
import '../globals.css'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export const metadata: Metadata = {
  metadataBase: new URL('https://mercimurphy.com'),
  title: {
    default: 'Toiletteur chien Paris 9e, merci murphy® · Spa canin Paris 75009',
    template: '%s | Merci Murphy',
  },
  description:
    'Toiletteur chien à Paris 9e (75009), rue Victor Massé. Salon de toilettage premium, bain, spa, crèche et bien-être canin. Sans cage, par des experts.',
  applicationName: 'Merci Murphy',
  alternates: {
    canonical: 'https://mercimurphy.com',
  },
  keywords: [
    'toiletteur chien Paris',
    'toiletteur chien Paris 9',
    'salon de toilettage Paris',
    'toilettage chien Paris',
    'spa chien Paris',
    'crèche chien Paris',
  ],
  openGraph: {
    url: 'https://mercimurphy.com',
    siteName: 'merci murphy®',
    locale: 'fr_FR',
    type: 'website',
    images: [
      {
        url: '/og/og-home.jpg',
        width: 1200,
        height: 630,
        alt: 'merci murphy® — Boutique bien-être pour chiens à Paris',
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default async function MarketingRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [postCount, siteSettings] = await Promise.all([getPublishedPostCount(), getSiteSettings()])
  const showBlog = postCount > 0
  const promoBanner = siteSettings?.promoBanner ?? null

  return (
    <html lang="fr">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="merci murphy" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="dns-prefetch" href="https://cdn.sanity.io" />
        <link rel="dns-prefetch" href="https://cdn.shopify.com" />
        <link rel="dns-prefetch" href="https://feeds.behold.so" />
      </head>
      <body className={`${fontVariables} font-sans antialiased overflow-x-hidden`}>
        <SmoothScroll />
        <CartProvider>
          <PromoProvider banner={promoBanner}>
            <SiteShell showBlog={showBlog} promoBanner={promoBanner}>
              {children}
            </SiteShell>
          </PromoProvider>
        </CartProvider>
        <CookieBanner />
        <Analytics />
        <SpeedInsights />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-C25GTVLGR0"
          strategy="lazyOnload"
        />
        <Script id="gtag-init" strategy="lazyOnload">
          {`
            window.dataLayer=window.dataLayer||[];
            function gtag(){dataLayer.push(arguments);}
            gtag('consent','default',{
              analytics_storage:'denied',
              ad_storage:'denied',
              wait_for_update:500
            });
            gtag('js',new Date());
            gtag('config','G-C25GTVLGR0');
          `}
        </Script>
      </body>
    </html>
  )
}
