import React from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App'
import Dashboard from './pages/Dashboard'
import Orders from './pages/Orders'
import Holdings from './pages/Holdings'
import Positions from './pages/Positions'
import Funds from './pages/Funds'
import Watchlists from './pages/Watchlists'
import Markets from './pages/Markets'
import Profile from './pages/Profile'
import OrderPad from './pages/OrderPad'
import Login from './pages/Login'
import Forgot from './pages/Forgot'

const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  { path: '/forgot', element: <Forgot /> },
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'orders', element: <Orders /> },
      { path: 'holdings', element: <Holdings /> },
      { path: 'positions', element: <Positions /> },
      { path: 'funds', element: <Funds /> },
      { path: 'watchlists', element: <Watchlists /> },
      { path: 'markets', element: <Markets /> },
      { path: 'profile', element: <Profile /> },
      { path: 'order', element: <OrderPad /> },
    ]
  }
])

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)