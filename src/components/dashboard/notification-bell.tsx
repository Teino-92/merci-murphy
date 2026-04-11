'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Bell, X } from 'lucide-react'
import { createSupabaseBrowserClient } from '@/lib/supabase'

const supabase = createSupabaseBrowserClient()

const STORAGE_KEY = 'dashboard_notifications_seen_at'

interface Notification {
  id: string
  type: 'pending_deposit' | 'visit' | 'lead' | 'newsletter'
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

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unseenCount, setUnseenCount] = useState(0)
  const panelRef = useRef<HTMLDivElement>(null)

  async function load() {
    const seenAt = getSeenAt()

    const [visitsRes, leadsRes, nlRes] = await Promise.all([
      supabase
        .from('visits')
        .select('id, service, status, created_at, profiles(nom, nom_chien)')
        .in('status', ['confirmed', 'pending_deposit'])
        .order('created_at', { ascending: false })
        .limit(20),
      supabase
        .from('leads')
        .select('id, nom, service, created_at')
        .eq('status', 'new')
        .order('created_at', { ascending: false })
        .limit(20),
      supabase
        .from('newsletter_subscribers')
        .select('id, email, created_at')
        .eq('active', true)
        .order('created_at', { ascending: false })
        .limit(10),
    ])

    const SERVICE_LABELS: Record<string, string> = {
      toilettage: 'Toilettage',
      bains: 'Bains',
      balneo: 'Balnéo',
      massage: 'Massage',
      osteo: 'Ostéopathie',
      education: 'Éducation',
      creche: 'Crèche',
    }

    const items: Notification[] = []

    for (const v of visitsRes.data ?? []) {
      const profile = Array.isArray(v.profiles) ? v.profiles[0] : v.profiles
      const name =
        (profile as { nom_chien?: string | null; nom?: string } | null)?.nom_chien ??
        (profile as { nom?: string } | null)?.nom ??
        '—'
      const slug = v.service.split('-')[0]
      items.push({
        id: `visit-${v.id}`,
        type: v.status === 'pending_deposit' ? 'pending_deposit' : 'visit',
        label:
          v.status === 'pending_deposit'
            ? `Acompte en attente — ${name}`
            : `Nouvelle résa — ${name}`,
        sub: SERVICE_LABELS[slug] ?? v.service,
        href: '/dashboard/customers',
        created_at: v.created_at,
      })
    }

    for (const l of leadsRes.data ?? []) {
      items.push({
        id: `lead-${l.id}`,
        type: 'lead',
        label: `Nouvelle demande — ${l.nom}`,
        sub: SERVICE_LABELS[l.service.split('-')[0]] ?? l.service,
        href: '/dashboard/leads',
        created_at: l.created_at,
      })
    }

    for (const s of nlRes.data ?? []) {
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
      .on('postgres_changes', { event: '*', schema: 'public', table: 'visits' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, load)
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
        <div className="absolute left-0 top-8 z-50 w-80 bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
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
