import React, { useState, useEffect } from "react";
import { Plus, Settings2, ChevronDown, ChevronUp, Search, SlidersHorizontal, Settings } from "lucide-react";
import { getWatchlistApi } from "../services/watchlistApi";
import { WatchlistItem } from "../components/WatchlistPanel";

const tabs = ["1", "2", "3", "4", "5", "6", "7"];

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
        // Only fetching 1, 2, 3 as per original mock/logic, default to 1 if >3 just for display if backend doesn't support
        const tabNumber = Number(active) > 3 ? 1 : Number(active);
        const res = await getWatchlistApi(tabNumber);

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
        border-r border-neutral-200 dark:border-neutral-800 bg-white
        h-[calc(100vh-56px)] sticky top-[56px]
        ${isOpen ? "w-[385px]" : "w-[0px] overflow-hidden opacity-0 border-r-0"}
      `}
    >
      {/* Hide content when collapsed */}
      {isOpen && (
        <>
          {/* Top Search Bar */}
          <div className="flex flex-col border-b border-neutral-100">
            <div className="flex items-center px-4 py-3 gap-2 text-neutral-500">
              <Search size={16} />
              <input
                placeholder="Search eg: infy bse, nifty fut, index fund, etc"
                className="w-full bg-transparent outline-none text-sm placeholder:text-neutral-400 text-neutral-800"
              />
              <span className="text-[10px] hidden xl1300:inline-block border border-neutral-200 px-1 py-0.5 rounded text-neutral-400 leading-none">
                Ctrl + K
              </span>
              <button className="hover:text-neutral-800 transition-colors hidden xl1300:block ml-1">
                <SlidersHorizontal size={14} />
              </button>
            </div>

            {/* List Header Group */}
            <div className="px-4 py-2 flex items-center justify-between text-xs text-neutral-500 border-t border-neutral-100 bg-neutral-50/50">
              <span>{`Default(${watchlist.length} / 50)`}</span>
              <button className="flex items-center gap-1 hover:text-blue-500 transition-colors">
                <Plus size={12} />
                <span>New group</span>
              </button>
            </div>
          </div>

          {/* Watchlist Body */}
          <div className="flex-1 overflow-y-auto w-full">
            {loading ? (
              <div className="w-full">
                <div className="h-0.5 bg-red-500 w-1/4 animate-pulse duration-1000"></div> {/* Loading line indicator */}
              </div>
            ) : error ? (
              <div className="p-4 text-center text-sm text-rose-500">
                {error}
              </div>
            ) : watchlist.length === 0 ? (
              <div className="p-4 text-center text-sm text-neutral-400">
                Nothing here
              </div>
            ) : (
              watchlist.map((s, index) => (
                <div
                  key={s.symbol + index}
                  className="px-4 py-[14px] flex flex-col md:flex-row md:items-center justify-between border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 cursor-pointer group transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {/* Color indicator stripe */}
                    <div className={`w-[2px] h-3 ${s.change >= 0 ? 'bg-emerald-500' : 'bg-rose-500'} `} />

                    <div className="text-[13px] font-medium text-neutral-700 min-w-fit" title={s.symbol}>
                      {s.symbol}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 md:gap-6 mt-1 md:mt-0 text-[13px]">
                    <div className={`text-neutral-400 w-12 text-right hidden sm:block`}>
                      {/* Placeholder for absolute change amount, keeping empty or calculating if wanted, screenshot lacks amount */}
                      {s.change >= 0 ? '' : ''}
                    </div>

                    <div className={`flex items-center justify-end w-14 ${s.change >= 0 ? "text-emerald-500" : "text-rose-500"} `}>
                      <span>{(s.change).toFixed(2)}%</span>
                      {s.change >= 0 ? <ChevronUp size={14} className="ml-0.5" /> : <ChevronDown size={14} className="ml-0.5" />}
                    </div>

                    <div className={`font-medium w-16 text-right ${s.change >= 0 ? "text-emerald-500" : "text-rose-500"} `}>
                      {s.last.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Bottom Tabs */}
          <div className="flex items-center justify-between border-t border-neutral-200 mt-auto bg-white">
            <div className="flex items-center w-full">
              {tabs.map((t) => (
                <button
                  key={t}
                  onClick={toggleSidebar}
                  className={`flex-1 py-3 text-xs font-semibold relative transition-colors ${active === t
                    ? "text-orange-600"
                    : "text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50"
                    } `}
                >
                  {t}
                  {active === t && (
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-orange-600" />
                  )}
                </button>
              ))}
            </div>

            <button className="px-4 py-3 border-l border-neutral-200 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50">
              <Settings size={14} />
            </button>
          </div>
        </>
      )}
    </aside>
  );
}
