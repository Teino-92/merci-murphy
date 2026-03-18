// Server component — pure display, no interactivity needed

export interface PayoutEntry {
  id: string
  date: string
  amount: number
  fee: number
  net: number
  status: string
  currency: string
}

interface Props {
  payouts: PayoutEntry[]
}

function formatEUR(v: number, currency = 'EUR') {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(v)
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toUpperCase()
  const variants: Record<string, string> = {
    PAID: 'bg-green-50 text-green-700 ring-1 ring-green-200',
    PENDING: 'bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200',
    FAILED: 'bg-red-50 text-red-700 ring-1 ring-red-200',
  }
  const cls = variants[normalized] ?? 'bg-gray-50 text-gray-600 ring-1 ring-gray-200'
  const labels: Record<string, string> = {
    PAID: 'Versé',
    PENDING: 'En attente',
    FAILED: 'Échoué',
  }
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}
    >
      {labels[normalized] ?? normalized}
    </span>
  )
}

export function SumUpPayouts({ payouts }: Props) {
  const display = payouts.slice(0, 5)

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-5">
        Derniers virements SumUp
      </p>

      {display.length === 0 ? (
        <p className="text-sm text-gray-300 text-center py-6">Aucun virement trouvé</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                <th className="text-left pb-3 pr-4">Date</th>
                <th className="text-right pb-3 pr-4">Brut</th>
                <th className="text-right pb-3 pr-4">Frais SumUp</th>
                <th className="text-right pb-3 pr-4">Net</th>
                <th className="text-left pb-3">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {display.map((payout) => (
                <tr key={payout.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 pr-4 text-gray-700 whitespace-nowrap">
                    {formatDate(payout.date)}
                  </td>
                  <td className="py-3 pr-4 text-right font-medium text-[#1D164E] whitespace-nowrap">
                    {formatEUR(payout.amount, payout.currency)}
                  </td>
                  <td className="py-3 pr-4 text-right text-red-500 whitespace-nowrap">
                    -{formatEUR(payout.fee, payout.currency)}
                  </td>
                  <td className="py-3 pr-4 text-right font-bold text-[#1D164E] whitespace-nowrap">
                    {formatEUR(payout.net, payout.currency)}
                  </td>
                  <td className="py-3">
                    <StatusBadge status={payout.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
