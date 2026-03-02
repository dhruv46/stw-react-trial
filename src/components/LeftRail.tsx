import { useState, useEffect, useRef } from "react";
import {
  ChevronDown,
  ChevronUp,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { getWatchlistApi } from "../services/watchlistApi";
import { WatchlistItem } from "../components/WatchlistPanel";
import socketService from "../services/socketService";

const tabs = ["1", "2", "3", "4", "5"];

interface LeftRailProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

export default function LeftRail({ isOpen, toggleSidebar }: LeftRailProps) {
  const [active, setActive] = useState("1");
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const subscribedRef = useRef<string[]>([]);

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

        // const mappedData: WatchlistItem[] = data.map((item: any) => ({
        //   symbol: item.DisplayName || item.instrument_id || "UNKNOWN",

        //   name:
        //     item.DetailedDescription !== "-" ? item.DetailedDescription : "",

        //   last: Number(item.ltp ?? 0),
        //   change: Number(item.PercentChange ?? 0),
        // }));

        const mappedData: WatchlistItem[] = data.map((item: any) => ({
          symbol: item.DisplayName || item.instrument_id || "UNKNOWN",

          name:
            item.DetailedDescription !== "-" ? item.DetailedDescription : "",

          last: Number(item.ltp ?? 0),

          change: Number(item.PercentChange ?? 0),

          changeValue: Number(item.ChangeValue ?? 0), // ✅ ADD THIS

          instrumentKey: item.iifl || item.instrument_id,
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
  }, [active, isOpen]);

  useEffect(() => {
    if (!watchlist.length) return;

    socketService.connect();

    const instruments = watchlist
      .map((w: any) => w.instrumentKey)
      .filter(Boolean);

    // ✅ prevent resubscribe loop
    const newInstruments = instruments.filter(
      (inst) => !subscribedRef.current.includes(inst),
    );

    if (!newInstruments.length) return;

    newInstruments.forEach((inst: string) => {
      socketService.subscribe(`tick_message_${inst}`, (frame: any) => {
        try {
          const outer = JSON.parse(frame.body);
          const inner = JSON.parse(outer.data);

          setWatchlist((prev) =>
            prev.map((item: any) =>
              item.instrumentKey === inst
                ? {
                    ...item,
                    last: inner.Price ?? item.last,
                    change: inner.PercentChange ?? item.change,
                    changeValue: inner.ChangeValue ?? item.changeValue,
                  }
                : item,
            ),
          );
        } catch (err) {
          console.error("Socket parse error", err);
        }
      });
    });

    subscribedRef.current = [...subscribedRef.current, ...newInstruments];

    return () => {
      newInstruments.forEach((inst: string) => {
        socketService.unsubscribe(`tick_message_${inst}`);
      });

      subscribedRef.current = [];
    };
  }, [watchlist.length]);
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
            <SlidersHorizontal size={18} />
          </button>
        </div>
      )}

      {/* ================= OPEN STATE ================= */}
      {isOpen && (
        <>
          {/* Top Search Bar */}
          <div className="flex flex-col border-b border-neutral-100">
            {/* Search Section */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
              {/* Search Section */}
              <div className="flex items-center gap-2 flex-1 text-neutral-500">
                <Search size={16} />

                <input
                  placeholder="Search eg: infy bse, nifty fut..."
                  className="w-full bg-slate-100 outline-none text-sm placeholder:text-neutral-400 text-neutral-800 rounded px-2 py-1"
                />
              </div>

              {/* Toggle Button */}
              <button
                onClick={toggleSidebar}
                className="ml-3 p-2 rounded hover:bg-neutral-100 transition"
              >
                <SlidersHorizontal size={16} />
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
                <div
                  key={s.symbol + index}
                  className="px-4 py-[14px] flex justify-between border-b border-neutral-100 hover:bg-neutral-50 cursor-pointer"
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

                  <div
                    className="flex items-center justify-end gap-2 
                text-[11px] tabular-nums 
                w-[200px] shrink-0"
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

                    {/* Change Value */}
                    <div
                      className={`w-[65px] text-right ${
                        s.change >= 0 ? "text-emerald-500" : "text-rose-500"
                      }`}
                    >
                      {s.changeValue?.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>

                    {/* Percentage + Icon */}
                    <div
                      className={`flex items-center justify-end w-[70px] ${
                        s.change >= 0 ? "text-emerald-500" : "text-rose-500"
                      }`}
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
