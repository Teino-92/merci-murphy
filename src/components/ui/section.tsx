import { cn } from '@/lib/utils'

interface SectionProps {
  children: React.ReactNode
  className?: string
  as?: 'section' | 'div' | 'article'
}

export function Section({ children, className, as: Tag = 'section' }: SectionProps) {
  return <Tag className={cn('px-4 py-16 sm:px-6 lg:px-8 lg:py-24', className)}>{children}</Tag>
}

export function Container({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={cn('mx-auto max-w-7xl', className)}>{children}</div>
}
