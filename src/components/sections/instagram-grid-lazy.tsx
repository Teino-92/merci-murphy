'use client'

import dynamic from 'next/dynamic'
import { InView } from 'react-intersection-observer'
import type { FeedPost } from './instagram-grid'

const InstagramGrid = dynamic(() => import('./instagram-grid').then((m) => m.InstagramGrid), {
  ssr: false,
  loading: () => <InstagramGridSkeleton />,
})

function InstagramGridSkeleton() {
  return (
    <div className="mt-8">
      <div
        className="grid gap-2 sm:hidden"
        style={{
          gridTemplateColumns: 'repeat(2, 1fr)',
          gridTemplateRows: 'repeat(3, 160px)',
        }}
      >
        <div className="rounded-2xl bg-white/5" style={{ gridColumn: '1 / 2', gridRow: '1 / 3' }} />
        <div className="rounded-2xl bg-white/5" style={{ gridColumn: '2 / 3', gridRow: '1 / 2' }} />
        <div className="rounded-2xl bg-white/5" style={{ gridColumn: '1 / 2', gridRow: '3 / 4' }} />
        <div className="rounded-2xl bg-white/5" style={{ gridColumn: '2 / 3', gridRow: '2 / 4' }} />
      </div>
      <div
        className="hidden sm:grid gap-2"
        style={{
          gridTemplateColumns: 'repeat(4, 1fr)',
          gridTemplateRows: 'repeat(3, 200px)',
        }}
      >
        <div className="rounded-2xl bg-white/5" style={{ gridColumn: '1 / 2', gridRow: '1 / 2' }} />
        <div className="rounded-2xl bg-white/5" style={{ gridColumn: '2 / 3', gridRow: '1 / 4' }} />
        <div className="rounded-2xl bg-white/5" style={{ gridColumn: '3 / 4', gridRow: '1 / 2' }} />
        <div className="rounded-2xl bg-white/5" style={{ gridColumn: '4 / 5', gridRow: '1 / 4' }} />
        <div className="rounded-2xl bg-white/5" style={{ gridColumn: '1 / 2', gridRow: '2 / 4' }} />
        <div className="rounded-2xl bg-white/5" style={{ gridColumn: '3 / 4', gridRow: '2 / 4' }} />
      </div>
    </div>
  )
}

export function InstagramGridLazy({ posts }: { posts: FeedPost[] }) {
  return (
    <InView triggerOnce rootMargin="200px 0px">
      {({ inView, ref }) => (
        <div ref={ref} style={{ minHeight: '480px' }}>
          {inView ? <InstagramGrid posts={posts} /> : <InstagramGridSkeleton />}
        </div>
      )}
    </InView>
  )
}
