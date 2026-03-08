'use client'

import { cn } from '@/lib/utils'

interface PawStampProps {
  active?: boolean
  className?: string
  inline?: boolean
}

export function PawStamp({ active, className, inline }: PawStampProps) {
  return (
    <span
      aria-hidden
      className={cn(
        'pointer-events-none transition-all duration-300',
        inline
          ? 'inline-flex items-center ml-2 shrink-0'
          : 'absolute top-1/2 -translate-y-1/2 -right-11',
        active
          ? 'opacity-100 scale-100'
          : 'opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100',
        className
      )}
      style={{ rotate: '-15deg' }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/paw.png"
        alt=""
        width={36}
        height={36}
        style={{
          filter:
            'brightness(0) saturate(100%) invert(9%) sepia(47%) saturate(1200%) hue-rotate(220deg) brightness(80%) contrast(110%)',
        }}
      />
    </span>
  )
}
