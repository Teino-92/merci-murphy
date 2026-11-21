/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react'],
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), payment=()' },
        ],
      },
    ]
  },
  async redirects() {
    return [
      // Canonicalisation hôte : www → non-www (301).
      // GSC indexe les deux hôtes (ex. /reservation : 275 impr non-www vs 94 www,
      // /compte/connexion : 539 vs 28) → duplication d'hôte. On force non-www.
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.mercimurphy.com' }],
        destination: 'https://mercimurphy.com/:path*',
        permanent: true,
      },
      {
        source: '/home',
        destination: '/',
        permanent: true, // 301
      },
      // Anciennes URLs (site Wix) encore indexées — captent des impressions
      // GSC à ~0% CTR. 301 vers les équivalents Next.js.
      { source: '/services-1', destination: '/services', permanent: true },
      { source: '/services-1-1', destination: '/services', permanent: true },
      { source: '/services-1-2', destination: '/services', permanent: true },
      { source: '/etaussi', destination: '/services', permanent: true },
      { source: '/about', destination: '/concept', permanent: true },
      // Anciens slugs Sanity « maison-poilus-r » (® converti en « r »).
      {
        source: '/services/le-toilettage-maison-poilus-r',
        destination: '/services/toilettage',
        permanent: true,
      },
      {
        source: '/services/le-toilettage-maison-poilus',
        destination: '/services/toilettage',
        permanent: true,
      },
      { source: '/services/le-spa-maison-poilus-r', destination: '/services/spa-chien', permanent: true },
      { source: '/services/balneo-maison-poilus-r', destination: '/services/balneo-chien', permanent: true },
      {
        source: '/services/le-bain-en-libre-service-maison-poilus-r',
        destination: '/services/bain-libre-service',
        permanent: true,
      },
      {
        source: '/services/les-bains-en-libre-service-maison-poilus-r',
        destination: '/services/bain-libre-service',
        permanent: true,
      },
      {
        source: '/services/le-massage-bien-etre-maison-poilus-r-and-le-petit-nenuphar',
        destination: '/services/massage-chien',
        permanent: true,
      },
    ]
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000,
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.sanity.io', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'cdn.shopify.com' },
      { protocol: 'https', hostname: 'behold.pictures' },
      { protocol: 'https', hostname: 'cdn2.behold.pictures' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'cdn.brandfetch.io' },
    ],
  },
}

async function withAnalyzer(config) {
  if (process.env.ANALYZE !== 'true') return config
  const mod = await import('@next/bundle-analyzer')
  return mod.default({ enabled: true })(config)
}

export default await withAnalyzer(nextConfig)
