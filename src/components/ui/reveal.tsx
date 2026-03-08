'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface RevealProps {
  children: React.ReactNode
  className?: string
  delay?: number
  style?: React.CSSProperties
}

export function Reveal({ children, className, delay = 0, style }: RevealProps) {
  return (
    <motion.div
      className={cn(className)}
      style={style}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, ease: 'easeOut', delay: delay / 1000 }}
    >
      {children}
    </motion.div>
  )
}
