import React from 'react'
import Shell from './layouts/Shell'
import { Outlet } from 'react-router-dom'

export default function App() {
  return (
    <Shell>
      <Outlet />
    </Shell>
  )
}