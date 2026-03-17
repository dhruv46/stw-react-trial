import { useEffect, useRef, useState } from "react";
import {
  createChart,
  CandlestickSeries,
  CandlestickData,
  IChartApi,
  ISeriesApi,
  ColorType,
  CrosshairMode,
} from "lightweight-charts";
import { fetchOHLCPrice } from "../services/tradingChartApi";
import Loader from "../components/Loader";
import { useSocket } from "../hook/useSocket";

// =================================================================
// 🔥 THE NEW IDEA: GLOBAL PROMISE QUEUE
// This sits OUTSIDE the component. All 4 charts share this queue.
// It forces them to fetch their data one-by-one, saving your server.
// =================================================================
// 🔥 FIXED: Global queue that doesn't break on error
let globalFetchQueue = Promise.resolve();

const fetchWithQueue = (
  instrumentKey: string,
  timeframe: number,
  page: number,
): Promise<any> => {
  return new Promise((resolve, reject) => {
    // We chain onto the queue, but we use .then() and .catch()
    // to ensure the NEXT item in the queue always runs.
    globalFetchQueue = globalFetchQueue
      .then(async () => {
        try {
          // Add a small delay so the server isn't hit at the exact same millisecond
          await new Promise((r) => setTimeout(r, 300));

          const res = await fetchOHLCPrice({
            instrument: instrumentKey,
            timeframe: timeframe * 60,
            page,
            page_size: 1000,
          });

          resolve(res.data);
        } catch (err) {
          console.error(`Error fetching ${timeframe}m:`, err);
          reject(err);
        }
      })
      .catch(() => {
        // This catch ensures that even if the PREVIOUS request failed,
        // the promise chain remains "Resolved" for the NEXT request.
        return Promise.resolve();
      });
  });
};
// =================================================================

interface ApiCandle {
  ts: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface LegendData {
  open: number;
  high: number;
  low: number;
  close: number;
}

interface TimeframeChartProps {
  instrumentKey: number | string;
  symbol: string;

  timeframe: number;
}

const TimeframeChart: React.FC<TimeframeChartProps> = ({
  instrumentKey,
  symbol,
  timeframe,
}) => {
  const isFirstLoadRef = useRef(true);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const pageRef = useRef(1);
  const allDataRef = useRef<CandlestickData[]>([]);
  const isLoadingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const dataLockRef = useRef<string | null>(null);
  const chartSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  const [isError, setIsError] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const isHoveringRef = useRef(false);
  const legendRefs = useRef({
    open: null as HTMLSpanElement | null,
    high: null as HTMLSpanElement | null,
    low: null as HTMLSpanElement | null,
    close: null as HTMLSpanElement | null,
  });

  const updateLegendUI = (candle: LegendData | null) => {
    if (!candle) return;
    const { open, high, low, close } = candle;
    const color = close >= open ? "#089981" : "#f23645";

    if (legendRefs.current.open) {
      legendRefs.current.open.innerText = open.toFixed(2);
      legendRefs.current.open.style.color = color;
    }
    if (legendRefs.current.high) {
      legendRefs.current.high.innerText = high.toFixed(2);
      legendRefs.current.high.style.color = color;
    }
    if (legendRefs.current.low) {
      legendRefs.current.low.innerText = low.toFixed(2);
      legendRefs.current.low.style.color = color;
    }
    if (legendRefs.current.close) {
      legendRefs.current.close.innerText = close.toFixed(2);
      legendRefs.current.close.style.color = color;
    }
  };

  const topic = instrumentKey ? `tick_message_${instrumentKey}` : "";

  useSocket(topic, (tick) => {
    if (
      !tick ||
      !allDataRef.current.length ||
      dataLockRef.current !== String(instrumentKey)
    ) {
      return;
    }

    const price = tick.Price;

    const lastIndex = allDataRef.current.length - 1;
    const lastCandle = allDataRef.current[lastIndex];

    if (!lastCandle) return;

    const currentTimestamp = tick.Time;
    const timeframeSeconds = timeframe * 60;

    const lastTime = Number(lastCandle.time);

    if (currentTimestamp >= lastTime + timeframeSeconds) {
      const nextTime = lastTime + timeframeSeconds;

      // ✅ ALWAYS USE ALIGNED TIME
      const newCandle = {
        time: nextTime as any,
        open: price,
        high: price,
        low: price,
        close: price,
      };

      allDataRef.current.push(newCandle);
      chartSeriesRef.current?.update(newCandle);

      if (!isHoveringRef.current) {
        updateLegendUI(newCandle);
      }
    } else {
      const updatedCandle = {
        ...lastCandle,
        close: price,
        high: Math.max(lastCandle.high, price),
        low: Math.min(lastCandle.low, price),
      };

      allDataRef.current[lastIndex] = updatedCandle;
      chartSeriesRef.current?.update(updatedCandle);

      if (!isHoveringRef.current) {
        updateLegendUI(updatedCandle);
      }
    }
  });

  useEffect(() => {
    if (!containerRef.current || !instrumentKey) return;

    let isActive = true;

    pageRef.current = 1;
    allDataRef.current = [];
    hasMoreRef.current = true;
    isLoadingRef.current = false;
    dataLockRef.current = null;

    setIsInitialLoading(true);
    setIsError(false);

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "#ffffff" },
        textColor: "#191919",
        attributionLogo: false,
      },
      localization: {
        timeFormatter: (time: number) => {
          const date = new Date(time * 1000);
          const day = date.getDate().toString().padStart(2, "0");
          const months = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ];
          const month = months[date.getMonth()];
          const year = date.getFullYear().toString().slice(-2);
          const hours = date.getHours().toString().padStart(2, "0");
          const minutes = date.getMinutes().toString().padStart(2, "0");
          return `${day} ${month} '${year}   ${hours}:${minutes}`;
        },
      },
      grid: {
        vertLines: { color: "#e1e3e6", style: 1 },
        horzLines: { color: "#e1e3e6", style: 1 },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: "#9094a6", labelBackgroundColor: "#191919" },
        horzLine: { color: "#9094a6", labelBackgroundColor: "#191919" },
      },
      timeScale: {
        borderColor: "#e1e3e6",
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 12,
        tickMarkFormatter: (time: number) => {
          const date = new Date(time * 1000);
          const hours = date.getHours().toString().padStart(2, "0");
          const minutes = date.getMinutes().toString().padStart(2, "0");
          return `${hours}:${minutes}`;
        },
      },
      rightPriceScale: { borderColor: "#e1e3e6" },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#089981",
      downColor: "#f23645",
      borderVisible: false,
      wickUpColor: "#089981",
      wickDownColor: "#f23645",
    });
    chartSeriesRef.current = candleSeries;

    const handleResize = () => {
      if (containerRef.current) {
        chart.applyOptions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(containerRef.current);

    const loadInitialData = async () => {
      try {
        const resultData = await fetchWithQueue(
          String(instrumentKey),
          timeframe,
          1,
        );

        if (!isActive) return;

        const formatted = resultData.data
          .map((c: ApiCandle) => ({
            time: c.ts as any,
            open: c.open,
            high: c.high,
            low: c.low,
            close: c.close,
          }))
          .reverse();

        allDataRef.current = formatted;
        candleSeries.setData(formatted);

        dataLockRef.current = String(instrumentKey);

        if (formatted.length > 0) {
          updateLegendUI(formatted[formatted.length - 1]);
        }

        // 🔥 THE FIX: Allow the scroll listener to work now that data is loaded
        // We use a tiny timeout so the initial 'setData' render doesn't accidentally trigger a fetch
        setTimeout(() => {
          if (isActive) isFirstLoadRef.current = false;
        }, 200);
      } catch (error) {
        if (isActive) setIsError(true);
      } finally {
        if (isActive) setIsInitialLoading(false);
      }
    };

    const loadMoreHistory = async () => {
      if (isLoadingRef.current || !hasMoreRef.current) return;
      isLoadingRef.current = true;

      try {
        const nextPage = pageRef.current + 1;
        // Paginating can also use the queue to be safe!
        const resultData = await fetchWithQueue(
          String(instrumentKey),
          timeframe,
          nextPage,
        );

        if (!isActive) return;

        if (resultData.data.length === 0) {
          hasMoreRef.current = false;
          return;
        }

        const olderData = resultData.data
          .map((c: ApiCandle) => ({
            time: c.ts as any,
            open: c.open,
            high: c.high,
            low: c.low,
            close: c.close,
          }))
          .reverse();

        pageRef.current = nextPage;
        allDataRef.current = [...olderData, ...allDataRef.current];
        candleSeries.setData(allDataRef.current);
      } catch (error) {
        console.error("Failed to load historical data:", error);
      } finally {
        if (isActive) isLoadingRef.current = false;
      }
    };

    chart.timeScale().subscribeVisibleLogicalRangeChange((range) => {
      if (isFirstLoadRef.current) return; // 🚫 prevent first trigger

      if (range && range.from < 20) {
        loadMoreHistory();
      }
    });

    chart.subscribeCrosshairMove((param) => {
      if (
        !param.point ||
        !param.time ||
        param.point.x < 0 ||
        param.point.y < 0
      ) {
        isHoveringRef.current = false;
        const lastData = allDataRef.current[allDataRef.current.length - 1];
        if (lastData) updateLegendUI(lastData as LegendData);
      } else {
        isHoveringRef.current = true;
        const data = param.seriesData.get(candleSeries) as
          | LegendData
          | undefined;
        if (data) updateLegendUI(data);
      }
    });

    loadInitialData();

    return () => {
      isActive = false;
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [instrumentKey, timeframe]);

  if (!instrumentKey) {
    return (
      <div style={emptyStateStyle}>
        <p style={{ color: "#6b7280", fontSize: "14px" }}>
          No Instrument Selected
        </p>
      </div>
    );
  }

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div style={legendWrapper}>
        <div style={symbolStyle}>{timeframe}m</div>
        <div style={legendStyle}>
          <div style={legendItemStyle}>
            <span style={labelStyle}>O</span>
            <span
              style={valueStyle}
              ref={(el) => (legendRefs.current.open = el)}
            >
              ---
            </span>
          </div>
          <div style={legendItemStyle}>
            <span style={labelStyle}>H</span>
            <span
              style={valueStyle}
              ref={(el) => (legendRefs.current.high = el)}
            >
              ---
            </span>
          </div>
          <div style={legendItemStyle}>
            <span style={labelStyle}>L</span>
            <span
              style={valueStyle}
              ref={(el) => (legendRefs.current.low = el)}
            >
              ---
            </span>
          </div>
          <div style={legendItemStyle}>
            <span style={labelStyle}>C</span>
            <span
              style={valueStyle}
              ref={(el) => (legendRefs.current.close = el)}
            >
              ---
            </span>
          </div>
        </div>
      </div>

      {isInitialLoading && (
        <div style={overlayStyle}>
          <Loader />
        </div>
      )}

      {isError && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/90">
          <div className="max-w-md text-center bg-white border border-gray-200 shadow-md rounded-lg px-6 py-4">
            <span className="text-sm font-medium text-gray-700 leading-relaxed">
              Unable to load chart data for {timeframe}m.
            </span>
          </div>
        </div>
      )}

      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};

// ... Styles
const emptyStateStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  width: "100%",
  height: "100%",
  minHeight: "200px",
  backgroundColor: "#ffffff",
  color: "#191919",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  textAlign: "center",
  padding: "20px",
  border: "1px dashed #e1e3e6",
  borderRadius: "8px",
};
const legendWrapper: React.CSSProperties = {
  position: "absolute",
  top: 12,
  left: 12,
  zIndex: 20,
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
  background: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(4px)",
  padding: "6px 12px",
  borderRadius: "6px",
  boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
  border: "1px solid #e1e3e6",
  pointerEvents: "none",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  fontSize: "12px",
  fontWeight: 500,
};
const symbolStyle: React.CSSProperties = {
  fontSize: "13px",
  fontWeight: 700,
  color: "#191919",
  borderRight: "1px solid #e1e3e6",
  paddingRight: "12px",
  marginRight: "12px",
};
const legendStyle: React.CSSProperties = { display: "flex", gap: "10px" };
const legendItemStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  minWidth: "60px",
};
const labelStyle: React.CSSProperties = {
  color: "#9094a6",
  marginRight: "4px",
};
const valueStyle: React.CSSProperties = {
  fontVariantNumeric: "tabular-nums",
  color: "#191919",
};
const overlayStyle: React.CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(255, 255, 255, 0.9)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 10,
};

export default TimeframeChart;
