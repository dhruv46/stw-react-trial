import React from 'react'
import { mockOrders } from '../mock/data'

export default function Orders() {
  return (
    <div className="card p-4">
      <h2 className="text-lg font-semibold mb-4">Orders</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left opacity-70">
            <tr>
              <th className="py-2">Time</th>
              <th>Symbol</th>
              <th>Side</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {mockOrders.map(o => (
              <tr key={o.id} className="border-t border-neutral-100 dark:border-neutral-700">
                <td className="py-2">{o.time}</td>
                <td className="font-medium">{o.symbol}</td>
                <td>{o.side}</td>
                <td>{o.qty}</td>
                <td>{o.price?.toFixed(2) ?? '-'}</td>
                <td><span className="chip">{o.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}