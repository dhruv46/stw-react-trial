import React from 'react'
import { mockIndices } from '../mock/data'

export default function TickerTape() {
  return (
    <div className="card px-3 py-2 overflow-hidden">
      <div className="flex items-center gap-6 animate-[marquee_35s_linear_infinite] whitespace-nowrap">
        {mockIndices.map(i => (
          <div key={i.name} className="flex items-center gap-2">
            <span className="font-semibold">{i.name}</span>
            <span className="text-sm">{i.value.toFixed(2)}</span>
            <span className={`text-sm ${i.change >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {i.change >= 0 ? '+' : ''}{i.change.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0%); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}