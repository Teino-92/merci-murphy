'use client'

import { PortableText as SanityPortableText, type PortableTextBlock } from '@portabletext/react'

interface PortableTextProps {
  value: PortableTextBlock[]
  className?: string
}

export function PortableText({ value, className }: PortableTextProps) {
  return (
    <div className={className}>
      <SanityPortableText
        value={value}
        components={{
          block: {
            normal: ({ children }) => (
              <p className="mb-4 leading-relaxed text-charcoal/70 last:mb-0">{children}</p>
            ),
            h2: ({ children }) => (
              <h2 className="mb-3 mt-6 font-display text-2xl font-semibold text-charcoal">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="mb-2 mt-4 font-display text-xl font-semibold text-charcoal">
                {children}
              </h3>
            ),
          },
          list: {
            bullet: ({ children }) => (
              <ul className="mb-4 space-y-1 pl-5 text-charcoal/70 [&>li]:list-disc">{children}</ul>
            ),
          },
        }}
      />
    </div>
  )
}
