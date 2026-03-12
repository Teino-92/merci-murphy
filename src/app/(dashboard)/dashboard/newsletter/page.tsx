import { getNewsletterSubscribers } from '@/lib/supabase-admin'
import { NewsletterTable } from '@/components/dashboard/newsletter-table'

export const dynamic = 'force-dynamic'

export default async function NewsletterPage() {
  const subscribers = await getNewsletterSubscribers()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1D164E]">Newsletter</h1>
        <p className="text-sm text-gray-400 mt-1">
          {subscribers.filter((s) => s.active).length} abonné·e·s actif·ve·s sur{' '}
          {subscribers.length}
        </p>
      </div>
      <NewsletterTable subscribers={subscribers} />
    </div>
  )
}
