'use client'

import { cn } from '@/lib/utils'

interface PawStampProps {
  active?: boolean
  className?: string
}

/**
 * A dog paw print used as a nav indicator.
 * Looks like a paint-stamped paw — slightly tilted, ink-bleed feel.
 */
export function PawStamp({ active, className }: PawStampProps) {
  return (
    <span
      aria-hidden
      className={cn(
        'pointer-events-none absolute inset-0 flex items-center justify-center -z-10',
        'transition-all duration-300',
        active
          ? 'opacity-100 scale-100'
          : 'opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100',
        className
      )}
      style={{ rotate: '-35deg' }}
    >
      <svg
        width="56"
        height="56"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ color: '#1D164E' }}
      >
        {/* Main pad — heart pointing up: narrows at top, wide rounded bottom */}
        <path
          d="M50 38 C42 38, 38 41, 34 46 C26 44, 18 50, 18 60 C18 74, 32 86, 50 97 C68 86, 82 74, 82 60 C82 50, 74 44, 66 46 C62 41, 58 38, 50 38Z"
          fill="currentColor"
        />

        {/* Top-left toe */}
        <ellipse cx="24" cy="28" rx="9" ry="11" fill="currentColor" transform="rotate(-20 24 28)" />

        {/* Top-center-left toe */}
        <ellipse
          cx="40"
          cy="18"
          rx="8.5"
          ry="11"
          fill="currentColor"
          transform="rotate(-8 40 18)"
        />

        {/* Top-center-right toe */}
        <ellipse cx="60" cy="18" rx="8.5" ry="11" fill="currentColor" transform="rotate(8 60 18)" />

        {/* Top-right toe */}
        <ellipse cx="76" cy="28" rx="9" ry="11" fill="currentColor" transform="rotate(20 76 28)" />
      </svg>
    </span>
  )
}
