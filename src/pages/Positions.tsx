import React from 'react'

export default function Positions() {
  const rows = [
    { symbol: 'NIFTY24AUGFUT', qty: 50, avg: 22950, ltp: 23010, pnl: 3000 },
    { symbol: 'RELIANCE24AUGFUT', qty: -250, avg: 2890, ltp: 2884, pnl: 1500 },
  ]
  return (
    <div className="card p-4">
      <h2 className="text-lg font-semibold mb-4">Positions</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left opacity-70">
            <tr>
              <th className="py-2">Instrument</th>
              <th>Qty</th>
              <th>Avg</th>
              <th>LTP</th>
              <th>P&amp;L</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.symbol} className="border-t border-neutral-100 dark:border-neutral-700">
                <td className="py-2 font-medium">{r.symbol}</td>
                <td>{r.qty}</td>
                <td>{r.avg.toFixed(2)}</td>
                <td>{r.ltp.toFixed(2)}</td>
                <td className={`${r.pnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{r.pnl.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}