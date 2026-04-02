import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Neutral gray fallback for non-Sanity images (Shopify, static)
export const BLUR_PLACEHOLDER = blurDataURL('#E8E8E8')

// Generate a 1×1 SVG base64 data URL from a hex color for next/image blur placeholder
export function blurDataURL(hex: string): string {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='1' height='1'><rect width='1' height='1' fill='${hex}'/></svg>`
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
}
