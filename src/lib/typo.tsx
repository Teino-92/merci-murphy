import { Children, cloneElement, Fragment, isValidElement, type ReactNode } from 'react'

const NBSP = ' '
const NOWRAP = 'whitespace-nowrap'

/** Longueur maximale (en caractères) du groupe rendu insécable en fin de bloc. */
const MAX_TAIL = 26

/**
 * Variante « souple » pour les titres : le groupe passe entier à la ligne s'il
 * tient, et se replie en interne sinon — jamais de débordement horizontal.
 */
const SOFT = 'inline-block max-w-full'

interface WithChildren {
  children?: ReactNode
  className?: string
  dangerouslySetInnerHTML?: unknown
}

/**
 * Espaces insécables de la typographie française : devant ? ! : ; » et après «.
 * La ponctuation haute ne peut plus passer seule à la ligne.
 */
export function frenchSpaces(text: string): string {
  return text
    .replace(/([^\s ]) ([?!:;»])(?=\s|$)/g, `$1${NBSP}$2`)
    .replace(/^ ([?!:;»])(?=\s|$)/, `${NBSP}$1`)
    .replace(/« (?=\S)/g, `«${NBSP}`)
}

function plainText(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(plainText).join('')
  if (isValidElement<WithChildren>(node)) return plainText(node.props.children)
  return ''
}

function glueTail(text: string, maxTail: number, soft: boolean): ReactNode {
  const trimmed = text.trimEnd()
  const trailing = text.slice(trimmed.length)
  const cut = trimmed.lastIndexOf(' ')
  if (cut <= 0) return text

  let start = trimmed.lastIndexOf(' ', cut - 1) + 1
  if (trimmed.length - start > maxTail) start = cut + 1

  const tail = trimmed.slice(start)
  const lastWordOnly = start === cut + 1
  if (tail.length > maxTail || (lastWordOnly && !tail.includes('-'))) return text

  return (
    <>
      {trimmed.slice(0, start)}
      <span className={soft && !lastWordOnly ? SOFT : NOWRAP}>{tail}</span>
      {trailing}
    </>
  )
}

function isBlank(node: ReactNode): boolean {
  return typeof node === 'string' && node.trim() === ''
}

/**
 * Empêche un mot seul sur la dernière ligne : les deux derniers mots du bloc
 * deviennent insécables (ce qui bloque aussi la coupure au trait d'union).
 * Le texte rendu reste identique ; seule la césure change. À appeler sur le
 * contenu d'un bloc (p, li, titre), y compris quand il vient du CMS.
 */
export function noOrphan(
  node: ReactNode,
  maxTail: number = MAX_TAIL,
  soft: boolean = false
): ReactNode {
  if (typeof node === 'string') return glueTail(frenchSpaces(node), maxTail, soft)

  if (Array.isArray(node)) {
    const items: ReactNode[] = Children.toArray(node).map((item) =>
      typeof item === 'string' ? frenchSpaces(item) : item
    )

    let last = items.length - 1
    while (last >= 0 && isBlank(items[last])) last--
    if (last < 0) return items

    // « <a>mot</a>. » : la ponctuation suit l'élément, c'est lui qu'on protège.
    const lastItem = items[last]
    if (typeof lastItem === 'string' && !lastItem.trim().includes(' ') && last > 0) last--

    const target = items[last]
    const before = items[last - 1]
    const tailLength = items.slice(last).map(plainText).join('').trim().length
    const single = !plainText(target).trim().includes(' ')

    if (single && typeof before === 'string' && before.endsWith(' ')) {
      const word = before.trimEnd().split(' ').pop() ?? ''
      if (word.length + 1 + tailLength <= maxTail) items[last - 1] = before.slice(0, -1) + NBSP
      return items
    }

    items[last] = <Fragment key="tail">{noOrphan(target, maxTail, soft)}</Fragment>
    return items
  }

  if (!isValidElement<WithChildren>(node)) return node

  const { children, className, dangerouslySetInnerHTML } = node.props
  if (dangerouslySetInnerHTML || children == null || typeof children === 'function') return node
  if (className?.includes(NOWRAP) || className?.includes(SOFT)) return node

  return cloneElement(node, undefined, noOrphan(children, maxTail, soft))
}

/**
 * Même protection pour du HTML reçu tel quel (descriptions Shopify) : espaces
 * françaises dans les segments de texte, puis deux derniers mots soudés avant
 * un saut de ligne ou la fermeture d'un paragraphe, d'un item de liste, d'un titre.
 */
export function noOrphanHtml(html: string): string {
  return html
    .replace(/>([^<]+)</g, (_match, text: string) => `>${frenchSpaces(text)}<`)
    .replace(
      // Balises en ligne vides ou fermantes tolérées avant la fin du bloc (collages Word).
      /([^ \t\r\n<>]+) ([^ \t\r\n<>]+)((?:[ \t\r\n]|<\/?(?:u|span|b|i|em|strong)\b[^>]*>)*<(?:\/(?:p|li|h[1-6])|br\b)[^>]*>)/g,
      (match, before: string, last: string, close: string) =>
        before.length + 1 + last.length <= MAX_TAIL ? `${before}${NBSP}${last}${close}` : match
    )
}
