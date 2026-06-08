/**
 * Helpers pour convertir du texte brut multi-paragraphe en blocks Portable Text.
 * Format minimal : un bloc par paragraphe, span unique sans annotation.
 */

import { randomBytes } from 'node:crypto'

interface PortableSpan {
  _type: 'span'
  _key: string
  text: string
  marks: string[]
}

export interface PortableBlock {
  _type: 'block'
  _key: string
  style: 'normal' | 'h2' | 'h3'
  markDefs: never[]
  children: PortableSpan[]
}

const key = () => randomBytes(6).toString('hex')

export function textToBlocks(text: string): PortableBlock[] {
  return text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((para) => ({
      _type: 'block' as const,
      _key: key(),
      style: 'normal' as const,
      markDefs: [],
      children: [
        {
          _type: 'span' as const,
          _key: key(),
          text: para,
          marks: [],
        },
      ],
    }))
}
