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
    ],
  },
}

async function withAnalyzer(config) {
  if (process.env.ANALYZE !== 'true') return config
  const mod = await import('@next/bundle-analyzer')
  return mod.default({ enabled: true })(config)
}

export default await withAnalyzer(nextConfig)
