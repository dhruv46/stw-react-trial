import React, { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { LogOut, User, ChevronDown, ChevronRight } from "lucide-react";
import socketService from "../services/socketService";
import { logoutApi, InstrumentLTP } from "../services/authApi";
import { useSocket } from "../hook/useSocket";
/* =======================
   Types
======================= */

interface NavItem {
  label: string;
  to?: string;
  children?: NavItem[];
}

/* =======================
   Navigation Config
======================= */

const nav: NavItem[] = [
  { to: "/", label: "Home" },
  {
    label: "Orders",
    children: [
      { to: "/order", label: "Order Book" },
      { to: "/sim-order-book", label: "Sim Order Book" },
    ],
  },
  {
    label: "Trades",
    children: [
      { to: "/trades", label: "Trade Book" },
      { to: "/trade-edit-mode", label: "Edit Mode" },
      { to: "/sim-trade-book", label: "Sim Trade Book" },
    ],
  },
  { to: "javascript:void(0)", label: "Manual Execution" },
  {
    label: "Positions",
    children: [
      { to: "/position?mode=client", label: "By Client" },
      { to: "/position?mode=strategy", label: "By Strategy" },
    ],
  },
  { to: "/holding", label: "Holdings" },
  {
    label: "Downloads",
    children: [
      { to: "/report", label: "Strategy Report" },
      { to: "/download-report", label: "OHLC" },
    ],
  },
  { to: "javascript:void(0)", label: "Auto Strategy" },
  {
    label: "Settings",
    children: [
      { to: "/user-list", label: "User List" },
      { to: "javascript:void(0)", label: "Brokerage" },
      { to: "/holiday", label: "Holiday" },
      { to: "/exceptional-setting", label: "Exceptional" },
      {
        label: "Broker Settings",
        children: [
          { to: "javascript:void(0)", label: "Greek Soft" },
          { to: "javascript:void(0)", label: "IIFL" },
          { to: "javascript:void(0)", label: "Zerodha" },
          { to: "javascript:void(0)", label: "True Data" },
          { to: "javascript:void(0)", label: "Master Trust" },
        ],
      },
      { to: "/client-data", label: "Client Data" },
      { to: "javascript:void(0)", label: "Charges" },
      { to: "/money-management", label: "Money Management" },
      { to: "javascript:void(0)", label: "Contract Note" },
    ],
  },
];

/* =======================
   Component
======================= */

const Navbar: React.FC = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [activeSubMenu, setActiveSubMenu] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const [mobileActive, setMobileActive] = useState<number | null>(null);
  const [mobileSubActive, setMobileSubActive] = useState<string | null>(null);
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  // Store market data for both instruments
  const [marketData, setMarketData] = useState<{
    [key: string]: {
      Price: number;
      ChangeValue: number;
      PercentChange: number;
    } | null;
  }>({
    "1_26000": null, // NIFTY
    "11_26065": null, // SENSEX
  });

  /* =======================
   Outside Click
======================= */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        // Desktop dropdowns
        setActiveMenu(null);
        setActiveSubMenu(null);

        // Mobile dropdown
        setUserMenuOpen(false);

        // Optional: reset mobile sub states
        setMobileActive(null);
        setMobileSubActive(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // useEffect(() => {
  //   socketService.connect();

  //   const instruments = ["1_26000", "11_26065"];

  //   instruments.forEach((inst) => {
  //     socketService.subscribe(`tick_message_${inst}`, (frame: any) => {
  //       try {
  //         const outer = JSON.parse(frame.body);
  //         const inner = JSON.parse(outer.data);

  //         // console.log("inner", inner);

  //         setMarketData((prev) => ({
  //           ...prev,
  //           [inst]: {
  //             Price: inner.Price,
  //             ChangeValue: inner.ChangeValue,
  //             PercentChange: inner.PercentChange,
  //           },
  //         }));
  //       } catch (err) {
  //         console.error("Failed to parse frame:", err);
  //       }
  //     });
  //   });

  //   return () => {
  //     instruments.forEach((inst) => {
  //       socketService.unsubscribe(`tick_message_${inst}`);
  //     });
  //   };
  // }, []);

  // instrument 1
  useSocket("tick_message_1_26000", (inner) => {
    setMarketData((prev) => ({
      ...prev,
      ["1_26000"]: {
        Price: inner.Price,
        ChangeValue: inner.ChangeValue,
        PercentChange: inner.PercentChange,
      },
    }));
  });

  // instrument 2
  useSocket("tick_message_11_26065", (inner) => {
    setMarketData((prev) => ({
      ...prev,
      ["11_26065"]: {
        Price: inner.Price,
        ChangeValue: inner.ChangeValue,
        PercentChange: inner.PercentChange,
      },
    }));
  });

  useEffect(() => {
    const fetchLTP = async () => {
      try {
        const response = await InstrumentLTP();
        const result = response.data?.result || [];

        // Convert array into a key-value object like { "1_26000": {...}, "11_26065": {...} }
        const formattedData = result.reduce((acc: any, item: any) => {
          acc[item.iifl] = {
            Price: item.ltp ?? 0,
            ChangeValue: item.ChangeValue ?? 0,
            PercentChange: item.PercentChange ?? 0,
          };
          return acc;
        }, {});

        setMarketData(formattedData);
      } catch (err) {
        console.error("Failed to fetch initial LTP:", err);
      }
    };

    fetchLTP(); // Call the async function
  }, []);

  /* =======================
   Desktop / Mobile Detection
======================= */
  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);

      if (desktop) {
        setUserMenuOpen(false);
      }
    };

    handleResize(); // run once on mount

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* =======================
     Resize Handler
  ======================= */

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) {
        setMobileOpen(false);
      }
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  /* =======================
     Toggle Functions
  ======================= */

  const toggleMenu = (index: number) => {
    setActiveMenu((prev) => (prev === index ? null : index));
    setActiveSubMenu(null);
  };

  const toggleSubMenu = (index: number) => {
    setActiveSubMenu((prev) => (prev === index ? null : index));
  };

  return (
    <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white">
      <div className="mx-auto px-3 sm:px-6 py-2">
        <div className="flex items-center gap-2" ref={menuRef}>
          <div className="hidden xl1300:flex items-center gap-10 text-xs pr-3">
            {/* NIFTY */}
            <div className="flex flex-col min-w-[150px]">
              <span className="font-semibold text-gray-700 tracking-wide">
                NIFTY 50
              </span>
              <div className="flex items-center gap-3 tabular-nums">
                <span
                  className={`font-semibold ${marketData["1_26000"]?.PercentChange! >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {marketData["1_26000"]?.Price?.toFixed(2) ?? "0.00"}
                </span>
                <span className="text-gray-500">
                  {marketData["1_26000"]
                    ? `${marketData["1_26000"]?.ChangeValue?.toFixed(2)} (${marketData["1_26000"]?.PercentChange?.toFixed(2)}%)`
                    : "0.00 (0.00%)"}
                </span>
              </div>
            </div>

            {/* SENSEX */}
            <div className="flex flex-col min-w-[150px]">
              <span className="font-semibold text-gray-700 tracking-wide">
                SENSEX
              </span>
              <div className="flex items-center gap-3 tabular-nums">
                <span
                  className={`font-semibold ${
                    marketData["11_26065"]?.PercentChange! >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {marketData["11_26065"]?.Price?.toFixed(2) ?? "0.00"}
                </span>
                <span className="text-gray-500">
                  {marketData["11_26065"]
                    ? `${marketData["11_26065"]?.ChangeValue?.toFixed(2)} (${marketData["11_26065"]?.PercentChange?.toFixed(2)}%)`
                    : "0.00 (0.00%)"}
                </span>
              </div>
            </div>
          </div>

          <div className="w-px self-stretch bg-gray-300 hidden xl1300:block"></div>
          {/* Logo */}
          <div className="flex items-center">
            <img
              src="/stw-favicon.ico"
              alt="STW Logo"
              className="h-5 w-6 object-contain"
            />
          </div>
          {/* Desktop Menu */}
          <div className="hidden lg:flex flex-1 justify-end mr-2">
            <nav>
              <ul className="flex gap-6 text-xs">
                {nav.map((item, index) => (
                  <li key={index} className="relative">
                    {/* Normal Link */}
                    {item.to && !item.children && (
                      <NavLink
                        to={item.to}
                        end={item.to === "/"}
                        className={({ isActive }) =>
                          isActive
                            ? "text-blue-600 font-medium"
                            : "text-neutral-700 hover:text-blue-600"
                        }
                      >
                        {item.label}
                      </NavLink>
                    )}

                    {/* Dropdown Parent */}
                    {item.children && (
                      <>
                        <button
                          type="button"
                          onClick={() => toggleMenu(index)}
                          className="flex items-center gap-1 text-neutral-700 hover:text-blue-600"
                        >
                          {item.label}
                          <ChevronDown
                            size={14}
                            className={`transition-transform ${
                              activeMenu === index ? "rotate-180" : ""
                            }`}
                          />
                        </button>

                        {activeMenu === index && (
                          <ul className="absolute right-0 top-full mt-1 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
                            {item.children.map((child, idx) => (
                              <li key={idx} className="relative">
                                {/* Normal Child */}
                                {child.to && !child.children && (
                                  <NavLink
                                    to={child.to}
                                    onClick={() => {
                                      setActiveMenu(null);
                                      setActiveSubMenu(null);
                                    }}
                                    className={() => {
                                      // Check if current URL matches the link's URL exactly
                                      const isActive =
                                        location.pathname + location.search ===
                                        child.to;

                                      return `block px-3 py-2 text-xs rounded-md transition ${
                                        isActive
                                          ? "bg-gray-100 text-blue-600 font-medium"
                                          : "text-gray-700 hover:bg-gray-100"
                                      }`;
                                    }}
                                  >
                                    {child.label}
                                  </NavLink>
                                )}

                                {/* Second Level */}
                                {child.children && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => toggleSubMenu(idx)}
                                      className="flex items-center justify-between w-full px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 rounded-md transition"
                                    >
                                      {child.label}

                                      <ChevronRight
                                        size={14}
                                        className={`ml-2 transition-transform ${
                                          activeSubMenu === idx
                                            ? "rotate-90"
                                            : ""
                                        }`}
                                      />
                                    </button>

                                    {/* SUB MENU - Changed left-full to right-full */}
                                    {activeSubMenu === idx && (
                                      <ul className="absolute right-full top-0 mr-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg py-1">
                                        {child.children.map((sub, i) => (
                                          <li key={i}>
                                            <NavLink
                                              to={sub.to!}
                                              onClick={() => {
                                                setActiveMenu(null);
                                                setActiveSubMenu(null);
                                              }}
                                              className={({ isActive }) =>
                                                `block px-3 py-2 text-xs rounded-md transition ${
                                                  isActive
                                                    ? "bg-gray-100 text-blue-600"
                                                    : "text-gray-700 hover:bg-gray-100"
                                                }`
                                              }
                                            >
                                              {sub.label}
                                            </NavLink>
                                          </li>
                                        ))}
                                      </ul>
                                    )}
                                  </>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="block lg:hidden w-full"></div>
          {/* Right Icons */}
          <div className="relative flex items-end gap-5">
            {/* User Icon */}
            <button
              onClick={() => {
                if (isDesktop) {
                  navigate("/userInfo");
                } else {
                  setUserMenuOpen((prev) => !prev);
                }
              }}
              className="text-neutral-700 hover:text-blue-600"
            >
              <User size={18} />
            </button>

            {/* Logout */}
            <NavLink
              onClick={logoutApi}
              className="text-neutral-700 hover:text-red-500"
              to={""}
            >
              <LogOut size={18} />
            </NavLink>

            {/* MOBILE NAV DROPDOWN */}
            {!isDesktop && userMenuOpen && (
              <div className="absolute right-0 top-8 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-2 lg:hidden max-h-[70vh] overflow-y-auto">
                {/* USER INFO LINK */}
                <NavLink
                  to="/userInfo"
                  onClick={() => setUserMenuOpen(false)}
                  className={({ isActive }) =>
                    `block px-3 py-2 text-xs rounded-md font-medium mb-1 transition ${
                      isActive
                        ? "bg-gray-100 text-blue-600"
                        : "text-gray-700 hover:bg-gray-100"
                    }`
                  }
                >
                  My Profile
                </NavLink>

                <div className="border-t border-gray-200 mb-1"></div>
                {nav.map((item, index) => (
                  <div key={index} className="mb-1">
                    {/* Direct Link */}
                    {item.to && !item.children && (
                      <NavLink
                        to={item.to}
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-3 py-2 text-xs rounded-md text-gray-700 hover:bg-gray-100"
                      >
                        {item.label}
                      </NavLink>
                    )}

                    {/* Parent Item */}
                    {item.children && (
                      <>
                        <button
                          onClick={() =>
                            setMobileActive(
                              mobileActive === index ? null : index,
                            )
                          }
                          className="flex justify-between items-center w-full px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 rounded-md"
                        >
                          {item.label}
                          <ChevronDown
                            size={14}
                            className={`transition-transform ${
                              mobileActive === index ? "rotate-180" : ""
                            }`}
                          />
                        </button>

                        {/* Children */}
                        {mobileActive === index && (
                          <div className="ml-3 mt-1 space-y-1 border-l border-gray-200 pl-3">
                            {item.children.map((child, idx) => {
                              const subKey = `${index}-${idx}`;

                              return (
                                <div key={idx}>
                                  {/* Child Direct */}
                                  {child.to && !child.children && (
                                    <NavLink
                                      to={child.to}
                                      onClick={() => setUserMenuOpen(false)}
                                      className="block px-3 py-2 text-xs rounded-md text-gray-600 hover:bg-gray-100"
                                    >
                                      {child.label}
                                    </NavLink>
                                  )}

                                  {/* Sub Parent */}
                                  {child.children && (
                                    <>
                                      <button
                                        onClick={() =>
                                          setMobileSubActive(
                                            mobileSubActive === subKey
                                              ? null
                                              : subKey,
                                          )
                                        }
                                        className="flex justify-between items-center w-full px-3 py-2 text-xs text-gray-600 hover:bg-gray-100 rounded-md"
                                      >
                                        {child.label}
                                        <ChevronRight
                                          size={14}
                                          className={`transition-transform ${
                                            mobileSubActive === subKey
                                              ? "rotate-90"
                                              : ""
                                          }`}
                                        />
                                      </button>

                                      {mobileSubActive === subKey && (
                                        <div className="ml-3 mt-1 space-y-1 border-l border-gray-200 pl-3">
                                          {child.children.map((sub, i) => (
                                            <NavLink
                                              key={i}
                                              to={sub.to!}
                                              onClick={() =>
                                                setUserMenuOpen(false)
                                              }
                                              className="block px-3 py-2 text-xs rounded-md text-gray-500 hover:bg-gray-100"
                                            >
                                              {sub.label}
                                            </NavLink>
                                          ))}
                                        </div>
                                      )}
                                    </>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
