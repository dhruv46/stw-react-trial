import React from 'react'
import { NavLink } from 'react-router-dom'
import { ActivitySquare, Banknote, BarChart3, BriefcaseBusiness, Home, LineChart, ListOrdered, ShoppingCart, User } from 'lucide-react'

const links = [
  { to: '/', label: 'Dashboard', icon: Home },
  { to: '/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/holdings', label: 'Holdings', icon: BriefcaseBusiness },
  { to: '/positions', label: 'Positions', icon: ActivitySquare },
  { to: '/funds', label: 'Funds', icon: Banknote },
  { to: '/watchlists', label: 'Watchlists', icon: ListOrdered },
  { to: '/markets', label: 'Markets', icon: BarChart3 },
  { to: '/profile', label: 'Profile', icon: User },
]

export default function Sidebar({ open }: { open: boolean }) {
  return (
    <aside className={`hidden sm:block transition-all duration-300 border-r border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/40 backdrop-blur ${open ? 'w-[var(--sidebar-width-open)]' : 'w-[var(--sidebar-width)]'}`}>
      <div className="h-[56px]" />
      <nav className="px-2 py-4">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 my-0.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 ${isActive ? 'bg-neutral-100 dark:bg-neutral-800' : ''}`
            }
            title={label}
          >
            <Icon size={18} className="opacity-80" />
            <span className={`text-sm transition-opacity ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'} `}>{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="px-3 pb-3">
        <NavLink to="/order" className="inline-flex items-center justify-center gap-2 w-full rounded-xl bg-brand-600 hover:bg-brand-700 text-white py-2 text-sm">
          <LineChart size={18} /> New Order
        </NavLink>
      </div>
    </aside>
  )
}