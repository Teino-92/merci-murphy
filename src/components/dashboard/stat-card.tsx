interface StatCardProps {
  label: string
  value: string
  sub?: string
  highlight?: boolean
}

export function StatCard({ label, value, sub, highlight }: StatCardProps) {
  return (
    <div
      className={`bg-white rounded-2xl p-6 shadow-sm ${highlight ? 'ring-2 ring-[#C4714A]' : ''}`}
    >
      <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">{label}</p>
      <p className="mt-2 text-3xl font-bold text-[#1D164E]">{value}</p>
      {sub && <p className="mt-1 text-xs text-gray-400">{sub}</p>}
    </div>
  )
}
