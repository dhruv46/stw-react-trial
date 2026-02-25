import React, { useEffect } from "react";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import Holdings from "./pages/Holdings";
import Positions from "./pages/Positions";
import Funds from "./pages/Funds";
import Watchlists from "./pages/Watchlists";
import Markets from "./pages/Markets";
import Profile from "./pages/Profile";
import OrderPad from "./pages/OrderPad";
import Login from "./pages/Login";
import Forgot from "./pages/Forgot";
import Topbar from "./components/Navbar";
import MarketBar from "./components/MarketBar";
import LeftRail from "./components/LeftRail";
import AuthGuard from "./pages/AuthGuard";

/* ✅ Layout Component (Shell Removed) */
function Layout() {
  return (
    <div className="min-h-screen text-neutral-900 dark:text-neutral-100 bg-neutral-50 dark:bg-neutral-900">
      <Topbar />
      <MarketBar />
      <div className="flex">
        <LeftRail />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

/* ✅ Router Configuration */
const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  { path: "/forgot", element: <Forgot /> },
  {
    path: "/",
    element: (
      <AuthGuard>
        <Layout />
      </AuthGuard>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: "orders", element: <Orders /> },
      { path: "holdings", element: <Holdings /> },
      { path: "positions", element: <Positions /> },
      { path: "funds", element: <Funds /> },
      { path: "watchlists", element: <Watchlists /> },
      { path: "markets", element: <Markets /> },
      { path: "profile", element: <Profile /> },
      { path: "order", element: <OrderPad /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
