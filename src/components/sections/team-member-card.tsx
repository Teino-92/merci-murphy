import Image from 'next/image'
import { cn, BLUR_PLACEHOLDER, blurDataURL } from '@/lib/utils'

interface TeamMemberCardProps {
  nom: string
  role: string
  bio: string
  photoSrc?: string
  dominantColor?: string | null
  className?: string
}

export function TeamMemberCard({
  nom,
  role,
  bio,
  photoSrc,
  dominantColor,
  className,
}: TeamMemberCardProps) {
  const blur = dominantColor ? blurDataURL(dominantColor) : BLUR_PLACEHOLDER
  return (
    <div className={cn('flex flex-col items-center text-center', className)}>
      <div
        className={cn('relative h-32 w-32 overflow-hidden rounded-full', photoSrc ? '' : 'hidden')}
      >
        {photoSrc && (
          <Image
            src={photoSrc}
            alt={nom}
            fill
            placeholder="blur"
            blurDataURL={blur}
            className="object-cover"
          />
        )}
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold text-charcoal">{nom}</h3>
      <p className="text-sm font-medium text-terracotta-dark">{role}</p>
      <p className="mt-2 text-sm leading-relaxed text-charcoal/60">{bio}</p>
    </div>
  )
}
