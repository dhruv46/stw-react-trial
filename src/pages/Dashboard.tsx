import React from 'react'
import { mockHoldings, mockOrders } from '../mock/data'

export default function Dashboard() {
  const eq = { marginAvailable: 0, marginsUsed: 0, opening: 0 }
  const com = { marginAvailable: 0, marginsUsed: 0, opening: 0 }
  const holdingsCount = mockHoldings.length
  const totalPL = mockHoldings.reduce((a,b)=>a+b.pnl,0)
  const current = mockHoldings.reduce((a,b)=>a+(b.ltp*b.qty),0)
  const invested = mockHoldings.reduce((a,b)=>a+(b.avg*b.qty),0)

  return (
    <div className="space-y-4">
      <section className="grid grid-cols-12 gap-4">
        <div className="col-span-12 card p-5">
          <h2 className="text-xl font-semibold mb-4">Hi, Dhruvkumar</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <div className="font-semibold mb-2">Equity</div>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div><div className="opacity-60">Margin available</div><div className="text-lg font-semibold">{eq.marginAvailable}</div></div>
                <div><div className="opacity-60">Margins used</div><div className="text-lg font-semibold">{eq.marginsUsed}</div></div>
                <div><div className="opacity-60">Opening balance</div><div className="text-lg font-semibold">{eq.opening}</div></div>
              </div>
            </div>
            <div>
              <div className="font-semibold mb-2">Commodity</div>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div><div className="opacity-60">Margin available</div><div className="text-lg font-semibold">{com.marginAvailable}</div></div>
                <div><div className="opacity-60">Margins used</div><div className="text-lg font-semibold">{com.marginsUsed}</div></div>
                <div><div className="opacity-60">Opening balance</div><div className="text-lg font-semibold">{com.opening}</div></div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-12 card p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="font-semibold">Holdings ({holdingsCount})</div>
            <div className="text-sm opacity-60">Current value <span className="font-semibold">{(current/1000).toFixed(1)}k</span> · Investment <span className="font-semibold">{(invested/1000).toFixed(1)}k</span></div>
          </div>
          <div className="text-4xl font-bold mb-2">{totalPL >= 0 ? '₹' : '-₹'}{Math.abs(totalPL).toLocaleString(undefined,{maximumFractionDigits:2})} <span className={`text-lg ${totalPL>=0?'text-emerald-600':'text-rose-600'}`}>{totalPL>=0?'+':''}{((totalPL/invested)*100).toFixed(2)}%</span></div>
          <div className="h-4 rounded-lg bg-brand-600/20 dark:bg-brand-600/30 relative overflow-hidden">
            <div className="absolute inset-y-0 left-0 bg-brand-600" style={{width: `${Math.min(100, (current/invested)*100)}%`}} />
          </div>
        </div>

        <div className="col-span-12 card p-5">
          <div className="font-semibold mb-3">Market overview</div>
          <div className="h-48 rounded-xl bg-gradient-to-b from-neutral-200/40 to-neutral-200/10 dark:from-neutral-700/30 dark:to-neutral-700/10 flex items-center justify-center">
            <span className="opacity-60">Chart placeholder</span>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-12 gap-4">
        <div className="col-span-12 card p-5">
          <div className="font-semibold mb-3">Recent orders</div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left opacity-70">
                <tr>
                  <th className="py-2">Time</th>
                  <th>Symbol</th>
                  <th>Type</th>
                  <th>Qty</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {mockOrders.slice(0,6).map(o => (
                  <tr key={o.id} className="border-t border-neutral-100 dark:border-neutral-700">
                    <td className="py-2">{o.time}</td>
                    <td className="font-medium">{o.symbol}</td>
                    <td>{o.side}</td>
                    <td>{o.qty}</td>
                    <td><span className="chip">{o.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}