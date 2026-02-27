import React, { useState } from "react";
import {
  useLocation,
  createBrowserRouter,
  RouterProvider,
  Outlet,
} from "react-router-dom";

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
import SimOrderBook from "./pages/SimOrderBook";

/* ✅ Layout Component (Shell Removed) */
function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <div className="min-h-screen text-neutral-900 dark:text-neutral-100 bg-neutral-50 dark:bg-neutral-900">
      <Topbar />
      {/* <MarketBar /> */}
      <div className="flex">
        <LeftRail isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <main className="flex-1 min-w-0 overflow-hidden bg-slate-100">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function PositionWrapper() {
  const { search, pathname } = useLocation();
  // The key changes every time the query string (?mode=...) changes
  return <Positions key={pathname + search} />;
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
      { path: "sim-order-book", element: <SimOrderBook /> },
      { path: "order", element: <SimOrderBook /> },
      { path: "holding", element: <Holdings /> },
      { path: "position", element: <PositionWrapper /> },
      { path: "funds", element: <Funds /> },
      { path: "watchlists", element: <Watchlists /> },
      { path: "markets", element: <Markets /> },
      { path: "profile", element: <Profile /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
