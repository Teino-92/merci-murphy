'use client'

import { useScrollReveal } from '@/hooks/use-scroll-reveal'
import { cn } from '@/lib/utils'

interface RevealProps {
  children: React.ReactNode
  className?: string
  /** CSS selector for children to stagger (e.g. ':scope > *') */
  stagger?: string
  y?: number
  delay?: number
}

export function Reveal({ children, className, stagger, y, delay }: RevealProps) {
  const ref = useScrollReveal<HTMLDivElement>(stagger, { y, delay })

  return (
    <div ref={ref} className={cn(className)}>
      {children}
    </div>
  )
}
