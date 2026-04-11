/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    staleTimes: {
      dynamic: 0,
      static: 0,
    },
  },
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true, // 301
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
    ],
  },
}

export default nextConfig
