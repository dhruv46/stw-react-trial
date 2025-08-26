import React from 'react'

export default function Markets() {
  const indices = [
    { name: 'NIFTY 50', value: 24211.15, change: 0.56 },
    { name: 'NIFTY BANK', value: 52412.30, change: -0.21 },
    { name: 'SENSEX', value: 79501.89, change: 0.43 },
  ]
  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-3 gap-3">
        {indices.map(i => (
          <div key={i.name} className="card p-4">
            <div className="text-sm opacity-70">{i.name}</div>
            <div className="text-2xl font-bold">{i.value.toFixed(2)}</div>
            <div className={`${i.change >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{i.change >= 0 ? '+' : ''}{i.change.toFixed(2)}%</div>
          </div>
        ))}
      </div>
      <div className="card p-6">
        <div className="text-sm opacity-70 mb-2">Intraday Chart (placeholder)</div>
        <div className="h-64 rounded-xl bg-gradient-to-b from-neutral-200/40 to-neutral-200/10 dark:from-neutral-700/30 dark:to-neutral-700/10 flex items-center justify-center">
          <span className="opacity-60">Integrate your charting library here (TV Lightweight, Chart.js, etc.)</span>
        </div>
      </div>
    </div>
  )
}