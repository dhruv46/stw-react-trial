import React, { useEffect, useState } from 'react'
import Topbar from '../components/Navbar'
import MarketBar from '../components/MarketBar'
import LeftRail from '../components/LeftRail'

export default function Shell({ children }: { children: React.ReactNode }) {
  const [dummy, setDummy] = useState(false)
  useEffect(()=>{}, [dummy])

  return (
    <div className="min-h-screen text-neutral-900 dark:text-neutral-100 bg-neutral-50 dark:bg-neutral-900">
      <Topbar />
      <MarketBar />
      <div className="flex">
        <LeftRail />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}