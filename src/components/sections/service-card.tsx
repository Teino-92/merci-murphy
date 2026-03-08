import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ServiceCardProps {
  title: string
  description: string
  slug: string
  imageSrc?: string
  className?: string
}

export function ServiceCard({ title, description, slug, imageSrc, className }: ServiceCardProps) {
  return (
    <Link
      href={`/services/${slug}`}
      className={cn(
        'group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow hover:shadow-md',
        className
      )}
    >
      <div className="relative h-48 w-full bg-rose">
        {imageSrc && (
          <Image
            src={imageSrc}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
      </div>
      <div className="p-6">
        <h3 className="font-display text-xl font-semibold text-charcoal">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-charcoal/60 h-10 line-clamp-2">
          {description}
        </p>
        <span className="mt-4 flex items-center gap-1 text-sm font-medium text-terracotta transition-gap group-hover:gap-2">
          En savoir plus <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  )
}
