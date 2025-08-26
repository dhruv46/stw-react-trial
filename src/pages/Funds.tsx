import React from 'react'

export default function Funds() {
  const ledger = [
    { date: '2025-08-01', desc: 'Funds added via UPI', amount: 25000 },
    { date: '2025-08-02', desc: 'Withdrawal', amount: -10000 },
  ]
  const balance = ledger.reduce((a,b)=>a+b.amount, 0)
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="card p-4 md:col-span-1">
        <h3 className="font-semibold mb-2">Available margin</h3>
        <div className="text-3xl font-bold">₹{balance.toLocaleString()}</div>
        <div className="mt-4 flex gap-2">
          <button className="btn">Add Funds</button>
          <button className="btn">Withdraw</button>
        </div>
      </div>
      <div className="card p-4 md:col-span-2">
        <h3 className="font-semibold mb-2">Ledger</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left opacity-70">
              <tr><th className="py-2">Date</th><th>Description</th><th>Amount</th></tr>
            </thead>
            <tbody>
              {ledger.map((l, i) => (
                <tr key={i} className="border-t border-neutral-100 dark:border-neutral-700">
                  <td className="py-2">{l.date}</td>
                  <td>{l.desc}</td>
                  <td className={`${l.amount >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>₹{l.amount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}