import React, { useEffect, useRef, useState } from "react";
import {
  useLocation,
  createBrowserRouter,
  RouterProvider,
  Outlet,
} from "react-router-dom";
import eventBus from "./utils/eventBus";
import { message } from "antd";

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
import ClientSetting from "./pages/Settings/ClientSetting";
import AddClient from "./pages/Settings/AddClient";
import MoneyManegement from "./pages/Settings/MoneyManegement";
import AddMoneyManagement from "./pages/Settings/AddMoneyManagement";
import GreekSoftList from "./pages/Settings/GreekSoftList";
import AddGreekSoft from "./pages/Settings/AddGreekSoft";
import IiflList from "./pages/Settings/IiflList";
import AddIifl from "./pages/Settings/AddIifl";
import TrueDataList from "./pages/Settings/TrueDataList";
import AddTrueData from "./pages/Settings/AddTrueData";
import MasterTrustList from "./pages/Settings/MasterTrustList";
import AddMasterTrust from "./pages/Settings/AddMasterTrust";
import ZerodhaList from "./pages/Settings/ZerodhaList";
import AddZerodha from "./pages/Settings/AddZerodha";
import Charges from "./pages/Settings/Charges";
import BrokerageList from "./pages/Settings/BrokerageList";
import AddBrokerage from "./pages/Settings/AddBrokerage";
import ManualExecutionPage from "./pages/ManualExecutionPage";
import AutoStrategy from "./pages/AutoStrategy";
import AddAutostrategy from "./pages/AddAutostrategy";
import TradingChart from "./chart/TradingViewWidget";
import MultiChartPage from "./pages/MultiChartPage";

/* ✅ Layout Component (Shell Removed) */
function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const subscribed = useRef(false);
  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };
  useEffect(() => {
    socketService.connect();
  }, []);

  useEffect(() => {
    if (subscribed.current) return;
    subscribed.current = true;

    const callback = (data: any) => {
      const parsed = JSON.parse(data.data || "{}");

      if (parsed.status === "success") {
        message.success(parsed.description || "Order executed");
        eventBus.emit("ORDER_EXECUTED");
      }
    };

    socketService.subscribe("placed_order_notification", callback);

    return () => {
      socketService.unsubscribe("placed_order_notification", callback);
      subscribed.current = false;
    };
  }, []);

  return (
    // <div className="min-h-screen text-neutral-900 dark:text-neutral-100 bg-neutral-50 dark:bg-neutral-900">
    //   <Topbar />
    //   {/* <MarketBar /> */}
    //   <div className="flex h-full">
    //     <LeftRail isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
    //     <main className="flex-1 min-w-0 overflow-hidden bg-slate-100">
    //       <Outlet />
    //     </main>
    //   </div>
    // </div>
    // 1. Lock the app to the viewport height and make it a flex column
    <div className="h-screen flex flex-col text-neutral-900 dark:text-neutral-100 bg-neutral-50 dark:bg-neutral-900">
      {/* Topbar takes up its natural space at the top */}
      <Topbar />

      {/* 2. flex-1 fills the remaining height, overflow-hidden stops whole-page scrolling */}
      <div className="flex flex-1 overflow-hidden">
        <LeftRail isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        {/* 3. overflow-y-auto allows ONLY this main section to scroll if content overflows */}
        <main className="flex-1 min-w-0 overflow-y-auto bg-slate-100">
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
      { path: "manual-execution", element: <ManualExecutionPage /> },
      { path: "auto-strategy", element: <AutoStrategy /> },
      { path: "add-auto-strategy", element: <AddAutostrategy /> },
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
      { path: "chart", element: <TradingChart /> },
      { path: "chart/:id", element: <MultiChartPage /> },
      {
        path: "edit-exceptional-holiday/:id",
        element: <AddExceptionalHoliday />,
      },
      { path: "/client-data", element: <ClientSetting /> },
      { path: "/add-client-data", element: <AddClient /> },
      { path: "/client-data/:id", element: <AddClient /> },
      { path: "/money-management", element: <MoneyManegement /> },
      { path: "/add-money-management", element: <AddMoneyManagement /> },
      { path: "/edit-money-management/:id", element: <AddMoneyManagement /> },
      { path: "/greek-soft", element: <GreekSoftList /> },
      { path: "/add-greek-soft", element: <AddGreekSoft /> },
      { path: "/edit-greek-soft/:id", element: <AddGreekSoft /> },
      { path: "/iifl", element: <IiflList /> },
      { path: "/add-iifl", element: <AddIifl /> },
      { path: "/edit-iifl/:id", element: <AddIifl /> },
      { path: "/true-data", element: <TrueDataList /> },
      { path: "/add-true-data", element: <AddTrueData /> },
      { path: "/edit-truedata/:id", element: <AddTrueData /> },
      { path: "/master-trust", element: <MasterTrustList /> },
      { path: "/add-master-trust", element: <AddMasterTrust /> },
      { path: "/edit-master-trust/:id", element: <AddMasterTrust /> },
      { path: "/zerodha", element: <ZerodhaList /> },
      { path: "/add-zerodha", element: <AddZerodha /> },
      { path: "/edit-zerodha/:id", element: <AddZerodha /> },
      { path: "/charges", element: <Charges /> },
      { path: "/brokerage-list", element: <BrokerageList /> },
      { path: "/add-brokerage", element: <AddBrokerage /> },
      { path: "/edit-brokerage/:id", element: <AddBrokerage /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
