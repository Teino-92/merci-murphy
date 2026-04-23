'use client'

import { useEffect, useState } from 'react'

type State =
  | 'unsupported'
  | 'ios-needs-install'
  | 'denied'
  | 'default-unsubbed'
  | 'granted-unsubbed'
  | 'granted-subbed'
  | 'loading'

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  const output = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i)
  return output
}

export function PushToggle() {
  const [state, setState] = useState<State>('loading')

  useEffect(() => {
    let cancelled = false

    async function detect() {
      if (typeof window === 'undefined') return
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (navigator as unknown as { standalone?: boolean }).standalone === true

      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        if (!cancelled) setState('unsupported')
        return
      }
      if (isIOS && !isStandalone) {
        if (!cancelled) setState('ios-needs-install')
        return
      }

      if (Notification.permission === 'denied') {
        if (!cancelled) setState('denied')
        return
      }

      try {
        const reg = await navigator.serviceWorker.ready
        const sub = await reg.pushManager.getSubscription()
        if (cancelled) return
        if (sub) {
          setState('granted-subbed')
        } else if (Notification.permission === 'granted') {
          setState('granted-unsubbed')
        } else {
          setState('default-unsubbed')
        }
      } catch {
        if (!cancelled) setState('unsupported')
      }
    }

    detect()
    return () => {
      cancelled = true
    }
  }, [])

  async function activate() {
    setState('loading')
    try {
      const perm = await Notification.requestPermission()
      if (perm !== 'granted') {
        setState(perm === 'denied' ? 'denied' : 'default-unsubbed')
        return
      }

      const vapid = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!vapid) {
        setState('unsupported')
        return
      }

      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapid) as BufferSource,
      })

      const json = sub.toJSON() as { keys?: { p256dh?: string; auth?: string } }
      const keys = json.keys
      if (!keys?.p256dh || !keys.auth) {
        setState('unsupported')
        return
      }

      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: sub.endpoint,
          keys: { p256dh: keys.p256dh, auth: keys.auth },
          userAgent: navigator.userAgent,
        }),
      })
      if (!res.ok) {
        await sub.unsubscribe().catch(() => {})
        setState('granted-unsubbed')
        return
      }

      setState('granted-subbed')
    } catch {
      setState('granted-unsubbed')
    }
  }

  async function deactivate() {
    setState('loading')
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        await sub.unsubscribe().catch(() => {})
        await fetch('/api/push/subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        }).catch(() => {})
      }
      setState('granted-unsubbed')
    } catch {
      setState('granted-unsubbed')
    }
  }

  if (state === 'loading') {
    return <div className="text-sm text-charcoal/60">Chargement…</div>
  }
  if (state === 'unsupported') {
    return (
      <p className="text-sm text-charcoal/70">
        Navigateur non compatible avec les notifications push.
      </p>
    )
  }
  if (state === 'ios-needs-install') {
    return (
      <p className="text-sm text-charcoal/70">
        Sur iPhone/iPad : ouvrez ce site dans Safari → Partager → « Sur l&apos;écran d&apos;accueil ». Rouvrez
        ensuite l&apos;app depuis l&apos;icône pour activer les notifications.
      </p>
    )
  }
  if (state === 'denied') {
    return (
      <p className="text-sm text-charcoal/70">
        Permissions bloquées. Réactivez les notifications dans les réglages du navigateur ou du
        système, puis rechargez la page.
      </p>
    )
  }
  if (state === 'granted-subbed') {
    return (
      <div className="flex flex-col gap-2">
        <span className="inline-flex items-center gap-2 text-sm text-emerald-700">
          <span className="h-2 w-2 rounded-full bg-emerald-500" /> Notifications actives
        </span>
        <button
          type="button"
          onClick={deactivate}
          className="self-start rounded-xl bg-charcoal/10 px-4 py-2 text-sm font-medium text-charcoal hover:bg-charcoal/20"
        >
          Désactiver
        </button>
      </div>
    )
  }
  // default-unsubbed | granted-unsubbed
  return (
    <button
      type="button"
      onClick={activate}
      className="rounded-xl bg-[#1D164E] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
    >
      Activer les notifications push
    </button>
  )
}
