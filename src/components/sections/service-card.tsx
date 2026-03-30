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
      href={slug === '__services__' ? '/services' : `/services/${slug}`}
      className={cn(
        'group block overflow-hidden rounded-2xl shadow-sm transition-shadow hover:shadow-md',
        className
      )}
    >
      <div className="relative w-full aspect-[4/3] overflow-hidden rounded-2xl">
        {/* Image */}
        {imageSrc && (
          <Image
            src={imageSrc}
            alt={title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
        {/* Gradient overlay — bottom half fades to charcoal */}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/30 to-transparent" />
        {/* Text on top of image — fixed height so all cards align */}
        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-5 flex flex-col justify-end h-[120px] sm:h-[160px]">
          <h3 className="font-display text-base sm:text-xl font-semibold text-cream line-clamp-2 min-h-[40px] sm:min-h-[56px]">
            {title}
          </h3>
          <p className="mt-1 text-xs sm:text-sm leading-relaxed text-cream/70 line-clamp-2 hidden sm:block min-h-[40px]">
            {description}
          </p>
          <span className="mt-2 sm:mt-3 flex items-center gap-1 text-xs sm:text-sm font-medium text-terracotta-dark transition-all group-hover:gap-2">
            En savoir plus <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
          </span>
        </div>
      </div>
    </Link>
  )
}
