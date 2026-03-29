import { cn } from '@/lib/utils'

interface RevealProps {
  children: React.ReactNode
  className?: string
  delay?: number
  style?: React.CSSProperties
}

export function Reveal({ children, className, delay = 0, style }: RevealProps) {
  return (
    <div
      className={cn('reveal-anim', className)}
      style={{
        ...style,
        animationDelay: delay ? `${delay}ms` : undefined,
      }}
    >
      {children}
    </div>
  )
}
