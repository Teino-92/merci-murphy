'use client'

import { useGsapReveal } from '@/hooks/use-gsap-reveal'
import { cn } from '@/lib/utils'

interface RevealProps {
  children: React.ReactNode
  className?: string
  delay?: number
  style?: React.CSSProperties
}

export function Reveal({ children, className, delay = 0, style }: RevealProps) {
  const ref = useGsapReveal(delay)

  return (
    <div ref={ref} className={cn(className)} style={{ ...style, opacity: 0 }}>
      {children}
    </div>
  )
}
