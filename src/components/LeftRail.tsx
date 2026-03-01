import React, { useState, useEffect } from "react";
import { Plus, Settings2, ChevronLeft, ChevronRight } from "lucide-react";
import { getWatchlistApi } from "../services/watchlistApi";
import { WatchlistItem } from "../components/WatchlistPanel";

const tabs = ["1", "2", "3"];

interface LeftRailProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

export default function LeftRail({ isOpen, toggleSidebar }: LeftRailProps) {
  const [active, setActive] = useState("1");
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only fetch if open
    if (!isOpen) return;

    const fetchWatchlist = async () => {
      try {
        setLoading(true);
        const res = await getWatchlistApi(Number(active));

        const data = res.data?.result || [];

        const mappedData = data.map((item: any) => ({
          symbol: item.DisplayName || item.instrument_id || 'UNKNOWN',
          name: item.DetailedDescription !== "-" ? item.DetailedDescription : '',
          last: Number(item.ltp ?? 0),
          change: Number(item.PercentChange ?? 0),
        }));

        setWatchlist(mappedData);
        setError(null);
      } catch (err: any) {
        console.error("Failed to fetch watchlist:", err);
        setError("Failed to load");
      } finally {
        setLoading(false);
      }
    };

    fetchWatchlist();
  }, [active, isOpen]);

  return (
    <aside
      className={`
        hidden xl:flex xl:flex-col
        transition-all duration-300
        border-r border-neutral-200 dark:border-neutral-800
        h-[calc(100vh-56px)] sticky top-[56px]
        ${isOpen ? "w-[300px]" : "w-[40px]"}
      `}
    >
      {/* Toggle Button */}
      <div className="p-2 flex justify-end">
        <button
          onClick={toggleSidebar}
          className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 transition"
        >
          {isOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>

      {/* Hide content when collapsed */}
      {isOpen && (
        <>
          <div className="p-3 flex items-center gap-2">
            <div className="flex items-center gap-2">
              {tabs.map((t) => (
                <button
                  key={t}
                  onClick={() => setActive(t)}
                  className={`px-2 py-1 rounded-lg text-sm ${active === t
                    ? "bg-neutral-100 dark:bg-neutral-800"
                    : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="ml-auto flex items-center gap-2">
              <button className="btn" title="New group">
                <Plus size={16} />
              </button>
              <button className="btn" title="List settings">
                <Settings2 size={16} />
              </button>
            </div>
          </div>

          <div className="px-3 pb-2">
            <input
              placeholder="Search & add"
              className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm"
            />
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 animate-pulse space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="space-y-2 w-1/2">
                      <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-full"></div>
                      <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-2/3"></div>
                    </div>
                    <div className="space-y-2 w-1/4 items-end flex flex-col">
                      <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-full"></div>
                      <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="p-4 text-center text-sm text-rose-500">
                {error}
              </div>
            ) : watchlist.length === 0 ? (
              <div className="p-4 text-center text-sm text-neutral-500">
                No items in list {active}
              </div>
            ) : (
              watchlist.map((s, index) => (
                <div
                  key={s.symbol + index}
                  className="px-3 py-2 flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800"
                >
                  <div>
                    <div className="text-sm min-w-fit" title={s.symbol}>{s.symbol}</div>
                    {/* <div className="text-xs opacity-60">NSE • {active}</div> */}
                  </div>

                  <div className="text-right">
                    <div className="text-sm min-w-fit">
                      {s.last.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div
                      className={`text-xs ${s.change >= 0 ? "text-emerald-600" : "text-rose-600"
                        }`}
                    >
                      {s.change > 0 ? "+" : ""}
                      {s.change.toFixed(2)}%
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </aside>
  );
}
