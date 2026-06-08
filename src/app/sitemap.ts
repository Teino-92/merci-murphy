import type { MetadataRoute } from 'next'
import { getAllServicesForSitemap } from '@/sanity/queries/services'
import { getAllPublishedSeoPagesForSitemap } from '@/sanity/queries/seo-pages'
import { getAllProducts } from '@/lib/shopify'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://mercimurphy.com'

  const [services, products, seoPages] = await Promise.all([
    getAllServicesForSitemap(),
    getAllProducts(),
    getAllPublishedSeoPagesForSitemap(),
  ])

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    {
      url: `${base}/toilettage-chien-paris`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${base}/toilettage`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    { url: `${base}/concept`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    {
      url: `${base}/services`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    { url: `${base}/shop`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    {
      url: `${base}/reservation`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    { url: `${base}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    {
      url: `${base}/revendeurs`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${base}/mentions-legales`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.2,
    },
    {
      url: `${base}/confidentialite`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.2,
    },
  ]

  const serviceRoutes: MetadataRoute.Sitemap = services.map((s) => ({
    url: `${base}/services/${s.slug.current}`,
    lastModified: new Date(s._updatedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${base}/shop/${p.handle}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.7,
  }))

  const seoRouteList: MetadataRoute.Sitemap = seoPages.map((p) => ({
    url: `${base}/toilettage/${p.slugRace}`,
    lastModified: new Date(p.publishedAt ?? p._updatedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [...staticRoutes, ...serviceRoutes, ...productRoutes, ...seoRouteList]
}
