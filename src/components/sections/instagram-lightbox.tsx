'use client'

import { useEffect, useCallback } from 'react'
import Image from 'next/image'
import { X, Instagram, ExternalLink } from 'lucide-react'

interface LightboxProps {
  src: string
  alt: string
  permalink: string
  isVideo: boolean
  videoSrc?: string
  onClose: () => void
}

export function InstagramLightbox({
  src,
  alt,
  permalink,
  isVideo,
  videoSrc,
  onClose,
}: LightboxProps) {
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [handleKey])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div className="relative max-h-[90vh] max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white/70 hover:text-white transition-colors"
          aria-label="Fermer"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Media */}
        <div className="relative overflow-hidden rounded-2xl bg-black">
          {isVideo && videoSrc ? (
            <video
              src={videoSrc}
              autoPlay
              loop
              muted
              playsInline
              controls
              className="w-full max-h-[80vh] object-contain"
            />
          ) : (
            <div className="relative w-full" style={{ maxHeight: '80vh' }}>
              <Image
                src={src}
                alt={alt}
                width={800}
                height={1000}
                className="w-full h-auto max-h-[80vh] object-contain"
              />
            </div>
          )}
        </div>

        {/* Footer — link to Instagram */}
        <div className="mt-3 flex justify-end">
          <a
            href={permalink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors"
          >
            <Instagram className="h-4 w-4" />
            Voir sur Instagram
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  )
}
