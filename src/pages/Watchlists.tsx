import React from 'react'
import { mockWatchlist } from '../mock/data'

export default function Watchlists() {
  return (
    <div className="card p-4">
      <h2 className="text-lg font-semibold mb-4">Watchlists</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {[1,2,3].map((listId) => (
          <div key={listId} className="rounded-xl border border-neutral-200 dark:border-neutral-700 p-3">
            <div className="font-medium mb-2">List {listId}</div>
            <div className="space-y-2">
              {mockWatchlist.slice(0,6).map(s => (
                <div key={s.symbol} className="flex items-center justify-between">
                  <div className="font-medium">{s.symbol}</div>
                  <div className={`${s.change >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{s.change >= 0 ? '+' : ''}{s.change.toFixed(2)}%</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}