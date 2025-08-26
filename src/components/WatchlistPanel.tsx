import React from 'react'
import { mockWatchlist } from '../mock/data'

export default function WatchlistPanel() {
  return (
    <div className="card p-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">Watchlist</h3>
        <span className="chip">NSE</span>
      </div>
      <div className="divide-y divide-neutral-100 dark:divide-neutral-700">
        {mockWatchlist.map((s) => (
          <div key={s.symbol} className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <div className={`w-1.5 h-6 rounded ${s.change >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              <div>
                <div className="font-medium">{s.symbol}</div>
                <div className="text-xs opacity-70">{s.name}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold">{s.last.toFixed(2)}</div>
              <div className={`text-xs ${s.change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{s.change >= 0 ? '+' : ''}{s.change.toFixed(2)}%</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}