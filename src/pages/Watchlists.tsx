import React, { useEffect, useState } from 'react'
import { getWatchlistApi } from '../services/watchlistApi'
import { WatchlistItem } from '../components/WatchlistPanel'

function WatchlistCard({ listId }: { listId: number }) {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWatchlist = async () => {
      try {
        setLoading(true);
        // Using listId as the page number indicator
        const res = await getWatchlistApi(listId);

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
        console.error(`Failed to fetch watchlist ${listId}:`, err);
        setError("Failed to load");
      } finally {
        setLoading(false);
      }
    };

    fetchWatchlist();
  }, [listId]);

  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 p-3 flex flex-col min-h-[150px]">
      <div className="font-medium mb-2">List {listId}</div>

      {loading ? (
        <div className="animate-pulse space-y-3 flex-1 mt-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between">
              <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/3"></div>
              <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-rose-500 text-sm flex-1 flex items-center justify-center">
          {error}
        </div>
      ) : watchlist.length === 0 ? (
        <div className="text-neutral-500 text-sm flex-1 flex items-center justify-center">
          No items in list
        </div>
      ) : (
        <div className="space-y-2 flex-1">
          {watchlist.slice(0, 6).map((s, index) => (
            <div key={s.symbol + index} className="flex items-center justify-between">
              <div className="font-medium truncate pr-2" title={s.symbol}>{s.symbol}</div>
              <div className={`${s.change >= 0 ? 'text-emerald-600' : 'text-rose-600'} whitespace-nowrap`}>
                {s.change > 0 ? '+' : ''}{s.change.toFixed(2)}%
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Watchlists() {
  return (
    <div className="card p-4">
      <h2 className="text-lg font-semibold mb-4">Watchlists</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {[1, 2, 3].map((listId) => (
          <WatchlistCard key={listId} listId={listId} />
        ))}
      </div>
    </div>
  )
}