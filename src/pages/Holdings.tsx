import React from 'react'
import { mockHoldings } from '../mock/data'

export default function Holdings() {
  return (
    <div className="card p-4">
      <h2 className="text-lg font-semibold mb-4">Holdings</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left opacity-70">
            <tr>
              <th className="py-2">Symbol</th>
              <th>Qty</th>
              <th>Avg</th>
              <th>LTP</th>
              <th>P&amp;L</th>
            </tr>
          </thead>
          <tbody>
            {mockHoldings.map(h => (
              <tr key={h.symbol} className="border-t border-neutral-100 dark:border-neutral-700">
                <td className="py-2 font-medium">{h.symbol}</td>
                <td>{h.qty}</td>
                <td>{h.avg.toFixed(2)}</td>
                <td>{h.ltp.toFixed(2)}</td>
                <td className={`${h.pnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{h.pnl.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}