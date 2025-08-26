import React, { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Moon, Search, SunMedium, LogOut, User, Menu } from 'lucide-react'

const nav = [
  { to: '/', label: 'Dashboard' },
  { to: '/orders', label: 'Orders' },
  { to: '/holdings', label: 'Holdings' },
  { to: '/positions', label: 'Positions' },
  { to: '/watchlists', label: 'Watchlists' },
  { to: '/markets', label: 'Markets' },
  { to: '/funds', label: 'Funds' },
  { to: '/profile', label: 'Profile' },
]

export default function Topbar() {
  const [dark, setDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('theme') === 'dark' ||
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
  })
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const root = document.documentElement
    if (dark) {
      root.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      root.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [dark])

  // close menu on route change (basic: close on resize too)
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setOpen(false) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return (
    <header className="sticky top-0 z-30 border-b border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/70 backdrop-blur">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-6 py-2">
        {/* Row: burger + search (left), center nav on md+, profile on right */}
        <div className="flex items-center gap-2">
          {/* Mobile hamburger */}
          <button className="md:hidden btn" aria-label="Toggle navigation" onClick={() => setOpen(v => !v)}>
            <Menu size={18} />
          </button>

          {/* Search - left aligned, grows */}
          <div className="relative flex-1 max-w-sm">
            <input
              placeholder="Search eg: infy, nifty fut, index fund, etc"
              className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white/80 dark:bg-neutral-800 pl-10 pr-3 py-2 outline-none focus:ring-2 ring-brand-400"
            />
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-60" />
          </div>

          {/* Desktop: centered nav occupies middle via separate container below; here keep spacer */}
          <div className="hidden md:flex flex-1 justify-center">
            <nav>
              <ul className="flex gap-1">
                {nav.map(i => (
                  <li key={i.to}>
                    <NavLink
                      to={i.to}
                      className={({isActive}) =>
                        `px-3 py-2 text-sm rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 ${isActive ? 'bg-neutral-100 dark:bg-neutral-800 font-medium' : ''}`
                      }
                      end={i.to==='/'}
                    >
                      {i.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <button onClick={() => setDark(v => !v)} className="btn" title="Toggle theme">
              {dark ? <SunMedium size={18} /> : <Moon size={18} />}
            </button>
            <NavLink to="/profile" className="btn" title="Profile"><User size={18} /></NavLink>
            <NavLink to="/login" className="btn text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30" title="Logout">
              <LogOut size={18} />
            </NavLink>
          </div>
        </div>

        {/* Mobile nav drawer (drops under the row) */}
        {open && (
          <nav className="md:hidden mt-2">
            <ul className="flex flex-wrap gap-1">
              {nav.map(i => (
                <li key={i.to} className="flex-1 min-w-[45%]">
                  <NavLink
                    to={i.to}
                    className={({isActive}) =>
                      `block text-center px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 ${isActive ? 'bg-neutral-100 dark:bg-neutral-800 font-medium' : ''}`
                  }
                  end={i.to==='/'}
                  onClick={() => setOpen(false)}
                  >
                    {i.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </header>
  )
}