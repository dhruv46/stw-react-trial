import React, { useState } from "react";
import { mockWatchlist } from "../mock/data";
import { Plus, Settings2, ChevronLeft, ChevronRight } from "lucide-react";

const tabs = ["1", "2", "3"];

interface LeftRailProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

export default function LeftRail({ isOpen, toggleSidebar }: LeftRailProps) {
  const [active, setActive] = useState("1");

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
                  className={`px-2 py-1 rounded-lg text-sm ${
                    active === t
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
            {mockWatchlist.map((s) => (
              <div
                key={s.symbol}
                className="px-3 py-2 flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800"
              >
                <div>
                  <div className="font-medium">{s.symbol}</div>
                  <div className="text-xs opacity-60">NSE • 1</div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-semibold">
                    {s.last.toFixed(2)}
                  </div>
                  <div
                    className={`text-xs ${
                      s.change >= 0 ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    {s.change >= 0 ? "+" : ""}
                    {s.change.toFixed(2)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </aside>
  );
}
