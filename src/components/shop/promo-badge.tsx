'use client'

import { useProductPromoBadge } from '@/context/promo-context'

interface Props {
  tags: string[]
  className?: string
}

export function ProductPromoBadge({ tags, className }: Props) {
  const label = useProductPromoBadge(tags)
  if (!label) return null
  return (
    <span
      className={
        className ??
        'inline-flex items-center rounded-full bg-terracotta-dark px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white'
      }
    >
      {label}
    </span>
  )
}
