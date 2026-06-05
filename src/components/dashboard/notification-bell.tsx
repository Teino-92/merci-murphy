'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { Bell, X } from 'lucide-react'
import { createSupabaseBrowserClient } from '@/lib/supabase'

const supabase = createSupabaseBrowserClient()

const STORAGE_KEY = 'dashboard_notifications_seen_ids'

interface Notification {
  id: string
  type: 'pending_deposit' | 'visit' | 'lead' | 'newsletter' | 'declined' | 'deposit_paid'
  label: string
  sub: string
  href: string
  created_at: string
}

function getSeenIds(): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as string[])
  } catch {
    return new Set()
  }
}

function markAllSeen(ids: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
}

const SERVICE_LABELS: Record<string, string> = {
  toilettage: 'Toilettage',
  bains: 'Bains',
  balneo: 'Balnéo',
  massage: 'Massage',
  osteo: 'Ostéopathie',
  education: 'Éducation',
  creche: 'Crèche',
}

type VisitRow = {
  id: string
  profile_id: string
  dog_id?: string | null
  service: string
  status: string
  date: string
  time: string | null
  created_at: string
  deposit_paid_at?: string | null
  profiles: { nom?: string } | { nom?: string }[] | null
  dogs: { name?: string } | null
}

function visitToNotif(v: VisitRow, type: Notification['type'], label: string): Notification {
  const profile = Array.isArray(v.profiles) ? v.profiles[0] : v.profiles
  const clientName = profile?.nom ?? '—'
  const firstDog = v.dogs?.name
  const slug = v.service.split('-')[0]
  const serviceLabel = SERVICE_LABELS[slug] ?? v.service
  const dateLabel = v.date
    ? new Date(`${v.date}T12:00:00Z`).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
      })
    : ''
  const dogOrClient = firstDog ?? clientName
  const eventAt = type === 'deposit_paid' ? (v.deposit_paid_at ?? v.created_at) : v.created_at
  return {
    id: `visit-${v.id}-${type}`,
    type,
    label: label.replace('{name}', dogOrClient),
    sub: `${serviceLabel}${dateLabel ? ` · ${dateLabel}` : ''}`,
    href: `/dashboard/customers/${v.profile_id}`,
    created_at: eventAt,
  }
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set())
  const panelRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [panelPos, setPanelPos] = useState<{ top: number; left: number } | null>(null)

  const unseenCount = notifications.filter((n) => !seenIds.has(n.id)).length

  async function load() {
    const currentSeenIds = getSeenIds()

    const res = await fetch('/api/dashboard/notifications')
    if (!res.ok) return
    const { visits, declined, depositPaid, leads, newsletter } = (await res.json()) as {
      visits: VisitRow[]
      declined: VisitRow[]
      depositPaid: VisitRow[]
      leads: { id: string; nom: string; service: string; created_at: string }[]
      newsletter: { id: string; email: string; created_at: string }[]
    }

    const items: Notification[] = []

    for (const v of visits) {
      const type: Notification['type'] =
        v.status === 'pending_deposit' ? 'pending_deposit' : 'visit'
      const label =
        v.status === 'pending_deposit'
          ? 'Acompte en attente · {name}'
          : v.status === 'new'
            ? 'Nouvelle visite · {name}'
            : 'Rdv confirmé · {name}'
      items.push(visitToNotif(v, type, label))
    }

    for (const v of declined) {
      items.push(visitToNotif(v, 'declined', 'Créneau refusé · {name}'))
    }

    for (const v of depositPaid) {
      items.push(visitToNotif(v, 'deposit_paid', 'Acompte reçu · {name}'))
    }

    for (const l of leads) {
      items.push({
        id: `lead-${l.id}`,
        type: 'lead',
        label: `Nouvelle demande — ${l.nom}`,
        sub: SERVICE_LABELS[l.service.split('-')[0]] ?? l.service,
        href: '/dashboard/leads',
        created_at: l.created_at,
      })
    }

    for (const s of newsletter) {
      items.push({
        id: `nl-${s.id}`,
        type: 'newsletter',
        label: `Newsletter — ${s.email}`,
        sub: 'Nouvel abonné',
        href: '/dashboard/newsletter',
        created_at: s.created_at,
      })
    }

    items.sort((a, b) => b.created_at.localeCompare(a.created_at))
    setNotifications(items)
    setSeenIds(currentSeenIds)
  }

  useEffect(() => {
    load()

    const channel = supabase
      .channel('notif-bell')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'visits' }, () => {
        load()
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'visits' }, () => {
        load()
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'leads' }, () => {
        load()
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'leads' }, load)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'newsletter_subscribers' },
        load
      )
      .subscribe()

    // PWA-safe refresh paths:
    // 1) Service Worker push → posts a message to all dashboard clients.
    //    Catches notifications even when the realtime WebSocket was suspended.
    // 2) visibilitychange → reload when the user brings the app back to foreground.
    function handleSwMessage(e: MessageEvent) {
      if (e.data?.type === 'push-received') load()
    }
    function handleVisibility() {
      if (document.visibilityState === 'visible') load()
    }
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleSwMessage)
    }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      supabase.removeChannel(channel)
      if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleSwMessage)
      }
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  function markAllRead() {
    const ids = notifications.map((n) => n.id)
    markAllSeen(ids)
    setSeenIds(new Set(ids))
  }

  function toggle() {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setPanelPos({ top: rect.bottom + 8, left: rect.left })
    }
    setOpen((prev) => !prev)
  }

  const TYPE_COLORS: Record<string, string> = {
    pending_deposit: 'bg-amber-400',
    visit: 'bg-emerald-400',
    lead: 'bg-blue-400',
    newsletter: 'bg-purple-400',
    declined: 'bg-red-400',
    deposit_paid: 'bg-teal-400',
  }

  function relativeTime(iso: string) {
    const diff = Date.now() - new Date(iso).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `il y a ${mins || 1} min`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `il y a ${hrs}h`
    const days = Math.floor(hrs / 24)
    return `il y a ${days}j`
  }

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={toggle}
        className="relative text-white/60 hover:text-white transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unseenCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-[#B85C38] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
            {unseenCount > 9 ? '9+' : unseenCount}
          </span>
        )}
      </button>

      {open &&
        createPortal(
          <div
            ref={panelRef}
            className="fixed z-[200] w-80 bg-white rounded-2xl shadow-xl border border-gray-100 flex flex-col max-h-[min(24rem,calc(100dvh-6rem))]"
            style={panelPos ? { top: panelPos.top, left: panelPos.left } : {}}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
              <p className="text-sm font-semibold text-[#1D164E]">Notifications</p>
              <div className="flex items-center gap-3">
                {unseenCount > 0 && (
                  <button onClick={markAllRead} className="text-xs text-[#B85C38] hover:underline">
                    Tout marquer lu
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="text-gray-400 hover:text-[#1D164E]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div
              className="overflow-y-auto divide-y divide-gray-50 overscroll-contain"
              onWheel={(e) => e.stopPropagation()}
            >
              {notifications.length === 0 ? (
                <p className="px-4 py-6 text-sm text-gray-400 text-center">Aucune notification</p>
              ) : (
                notifications.map((n) => {
                  const read = seenIds.has(n.id)
                  return (
                    <Link
                      key={n.id}
                      href={n.href}
                      onClick={() => {
                        const next = new Set(seenIds)
                        next.add(n.id)
                        markAllSeen(Array.from(next))
                        setSeenIds(next)
                        setOpen(false)
                      }}
                      className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <span
                        className={`mt-1.5 w-2 h-2 rounded-full shrink-0 border-2 ${
                          read
                            ? 'bg-transparent border-gray-300'
                            : `${TYPE_COLORS[n.type]} border-transparent`
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm truncate ${read ? 'font-normal text-gray-500' : 'font-semibold text-[#1D164E]'}`}
                        >
                          {n.label}
                        </p>
                        <p className="text-xs text-gray-400">
                          {n.sub} · {relativeTime(n.created_at)}
                        </p>
                      </div>
                    </Link>
                  )
                })
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  )
}
