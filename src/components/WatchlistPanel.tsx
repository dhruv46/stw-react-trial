import React, { useEffect, useState } from "react";
import { getWatchlistApi } from "../services/watchlistApi";

export interface WatchlistItem {
  symbol: string;
  name?: string;
  last: number;
  change: number;
  changeValue?: number; // ✅ ADD THIS

  instrumentKey?: string;
  series?: string; // ✅ ADD THIS
}

export default function WatchlistPanel() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWatchlist = async () => {
      try {
        setLoading(true);
        const res = await getWatchlistApi(1);

        // Use exact API response structure: { result: [...] }
        const data = res.data?.result || [];

        const mappedData: WatchlistItem[] = data.map((item: any) => ({
          symbol: item.DisplayName || item.instrument_id || "UNKNOWN",

          name:
            item.DetailedDescription !== "-" ? item.DetailedDescription : "",

          last: Number(item.ltp ?? 0),

          change: Number(item.PercentChange ?? 0),

          changeValue: Number(item.ChangeValue ?? 0), // ✅ ADD

          instrumentKey: item.iifl || item.instrument_id,
          series: item.series || item.Series, // ✅ IMPORTANT
        }));

        setWatchlist(mappedData);
        setError(null);
      } catch (err: any) {
        console.error("Failed to fetch watchlist:", err);
        setError("Failed to load watchlist data.");
      } finally {
        setLoading(false);
      }
    };

    fetchWatchlist();
  }, []);

  if (loading) {
    return (
      <div className="card p-3">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-neutral-200 dark:bg-neutral-700 rounded w-1/3"></div>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex justify-between">
              <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/4"></div>
              <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/6"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-3">
        <div className="text-rose-500 text-sm">{error}</div>
      </div>
    );
  }

  return (
    <div className="card p-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">Watchlist</h3>
        <span className="chip">NSE</span>
      </div>
      <div className="divide-y divide-neutral-100 dark:divide-neutral-700">
        {watchlist.length === 0 && (
          <div className="py-4 text-center text-sm text-neutral-500">
            No items available.
          </div>
        )}
        {watchlist.map((s, index) => (
          // Using index as fallback key in case symbol is missing or duplicate
          <div
            key={s.symbol + index}
            className="flex items-center justify-between py-2"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-1.5 h-6 rounded ${s.change >= 0 ? "bg-emerald-500" : "bg-rose-500"}`}
              />
              <div>
                <div className="font-medium">{s.symbol}</div>
                <div className="text-xs opacity-70">{s.name}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold">
                {s.last.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
              <div
                className={`text-xs ${
                  s.change >= 0 ? "text-emerald-500" : "text-rose-500"
                }`}
              >
                {(s.changeValue ?? 0).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                ({s.change.toFixed(2)}%)
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
