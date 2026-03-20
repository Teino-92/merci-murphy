import type { TarifsToilettage } from '@/sanity/queries/services'

interface Props {
  data: TarifsToilettage
}

export function TarifsToilettageTable({ data }: Props) {
  return (
    <div className="mt-8 space-y-8">
      {/* Notes */}
      {(data.note || data.surDevis) && (
        <div className="space-y-1">
          {data.note && <p className="text-sm text-charcoal/70">{data.note}</p>}
          {data.surDevis && <p className="text-sm italic text-terracotta">{data.surDevis}</p>}
        </div>
      )}

      {/* Main table */}
      {data.gabarits && data.gabarits.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-charcoal/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-charcoal/10 bg-white">
                <th className="py-3 pl-5 pr-3 text-left font-semibold text-charcoal/40 w-[30%]" />
                <th className="px-3 py-3 text-center font-semibold text-charcoal">Bain</th>
                <th className="px-3 py-3 text-center font-semibold text-charcoal leading-tight">
                  Bain + Coupe
                  <span className="block text-xs font-normal text-charcoal/50">
                    (ciseaux ou tonte)
                  </span>
                </th>
                <th className="px-3 py-3 text-center font-semibold text-charcoal">
                  Bain + Épilation
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {data.gabarits.map((gabarit) => (
                <>
                  {/* Category header row */}
                  <tr key={gabarit.label} className="bg-charcoal/5">
                    <td
                      colSpan={4}
                      className="py-2.5 pl-5 pr-3 font-semibold text-charcoal text-sm"
                    >
                      {gabarit.label}
                    </td>
                  </tr>
                  {/* Price rows */}
                  {gabarit.lignes?.map((ligne, i) => (
                    <tr
                      key={i}
                      className="border-t border-charcoal/5 last:border-b last:border-charcoal/5"
                    >
                      <td className="py-3 pl-5 pr-3 text-charcoal/50 text-xs">{ligne.type}</td>
                      <td className="px-3 py-3 text-center font-medium text-charcoal">
                        {ligne.bain || <span className="text-charcoal/30">—</span>}
                      </td>
                      <td className="px-3 py-3 text-center font-medium text-charcoal">
                        {ligne.bainCoupe || <span className="text-charcoal/30">—</span>}
                      </td>
                      <td className="px-3 py-3 text-center font-medium text-charcoal">
                        {ligne.bainEpilation || <span className="text-charcoal/30">—</span>}
                      </td>
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Supplements */}
      {data.supplements && data.supplements.length > 0 && (
        <div className="rounded-2xl border border-charcoal/10 bg-white divide-y divide-charcoal/10">
          {data.supplements.map((s, i) => (
            <div key={i} className="flex items-center justify-between px-5 py-3.5">
              <p className="text-sm text-charcoal">{s.label}</p>
              <p className="ml-4 shrink-0 text-sm font-semibold text-terracotta">{s.prix}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
