'use client'

import Link from 'next/link'
import { PortableText as SanityPortableText, type PortableTextBlock } from '@portabletext/react'

interface PortableTextProps {
  value: PortableTextBlock[]
  className?: string
  light?: boolean
}

export function PortableText({ value, className, light }: PortableTextProps) {
  const body = light ? 'text-cream/80' : 'text-charcoal/70'
  const heading = light ? 'text-cream' : 'text-charcoal'

  return (
    <div className={className}>
      <SanityPortableText
        value={value}
        components={{
          block: {
            normal: ({ children }) => (
              <p className={`mb-4 leading-relaxed last:mb-0 ${body}`}>{children}</p>
            ),
            h2: ({ children }) => (
              <h2 className={`mb-3 mt-6 font-display text-2xl font-semibold ${heading}`}>
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className={`mb-2 mt-4 font-display text-xl font-semibold ${heading}`}>
                {children}
              </h3>
            ),
          },
          marks: {
            link: ({ value, children }) => {
              const href = typeof value?.href === 'string' ? value.href : ''
              const cls = `underline decoration-terracotta-dark/50 underline-offset-4 transition-colors hover:text-terracotta-dark ${heading}`
              if (href.startsWith('/')) {
                return (
                  <Link href={href} className={cls}>
                    {children}
                  </Link>
                )
              }
              return (
                <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
                  {children}
                </a>
              )
            },
          },
          list: {
            bullet: ({ children }) => (
              <ul className={`mb-4 space-y-1 pl-5 [&>li]:list-disc ${body}`}>{children}</ul>
            ),
          },
        }}
      />
    </div>
  )
}
