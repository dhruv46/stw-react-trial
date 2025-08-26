import React from 'react'
import { mockIndices } from '../mock/data'

export default function MarketBar() {
  return (
    <div className="sticky top-[56px] z-20 border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-6 py-2 flex gap-6 overflow-x-auto">
        {mockIndices.map(i => (
          <div key={i.name} className="flex items-center gap-2 text-sm min-w-fit">
            <span className="opacity-70">{i.name}</span>
            <span className="font-semibold">{i.value.toFixed(2)}</span>
            <span className={`${i.change >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {i.change >= 0 ? '+' : ''}{i.change.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}