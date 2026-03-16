import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
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

interface ApiCandle {
  ts: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface ApiResponse {
  data: ApiCandle[];
}

interface LegendData {
  open: number;
  high: number;
  low: number;
  close: number;
}

const TradingChart = () => {
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement | null>(null);

  const instrumentKey = location.state?.instrumentKey;
  const symbol = location.state?.symbol;
  const series = location.state?.series;

  const [selectedInstrument, setSelectedInstrument] = useState(instrumentKey);

  // Pagination, Fetching & Socket Refs
  const pageRef = useRef(1);
  const allDataRef = useRef<CandlestickData[]>([]);
  const isLoadingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const dataLockRef = useRef<string | null>(null);
  const chartSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  // UI State (Only used for rare events like loading/errors)
  const [isError, setIsError] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // ==========================================
  // NEW: High-Performance Legend Refs
  // We update these directly to prevent React from re-rendering the component on every tick
  // ==========================================
  const isHoveringRef = useRef(false);
  const legendRefs = useRef({
    open: null as HTMLSpanElement | null,
    high: null as HTMLSpanElement | null,
    low: null as HTMLSpanElement | null,
    close: null as HTMLSpanElement | null,
  });

  // Helper to instantly update the legend DOM elements
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

  const topic = selectedInstrument ? `tick_message_${selectedInstrument}` : "";

  useSocket(topic, (tick) => {
    if (
      !tick ||
      !allDataRef.current.length ||
      dataLockRef.current !== selectedInstrument
    ) {
      return;
    }

    const price = tick.Price;
    const time = tick.Time;

    const lastCandle = allDataRef.current[allDataRef.current.length - 1];
    if (!lastCandle) return;

    const candleTime = lastCandle.time as number;
    const candleDuration = 60; // timeframe

    let currentCandle;

    // Same candle
    if (time < candleTime + candleDuration) {
      currentCandle = {
        ...lastCandle,
        close: price,
        high: Math.max(lastCandle.high, price),
        low: Math.min(lastCandle.low, price),
      };
      allDataRef.current[allDataRef.current.length - 1] = currentCandle;
    }
    // New candle
    else {
      currentCandle = {
        time: tick.Time as any, // Ensure TS knows to accept this time format
        open: price,
        high: price,
        low: price,
        close: price,
      };
      allDataRef.current.push(currentCandle);
    }

    // Update the chart canvas (cast to CandlestickData to satisfy the chart's strict types)
    chartSeriesRef.current?.update(currentCandle as CandlestickData);

    // ONLY update the top legend if the user is NOT hovering over historical data
    if (!isHoveringRef.current) {
      // FIX: Explicitly pass only the known LegendData properties
      updateLegendUI({
        open: currentCandle.open,
        high: currentCandle.high,
        low: currentCandle.low,
        close: currentCandle.close,
      });
    }
  });

  useEffect(() => {
    if (location.state?.instrumentKey) {
      setSelectedInstrument(location.state.instrumentKey);
    }
  }, [location.state]);

  useEffect(() => {
    if (!containerRef.current || !selectedInstrument) return;

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
        rightOffset: 12,
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

    const fetchCandles = async (page: number) => {
      const res = await fetchOHLCPrice({
        instrument: selectedInstrument,
        timeframe: 60,
        page,
        page_size: 1000,
      });
      const result: ApiResponse = res.data;
      return result.data
        .map((c) => ({
          time: c.ts as any,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
        }))
        .reverse();
    };

    const loadInitialData = async () => {
      try {
        const formatted = await fetchCandles(1);
        if (!isActive) return;

        allDataRef.current = formatted;
        candleSeries.setData(formatted);

        dataLockRef.current = selectedInstrument;

        if (formatted.length > 0) {
          // Initialize the legend with the latest downloaded data
          updateLegendUI(formatted[formatted.length - 1]);
        }
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
        const olderData = await fetchCandles(nextPage);

        if (!isActive) return;

        if (olderData.length === 0) {
          hasMoreRef.current = false;
          return;
        }

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
        // Mouse moved off the chart. Revert legend to live tick data.
        isHoveringRef.current = false;
        const lastData = allDataRef.current[allDataRef.current.length - 1];
        if (lastData) updateLegendUI(lastData as LegendData);
      } else {
        // Mouse is hovering over historical data. Lock legend to history.
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
  }, [selectedInstrument]);

  if (!selectedInstrument) {
    return (
      <div style={emptyStateStyle}>
        <h2 style={{ fontSize: "20px", marginBottom: "8px", fontWeight: 600 }}>
          No Instrument Selected
        </h2>
        <p style={{ color: "#6b7280", fontSize: "14px" }}>
          Please select a trading instrument to view its chart data.
        </p>
      </div>
    );
  }

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {/* OHLC Legend Overlay 
        Notice how the values are now managed by `ref`s instead of React state variables! 
      */}
      <div style={legendWrapper}>
        <div style={symbolStyle}>
          {symbol} {series ? `• ${series}` : ""}
        </div>
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
              Due to a temporary issue, we are unable to fetch and load the
              chart data. Please try again after some time.
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
  minHeight: "400px",
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
  background: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(4px)",
  padding: "8px 16px",
  borderRadius: "6px",
  boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
  border: "1px solid #e1e3e6",
  pointerEvents: "none",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  fontSize: "13px",
  fontWeight: 500,
};
const symbolStyle: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: 700,
  color: "#191919",
  borderRight: "1px solid #e1e3e6",
  paddingRight: "16px",
  marginRight: "16px",
};
const legendStyle: React.CSSProperties = { display: "flex", gap: "16px" };
const legendItemStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  minWidth: "75px",
};
const labelStyle: React.CSSProperties = {
  color: "#9094a6",
  marginRight: "6px",
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
  color: "#191919",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 10,
  fontFamily: "sans-serif",
  fontSize: "14px",
  fontWeight: 500,
};

export default TradingChart;
