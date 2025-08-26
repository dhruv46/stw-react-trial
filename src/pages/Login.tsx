import React from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function Login() {
  const nav = useNavigate()
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // dummy redirect to dashboard
    nav('/')
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900 px-4">
      <div className="w-full max-w-sm card p-6">
        <h1 className="text-xl font-semibold mb-4">Sign in</h1>
        <form className="space-y-3" onSubmit={onSubmit}>
          <label className="block">
            <div className="text-sm opacity-70 mb-1">Email</div>
            <input type="email" required className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2"/>
          </label>
          <label className="block">
            <div className="text-sm opacity-70 mb-1">Password</div>
            <input type="password" required className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2"/>
          </label>
          <div className="flex items-center justify-between text-sm">
            <label className="inline-flex items-center gap-2"><input type="checkbox" /> Remember me</label>
            <Link to="/forgot" className="underline">Forgot password?</Link>
          </div>
          <button className="w-full rounded-xl py-2 bg-brand-600 hover:bg-brand-700 text-white">Sign in</button>
        </form>
      </div>
    </div>
  )
}