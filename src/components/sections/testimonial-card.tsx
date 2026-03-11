import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TestimonialCardProps {
  auteur: string
  note: number
  texte: string
  service?: string
  className?: string
}

export function TestimonialCard({ auteur, note, texte, service, className }: TestimonialCardProps) {
  return (
    <div className={cn('rounded-2xl bg-cream p-6', className)}>
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              'h-4 w-4',
              i < note ? 'fill-terracotta text-terracotta' : 'fill-charcoal/10 text-charcoal/10'
            )}
          />
        ))}
      </div>
      <p className="mt-4 text-sm leading-relaxed text-charcoal/70">&ldquo;{texte}&rdquo;</p>
      <div className="mt-4">
        <p className="text-sm font-semibold text-charcoal">{auteur}</p>
        {service && <p className="text-xs text-charcoal/40">{service}</p>}
      </div>
    </div>
  )
}
