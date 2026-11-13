import { Suspense } from 'react'

import { CONTAINER } from '@/components/ui/editorial'

import { DeclineForm } from './decline-form'

export default function DeclinePage() {
  return (
    <section className="bg-cream py-20 lg:py-32">
      <div className={CONTAINER}>
        <Suspense>
          <DeclineForm />
        </Suspense>
      </div>
    </section>
  )
}
