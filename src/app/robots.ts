import type { MetadataRoute } from 'next'

const DISALLOW = ['/studio/', '/api/', '/dashboard/']

/**
 * AI crawlers are allowed explicitly so the salon stays visible in generative
 * answers (ChatGPT, Claude, Perplexity, Google AI Overviews). They are already
 * covered by the wildcard rule — naming them makes the intent unambiguous.
 */
const AI_CRAWLERS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-User',
  'anthropic-ai',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot-Extended',
  'meta-externalagent',
  'Bytespider',
  'CCBot',
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: DISALLOW },
      { userAgent: AI_CRAWLERS, allow: '/', disallow: DISALLOW },
    ],
    sitemap: 'https://mercimurphy.com/sitemap.xml',
    host: 'https://mercimurphy.com',
  }
}
