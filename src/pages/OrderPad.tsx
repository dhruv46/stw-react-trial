import React, { useState } from 'react'

export default function OrderPad() {
  const [side, setSide] = useState<'BUY'|'SELL'>('BUY')
  const [qty, setQty] = useState(1)
  const [price, setPrice] = useState<number | ''>('' as any)
  const [product, setProduct] = useState<'CNC'|'MIS'|'NRML'>('MIS')
  const [type, setType] = useState<'MARKET'|'LIMIT'>('MARKET')

  return (
    <div className="max-w-xl card p-4">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={()=>setSide('BUY')} className={`px-3 py-2 rounded-xl border ${side==='BUY'?'bg-emerald-500 text-white border-emerald-600':'border-neutral-300 dark:border-neutral-700'}`}>BUY</button>
        <button onClick={()=>setSide('SELL')} className={`px-3 py-2 rounded-xl border ${side==='SELL'?'bg-rose-500 text-white border-rose-600':'border-neutral-300 dark:border-neutral-700'}`}>SELL</button>
        <div className="ml-auto chip">{product}</div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <div className="text-sm opacity-70 mb-1">Symbol</div>
          <input className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2" placeholder="e.g., RELIANCE" />
        </label>
        <label className="block">
          <div className="text-sm opacity-70 mb-1">Qty</div>
          <input type="number" value={qty} onChange={e=>setQty(parseInt(e.target.value || '0'))} className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2" />
        </label>
        <label className="block">
          <div className="text-sm opacity-70 mb-1">Order type</div>
          <select value={type} onChange={e=>setType(e.target.value as any)} className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2">
            <option value="MARKET">Market</option>
            <option value="LIMIT">Limit</option>
          </select>
        </label>
        <label className="block">
          <div className="text-sm opacity-70 mb-1">Price</div>
          <input type="number" value={price} onChange={e=>setPrice(e.target.value ? parseFloat(e.target.value) : '' as any)} className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2" disabled={type==='MARKET'} />
        </label>
        <div className="sm:col-span-2 flex items-center gap-2">
          <label className="inline-flex items-center gap-2"><input type="radio" name="product" checked={product==='CNC'} onChange={()=>setProduct('CNC')} /> CNC</label>
          <label className="inline-flex items-center gap-2"><input type="radio" name="product" checked={product==='MIS'} onChange={()=>setProduct('MIS')} /> MIS</label>
          <label className="inline-flex items-center gap-2"><input type="radio" name="product" checked={product==='NRML'} onChange={()=>setProduct('NRML')} /> NRML</label>
        </div>
        <div className="sm:col-span-2 flex gap-2 mt-2">
          <button className={`flex-1 rounded-xl py-2 ${side==='BUY'?'bg-emerald-600 hover:bg-emerald-700':'bg-rose-600 hover:bg-rose-700'} text-white`}>
            {side==='BUY'?'Place Buy Order':'Place Sell Order'}
          </button>
          <button className="btn">Reset</button>
        </div>
      </div>
    </div>
  )
}