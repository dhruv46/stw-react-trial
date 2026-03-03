import React, { useEffect, useState } from "react";
import {
  useLocation,
  createBrowserRouter,
  RouterProvider,
  Outlet,
} from "react-router-dom";

import Holdings from "./pages/Holdings";
import Positions from "./pages/Positions";
import Funds from "./pages/Funds";
import Watchlists from "./pages/Watchlists";
import Markets from "./pages/Markets";
import Login from "./pages/Login";
import Forgot from "./pages/Forgot";
import Topbar from "./components/Navbar";

import LeftRail from "./components/LeftRail";
import AuthGuard from "./pages/AuthGuard";
import SimOrderBook from "./pages/SimOrderBook";
import Home from "./pages/Home";
import UserList from "./pages/Settings/UserList";
import UserInfo from "./pages/UserInfo";
import StrategyReport from "./pages/StrategyReport";
import DownloadReport from "./pages/DownloadReport";
import Holiday from "./pages/Settings/Holiday";
import TradeBook from "./pages/TradeBook";
import socketService from "./services/socketService";
import AddHoliday from "./pages/Settings/AddHoliday";
import ExceptionalHoliday from "./pages/Settings/ExceptionalHoliday";
import AddExceptionalHoliday from "./pages/Settings/AddExceptionalHoliday";

/* ✅ Layout Component (Shell Removed) */
function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };
  useEffect(() => {
    socketService.connect();
  }, []);

  return (
    <div className="min-h-screen text-neutral-900 dark:text-neutral-100 bg-neutral-50 dark:bg-neutral-900">
      <Topbar />
      {/* <MarketBar /> */}
      <div className="flex h-full">
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
      { index: true, element: <Home /> },
      { path: "sim-order-book", element: <SimOrderBook /> },
      { path: "order", element: <SimOrderBook /> },
      { path: "holding", element: <Holdings /> },
      { path: "position", element: <PositionWrapper /> },
      { path: "report", element: <StrategyReport /> },
      { path: "download-report", element: <DownloadReport /> },
      { path: "trades", element: <TradeBook /> },
      { path: "sim-trade-book", element: <TradeBook /> },
      { path: "trade-edit-mode", element: <TradeBook /> },

      { path: "funds", element: <Funds /> },
      { path: "watchlists", element: <Watchlists /> },
      { path: "markets", element: <Markets /> },
      { path: "user-list", element: <UserList /> },
      { path: "userinfo", element: <UserInfo /> },
      { path: "holiday", element: <Holiday /> },
      { path: "add-holiday", element: <AddHoliday /> },
      { path: "edit-holiday/:id", element: <AddHoliday /> },
      { path: "exceptional-setting", element: <ExceptionalHoliday /> },
      { path: "add-exceptional-holiday", element: <AddExceptionalHoliday /> },
      {
        path: "edit-exceptional-holiday/:id",
        element: <AddExceptionalHoliday />,
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
