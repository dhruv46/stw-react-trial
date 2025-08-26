import React from 'react'
import { Link } from 'react-router-dom'

export default function Forgot() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900 px-4">
      <div className="w-full max-w-sm card p-6">
        <h1 className="text-xl font-semibold mb-4">Reset password</h1>
        <form className="space-y-3" onSubmit={(e)=>e.preventDefault()}>
          <label className="block">
            <div className="text-sm opacity-70 mb-1">Email</div>
            <input type="email" required className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2"/>
          </label>
          <button className="w-full rounded-xl py-2 bg-brand-600 hover:bg-brand-700 text-white">Send reset link</button>
          <div className="text-sm text-center">
            <Link to="/login" className="underline">Back to sign in</Link>
          </div>
        </form>
      </div>
    </div>
  )
}