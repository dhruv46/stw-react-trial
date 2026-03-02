import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ChevronDown,
  ChevronUp,
  Search,
  Plus,
  X,
  PanelLeftOpen,
  EllipsisVertical,
  ChartCandlestick,
  Trash2,
  ArrowLeftRight,
} from "lucide-react";
import {
  getWatchlistApi,
  searchInstrumentsApi,
  addWatchlistApi,
  deleteWatchlistApi,
} from "../services/watchlistApi";
import { WatchlistItem } from "../components/WatchlistPanel";
import socketService from "../services/socketService";
import { useSocket } from "../hook/useSocket";

const tabs = ["1", "2", "3", "4", "5"];

interface LeftRailProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

export default function LeftRail({ isOpen, toggleSidebar }: LeftRailProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [active, setActive] = useState("1");
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const subscribedRef = useRef<string[]>([]);
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [searchPage, setSearchPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const debounceRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen) return;

    const fetchWatchlist = async () => {
      try {
        setLoading(true);
        setError(null);

        // clear previous data while switching pages
        setWatchlist([]);

        // ✅ send selected page number
        const pageNumber = Number(active);

        const res = await getWatchlistApi(pageNumber);

        const data = res?.data?.result ?? [];

        if (!data.length) {
          setWatchlist([]);
          return;
        }

        const mappedData: WatchlistItem[] = data.map((item: any) => ({
          symbol: item.DisplayName || item.instrument_id || "UNKNOWN",

          name:
            item.DetailedDescription !== "-" ? item.DetailedDescription : "",

          last: Number(item.ltp ?? 0),

          change: Number(item.PercentChange ?? 0),

          changeValue: Number(item.ChangeValue ?? 0), // ✅ ADD THIS

          instrumentKey: item.iifl || item.instrument_id,
          // ✅ ADD THIS
          series: item.Series || item.series,
        }));
        setWatchlist(mappedData);
      } catch (err) {
        console.error("Failed to fetch watchlist:", err);
        setError("Failed to load");
        setWatchlist([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWatchlist();
  }, [active]);

  // useEffect(() => {
  //   if (!watchlist.length) return;

  //   // socketService.connect();

  //   const instruments = watchlist
  //     .map((w: any) => w.instrumentKey)
  //     .filter(Boolean);

  //   // ✅ prevent resubscribe loop
  //   const newInstruments = instruments.filter(
  //     (inst) => !subscribedRef.current.includes(inst),
  //   );

  //   if (!newInstruments.length) return;

  //   newInstruments.forEach((inst: string) => {
  //     socketService.subscribe(`tick_message_${inst}`, (frame: any) => {
  //       try {
  //         const outer = JSON.parse(frame.body);
  //         const inner = JSON.parse(outer.data);

  //         setWatchlist((prev) =>
  //           prev.map((item: any) =>
  //             item.instrumentKey === inst
  //               ? {
  //                   ...item,
  //                   last: inner.Price ?? item.last,
  //                   change: inner.PercentChange ?? item.change,
  //                   changeValue: inner.ChangeValue ?? item.changeValue,
  //                 }
  //               : item,
  //           ),
  //         );
  //       } catch (err) {
  //         console.error("Socket parse error", err);
  //       }
  //     });
  //   });

  //   subscribedRef.current = [...subscribedRef.current, ...newInstruments];

  //   return () => {
  //     newInstruments.forEach((inst: string) => {
  //       socketService.unsubscribe(`tick_message_${inst}`);
  //     });

  //     subscribedRef.current = [];
  //   };
  // }, [watchlist.length]);

  useEffect(() => {
    watchlist.forEach((item) => {
      if (!item.instrumentKey) return;

      const topic = `tick_message_${item.instrumentKey}`;

      const handler = (inner: any) => {
        setWatchlist((prev) =>
          prev.map((w) =>
            w.instrumentKey === item.instrumentKey
              ? {
                  ...w,
                  last: inner.Price ?? w.last,
                  change: inner.PercentChange ?? w.change,
                  changeValue: inner.ChangeValue ?? w.changeValue,
                }
              : w,
          ),
        );
      };

      socketService.subscribe(topic, handler);

      return () => {
        socketService.unsubscribe(topic, handler);
      };
    });
  }, [watchlist]);

  const fetchSearch = async (query: string, page = 1) => {
    try {
      setSearchLoading(true);

      const res = await searchInstrumentsApi(query, page);

      const result = res?.data?.result;

      const list = result?.data ?? [];

      setLastPage(result?.last_page ?? 1);

      if (page === 1) {
        setSearchResults(list);
      } else {
        setSearchResults((prev) => [...prev, ...list]);
      }
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    const close = () => setOpenMenu(null);

    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  return (
    <aside
      className={`
    hidden xl:flex xl:flex-col
    transition-all duration-300
    border-r border-neutral-200 dark:border-neutral-800 bg-white
    h-[calc(100vh-56px)] sticky top-[56px]
    ${isOpen ? "w-[385px]" : "w-[40px]"}
  `}
    >
      {/* ================= CLOSED STATE ================= */}
      {!isOpen && (
        <div className="flex flex-col items-center py-3 gap-4 w-full">
          {/* Open Sidebar Button */}
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-neutral-100 rounded-md transition"
          >
            <PanelLeftOpen size={18} />
          </button>
        </div>
      )}

      {/* ================= OPEN STATE ================= */}
      {isOpen && (
        <>
          {/* Top Search Bar */}
          <div className="flex flex-col border-b border-neutral-100">
            {/* Search Section */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100 relative">
              {/* SEARCH WRAPPER */}
              <div className="flex items-center gap-2 flex-1 text-neutral-500 relative">
                <Search size={16} />

                {/* INPUT */}
                <input
                  value={searchText}
                  onChange={(e) => {
                    const value = e.target.value;

                    setSearchText(value);
                    setSearchPage(1);

                    setSearchParams({
                      q: value,
                      page: "1",
                    });

                    if (debounceRef.current) {
                      clearTimeout(debounceRef.current);
                    }

                    debounceRef.current = setTimeout(() => {
                      if (value.trim()) {
                        fetchSearch(value, 1);
                      } else {
                        setSearchResults([]);
                      }
                    }, 350);
                  }}
                  placeholder="Search eg: infy bse, nifty fut..."
                  className="w-full bg-slate-100 outline-none text-sm placeholder:text-neutral-400 text-neutral-800 rounded px-2 py-1 pr-7"
                />

                {/* ✅ CLEAR (X) BUTTON */}
                {searchText && (
                  <button
                    className="absolute right-2 p-0.5 hover:bg-neutral-200 rounded"
                    onClick={() => {
                      // clear input
                      setSearchText("");

                      // reset dropdown
                      setSearchResults([]);

                      // reset pagination
                      setSearchPage(1);

                      // remove query params
                      setSearchParams({});

                      // optional API reset call
                      fetchSearch("", 1);
                    }}
                  >
                    <X size={14} />
                  </button>
                )}

                {/* ✅ DROPDOWN */}
                {searchText && searchResults.length > 0 && (
                  <div
                    className="
      absolute top-full left-0 right-0 mt-2
      bg-white border border-neutral-200
      rounded-md shadow-xl
      max-h-[350px]
      overflow-y-auto
      z-[999]
    "
                  >
                    {searchResults.map((item, i) => (
                      <div
                        key={item.instrument_id + i}
                        className="px-4 py-1 hover:bg-neutral-100 cursor-pointer flex items-center justify-between"
                      >
                        <div className="text-xs font-medium text-neutral-800">
                          {item.DisplayName}
                        </div>

                        {/* PLUS BUTTON */}
                        <button
                          className="ml-3 flex items-center justify-center w-5 h-5 rounded hover:bg-neutral-200 transition"
                          onClick={async () => {
                            try {
                              await addWatchlistApi(
                                item.instrument_id,
                                Number(active),
                              );

                              // ✅ refresh watchlist properly
                              const res = await getWatchlistApi(Number(active));

                              const data = res?.data?.result ?? [];

                              const mappedData: WatchlistItem[] = data.map(
                                (item: any) => ({
                                  symbol:
                                    item.DisplayName ||
                                    item.instrument_id ||
                                    "UNKNOWN",

                                  name:
                                    item.DetailedDescription !== "-"
                                      ? item.DetailedDescription
                                      : "",

                                  last: Number(item.ltp ?? 0),

                                  change: Number(item.PercentChange ?? 0),

                                  changeValue: Number(item.ChangeValue ?? 0),

                                  instrumentKey:
                                    item.iifl || item.instrument_id,
                                  // ✅ ADD THIS
                                  series: item.Series || item.series,
                                }),
                              );

                              // ✅ IMPORTANT
                              setWatchlist(mappedData);
                            } catch (err) {
                              console.error("Add watchlist failed", err);
                            }
                          }}
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    ))}

                    {searchLoading && (
                      <div className="p-2 text-center text-xs">
                        Searching...
                      </div>
                    )}

                    {searchPage < lastPage && (
                      <div className="p-2 text-center">
                        <button
                          className="text-xs text-orange-600"
                          onClick={() => {
                            const next = searchPage + 1;

                            setSearchPage(next);
                            fetchSearch(searchText, next);

                            setSearchParams({
                              q: searchText,
                              page: String(next),
                            });
                          }}
                        >
                          Load More
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Toggle Button */}
              <button
                onClick={toggleSidebar}
                className="ml-3 p-2 rounded hover:bg-neutral-100 transition"
              >
                <PanelLeftOpen size={16} />
              </button>
            </div>

            <div className="px-4 py-2 flex items-center justify-between text-xs text-neutral-500 border-t border-neutral-100 bg-neutral-50/50">
              <span>{`Default(${watchlist.length} / 50)`}</span>
            </div>
          </div>

          {/* Watchlist Body */}
          <div className="flex-1 overflow-y-auto w-full">
            {loading ? (
              <div className="w-full">
                <div className="h-0.5 bg-red-500 w-1/4 animate-pulse"></div>
              </div>
            ) : error ? (
              <div className="p-4 text-center text-sm text-rose-500">
                {error}
              </div>
            ) : watchlist.length === 0 ? (
              <div className="flex items-center justify-center h-full text-sm text-neutral-400">
                No Data Available
              </div>
            ) : (
              watchlist.map((s, index) => (
                // <div
                //   key={s.symbol + index}
                //   className="px-4 py-[4px] flex justify-between border-b border-neutral-100 hover:bg-neutral-50 cursor-pointer"
                // >
                <div
                  key={s.symbol + index}
                  className="group px-4 py-[4px] flex justify-between border-b border-neutral-100 hover:bg-neutral-50 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-[2px] h-3 ${
                        s.change >= 0 ? "bg-emerald-500" : "bg-rose-500"
                      }`}
                    />

                    <div className="text-[13px] font-medium text-neutral-700">
                      {s.symbol}
                    </div>
                  </div>

                  <div className="w-[200px] shrink-0 flex justify-end">
                    {/* ================= NORMAL DATA ================= */}
                    <div
                      className="
      flex items-center justify-end gap-2
      text-[11px] tabular-nums
      group-hover:hidden
    "
                    >
                      {/* LTP */}
                      <div
                        className={`w-[85px] text-right font-medium ${
                          s.change >= 0 ? "text-emerald-500" : "text-rose-500"
                        }`}
                      >
                        {s.last.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>

                      {/* Change */}
                      <div className="flex items-center ">
                        <div className={`w-[65px] text-right text-gray-500`}>
                          {s.changeValue?.toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </div>

                        {/* Percentage */}
                        <div
                          className={`flex items-center justify-end w-[60px] text-gray-500`}
                        >
                          <span>({s.change.toFixed(2)}%)</span>

                          {s.change >= 0 ? (
                            <ChevronUp size={14} />
                          ) : (
                            <ChevronDown size={14} />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* ================= HOVER ICONS ================= */}
                    <div className="hidden group-hover:flex items-center gap-2 relative">
                      {/* ✅ NON SPOT / INDEX → BUY SELL */}
                      {s.series !== "SPOT" && s.series !== "INDEX" && (
                        <>
                          {/* BUY */}
                          <button
                            className="
        px-2 py-[2px]
        text-[11px]
        font-semibold
        rounded
        bg-blue-500
        text-white
        hover:bg-blue-600
      "
                          >
                            B
                          </button>

                          {/* SELL */}
                          <button
                            className="
        px-2 py-[2px]
        text-[11px]
        font-semibold
        rounded
        bg-orange-500
        text-white
        hover:bg-orange-600
      "
                          >
                            S
                          </button>
                        </>
                      )}

                      {/* CHART ICON (COMMON) */}
                      <button className="p-1 rounded hover:bg-neutral-200">
                        <ChartCandlestick size={15} className="text-blue-500" />
                      </button>

                      {/* MENU BUTTON */}
                      <button
                        className="p-1 rounded hover:bg-neutral-200"
                        onClick={(e) => {
                          e.stopPropagation();

                          if (!s.instrumentKey) return;

                          setOpenMenu(
                            openMenu === s.instrumentKey
                              ? null
                              : s.instrumentKey,
                          );
                        }}
                      >
                        <EllipsisVertical size={15} />
                      </button>

                      {/* ================= DROPDOWN ================= */}
                      {openMenu === s.instrumentKey && (
                        <div
                          className="
      absolute right-0 top-7
      bg-white border rounded-md shadow-lg
      w-[170px]
      z-50
    "
                        >
                          {/* OPTION CHAIN ONLY FOR SPOT / INDEX */}
                          {(s.series === "SPOT" || s.series === "INDEX") && (
                            <button
                              className="
          flex items-center gap-3
          w-full px-4 py-2
          hover:bg-neutral-100
          text-sm
        "
                            >
                              <ArrowLeftRight size={16} />
                              Option Chain
                            </button>
                          )}

                          {/* REMOVE */}
                          <button
                            className="
        flex items-center gap-3
        w-full px-4 py-2
        hover:bg-neutral-100
        text-sm
      "
                            onClick={async (e) => {
                              e.stopPropagation();

                              try {
                                if (!s.instrumentKey) return;

                                await deleteWatchlistApi(s.instrumentKey);

                                // refresh watchlist
                                // ✅ refresh watchlist properly
                                const res = await getWatchlistApi(
                                  Number(active),
                                );

                                const data = res?.data?.result ?? [];

                                const mappedData: WatchlistItem[] = data.map(
                                  (item: any) => ({
                                    symbol:
                                      item.DisplayName ||
                                      item.instrument_id ||
                                      "UNKNOWN",

                                    name:
                                      item.DetailedDescription !== "-"
                                        ? item.DetailedDescription
                                        : "",

                                    last: Number(item.ltp ?? 0),

                                    change: Number(item.PercentChange ?? 0),

                                    changeValue: Number(item.ChangeValue ?? 0),

                                    instrumentKey:
                                      item.iifl || item.instrument_id,
                                    // ✅ ADD THIS
                                    series: item.Series || item.series,
                                  }),
                                );

                                setWatchlist(mappedData);
                                setError(null);
                              } catch (err) {
                                console.error("Delete failed", err);
                              }
                            }}
                          >
                            <Trash2 size={16} />
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Bottom Tabs */}
          <div className="flex items-center border-t border-neutral-200 bg-white">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setActive(t)}
                className={`flex-1 py-3 text-xs font-semibold relative ${
                  active === t
                    ? "text-orange-600"
                    : "text-neutral-500 hover:bg-neutral-50"
                }`}
              >
                {t}

                {active === t && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-orange-600" />
                )}
              </button>
            ))}

            {/* <button className="px-4 py-3 border-l border-neutral-200">
              <Settings size={14} />
            </button> */}
          </div>
        </>
      )}
    </aside>
  );
}
