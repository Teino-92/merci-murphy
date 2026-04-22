'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Bell, X } from 'lucide-react'
import { createSupabaseBrowserClient } from '@/lib/supabase'

const supabase = createSupabaseBrowserClient()

const STORAGE_KEY = 'dashboard_notifications_seen_at'

interface Notification {
  id: string
  type: 'pending_deposit' | 'visit' | 'lead' | 'newsletter' | 'declined' | 'deposit_paid'
  label: string
  sub: string
  href: string
  created_at: string
}

function getSeenAt(): string {
  if (typeof window === 'undefined') return new Date(0).toISOString()
  return localStorage.getItem(STORAGE_KEY) ?? new Date(0).toISOString()
}

function markSeen() {
  localStorage.setItem(STORAGE_KEY, new Date().toISOString())
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
  service: string
  status: string
  date: string
  time: string | null
  created_at: string
  deposit_paid_at?: string | null
  profiles:
    | { nom?: string; dogs?: { name?: string }[] }
    | { nom?: string; dogs?: { name?: string }[] }[]
    | null
}

function visitToNotif(v: VisitRow, type: Notification['type'], label: string): Notification {
  const profile = Array.isArray(v.profiles) ? v.profiles[0] : v.profiles
  const clientName = profile?.nom ?? '—'
  const firstDog = profile?.dogs?.[0]?.name
  const slug = v.service.split('-')[0]
  const serviceLabel = SERVICE_LABELS[slug] ?? v.service
  const dateLabel = v.date
    ? new Date(`${v.date}T12:00:00Z`).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
      })
    : ''
  const dogOrClient = firstDog ?? clientName
  return {
    id: `visit-${v.id}-${type}`,
    type,
    label: label.replace('{name}', dogOrClient),
    sub: `${serviceLabel}${dateLabel ? ` · ${dateLabel}` : ''}`,
    href: `/dashboard/customers/${v.profile_id}`,
    created_at: type === 'deposit_paid' ? (v.deposit_paid_at ?? v.created_at) : v.created_at,
  }
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unseenCount, setUnseenCount] = useState(0)
  const panelRef = useRef<HTMLDivElement>(null)

  async function load() {
    const seenAt = getSeenAt()

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
    setUnseenCount(items.filter((n) => n.created_at > seenAt).length)
  }

  useEffect(() => {
    load()

    const channel = supabase
      .channel('notif-bell')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'visits' },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (payload: { new: Record<string, any>; old: Record<string, any> }) => {
          const tokenCleared = payload.old.respond_token && !payload.new.respond_token
          const depositJustPaid = !payload.old.deposit_paid_at && payload.new.deposit_paid_at

          if (tokenCleared || depositJustPaid) {
            setUnseenCount((c) => c + 1)
          }
          load()
        }
      )
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'visits' }, () => {
        setUnseenCount((c) => c + 1)
        load()
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'leads' }, () => {
        setUnseenCount((c) => c + 1)
        load()
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'leads' }, load)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'newsletter_subscribers' },
        load
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
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

  function toggle() {
    if (!open) {
      setOpen(true)
      markSeen()
      setUnseenCount(0)
    } else {
      setOpen(false)
    }
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
    <div className="relative" ref={panelRef}>
      <button
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

      {open && (
        <div className="absolute right-0 lg:right-auto lg:left-0 top-8 z-50 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-[#1D164E]">Notifications</p>
            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-[#1D164E]">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto divide-y divide-gray-50">
            {notifications.length === 0 ? (
              <p className="px-4 py-6 text-sm text-gray-400 text-center">Aucune notification</p>
            ) : (
              notifications.map((n) => (
                <Link
                  key={n.id}
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${TYPE_COLORS[n.type]}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1D164E] truncate">{n.label}</p>
                    <p className="text-xs text-gray-400">
                      {n.sub} · {relativeTime(n.created_at)}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
