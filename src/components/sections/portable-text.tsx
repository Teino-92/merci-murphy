'use client'

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
