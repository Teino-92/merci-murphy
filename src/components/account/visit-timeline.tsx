import type { Visit, Dog } from '@/lib/auth-actions'
import { SERVICE_LABELS, SERVICE_EMOJI } from '@/lib/dog-constants'

interface VisitTimelineProps {
  visits: Visit[]
  dogs: Dog[]
}

export function VisitTimeline({ visits, dogs }: VisitTimelineProps) {
  const dogMap = new Map(dogs.map((d) => [d.id, d.name]))

  return (
    <div className="bg-white rounded-[18px] p-5 border border-[#f0ebe3]">
      <div className="mb-4">
        <span className="text-[13px] font-bold uppercase tracking-[0.1em] text-[#888]">
          Historique des visites
        </span>
      </div>

      {visits.length === 0 ? (
        <p className="text-[13px] text-[#aaa] text-center py-4">Aucune visite enregistrée.</p>
      ) : (
        <>
          {visits.map((visit, i) => (
            <div
              key={visit.id}
              className="flex gap-3.5 items-start py-3"
              style={{
                borderBottom: i < visits.length - 1 ? '1px solid #f5f0eb' : undefined,
              }}
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0 mt-0.5"
                style={{ backgroundColor: '#f0ebe3' }}
              >
                {SERVICE_EMOJI[visit.service] ?? '📋'}
              </div>
              <div>
                <p className="text-[14px] font-semibold text-[#1a1a1a]">
                  {SERVICE_LABELS[visit.service] ?? visit.service}
                </p>
                <p className="text-[12px] text-[#888] mt-0.5">
                  {new Date(visit.date).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
                {visit.dog_id && dogMap.has(visit.dog_id) && (
                  <span
                    className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full mt-1"
                    style={{ backgroundColor: '#f0ebe3', color: '#8B5A3A' }}
                  >
                    🐶 {dogMap.get(visit.dog_id)}
                  </span>
                )}
              </div>
            </div>
          ))}
          <p className="text-[11px] text-[#aaa] text-center mt-2">
            {visits.length} {visits.length === 1 ? 'visite' : 'visites'} au total
          </p>
        </>
      )}
    </div>
  )
}
