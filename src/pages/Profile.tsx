import React from 'react'

export default function Profile() {
  return (
    <div className="card p-4 max-w-2xl">
      <h2 className="text-lg font-semibold mb-4">Profile</h2>
      <form className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <div className="text-sm opacity-70 mb-1">Name</div>
          <input className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2" defaultValue="Dhruv Bhavsar" />
        </label>
        <label className="block">
          <div className="text-sm opacity-70 mb-1">Email</div>
          <input className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2" defaultValue="dhruv@example.com" />
        </label>
        <label className="block">
          <div className="text-sm opacity-70 mb-1">Mobile</div>
          <input className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2" defaultValue="+91 99999 99999" />
        </label>
        <label className="block">
          <div className="text-sm opacity-70 mb-1">Segment</div>
          <select className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2">
            <option>Equity</option>
            <option>F&O</option>
            <option>Commodity</option>
            <option>Currency</option>
          </select>
        </label>
        <div className="sm:col-span-2 mt-2">
          <button className="btn">Save</button>
        </div>
      </form>
    </div>
  )
}