'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'

const STORAGE_KEY = 'mm_cookie_consent'

export function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true)
    }
  }, [])

  function accept() {
    localStorage.setItem(STORAGE_KEY, 'accepted')
    setVisible(false)
  }

  function decline() {
    localStorage.setItem(STORAGE_KEY, 'declined')
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 24, opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-lg rounded-2xl bg-charcoal-light px-6 py-5 shadow-2xl sm:bottom-6 sm:left-6 sm:right-auto sm:max-w-sm"
        >
          <p className="font-display text-sm font-semibold text-cream">
            merci murphy® utilise des cookies 🍪
          </p>
          <p className="mt-1.5 text-xs leading-relaxed text-cream/60">
            Nous utilisons des cookies pour améliorer votre expérience et mesurer l&apos;audience du
            site. Vous pouvez accepter ou refuser.
          </p>
          <div className="mt-4 flex gap-2">
            <Button
              size="sm"
              className="flex-1 bg-terracotta-dark text-white hover:bg-terracotta-dark/90"
              onClick={accept}
            >
              Accepter
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 border-cream/40 bg-transparent text-cream hover:bg-cream/10"
              onClick={decline}
            >
              Refuser
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
