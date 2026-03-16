// import { useEffect, useRef, useState } from "react";
// import { useLocation } from "react-router-dom";
// import {
//   createChart,
//   CandlestickSeries,
//   CandlestickData,
//   IChartApi,
//   ISeriesApi,
//   ColorType,
//   CrosshairMode,
// } from "lightweight-charts";
// import { fetchOHLCPrice } from "../services/tradingChartApi";
// import Loader from "../components/Loader";
// import { useSocket } from "../hook/useSocket";

// interface ApiCandle {
//   ts: number;
//   open: number;
//   high: number;
//   low: number;
//   close: number;
// }

// interface ApiResponse {
//   data: ApiCandle[];
// }

// interface LegendData {
//   open: number;
//   high: number;
//   low: number;
//   close: number;
// }

// const TradingChart = () => {
//   const location = useLocation();
//   const containerRef = useRef<HTMLDivElement | null>(null);

//   const instrumentKey = location.state?.instrumentKey;
//   const symbol = location.state?.symbol;
//   const series = location.state?.series;

//   const [selectedInstrument, setSelectedInstrument] = useState(instrumentKey);

//   // Pagination & Fetching Refs
//   const pageRef = useRef(1);
//   const allDataRef = useRef<CandlestickData[]>([]);
//   const isLoadingRef = useRef(false);
//   const hasMoreRef = useRef(true);

//   // UI State
//   const [isError, setIsError] = useState(false);
//   const [isInitialLoading, setIsInitialLoading] = useState(true);

//   // Legend State
//   const [hoveredCandle, setHoveredCandle] = useState<LegendData | null>(null);
//   const [latestCandle, setLatestCandle] = useState<LegendData | null>(null);

//   const chartSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

//   const topic = selectedInstrument ? `tick_message_${selectedInstrument}` : "";
//   useSocket(topic, (tick) => {
//     if (!tick || !allDataRef.current.length) return;

//     const price = tick.Price;
//     const time = tick.Time;

//     const lastCandle = allDataRef.current[allDataRef.current.length - 1];

//     if (!lastCandle) return;

//     const candleTime = lastCandle.time as number;

//     const candleDuration = 60; // timeframe

//     // same candle
//     if (time < candleTime + candleDuration) {
//       const updatedCandle = {
//         ...lastCandle,
//         close: price,
//         high: Math.max(lastCandle.high, price),
//         low: Math.min(lastCandle.low, price),
//       };

//       allDataRef.current[allDataRef.current.length - 1] = updatedCandle;

//       // update chart
//       chartSeriesRef.current?.update(updatedCandle);

//       setLatestCandle(updatedCandle);
//     }
//     // new candle
//     else {
//       const newCandle = {
//         time: time as any,
//         open: price,
//         high: price,
//         low: price,
//         close: price,
//       };

//       allDataRef.current.push(newCandle);

//       chartSeriesRef.current?.update(newCandle);

//       setLatestCandle(newCandle);
//     }
//   });

//   // Sync selected instrument with router state
//   useEffect(() => {
//     if (location.state?.instrumentKey) {
//       setSelectedInstrument(location.state.instrumentKey);
//     }
//   }, [location.state]);

//   // MAIN CHART EFFECT: Runs whenever selectedInstrument changes
//   useEffect(() => {
//     if (!containerRef.current || !selectedInstrument) return;

//     // Prevents stale API responses if user switches tabs quickly
//     let isActive = true;

//     // 1. Reset all state for the new instrument
//     pageRef.current = 1;
//     allDataRef.current = [];
//     hasMoreRef.current = true;
//     isLoadingRef.current = false;
//     setIsInitialLoading(true);
//     setIsError(false);
//     setHoveredCandle(null);
//     setLatestCandle(null);

//     // 2. Create New Chart
//     const chart = createChart(containerRef.current, {
//       layout: {
//         background: { type: ColorType.Solid, color: "#ffffff" },
//         textColor: "#191919",
//         attributionLogo: false,
//       },
//       grid: {
//         vertLines: { color: "#e1e3e6", style: 1 },
//         horzLines: { color: "#e1e3e6", style: 1 },
//       },
//       crosshair: {
//         mode: CrosshairMode.Normal,
//         vertLine: { color: "#9094a6", labelBackgroundColor: "#191919" },
//         horzLine: { color: "#9094a6", labelBackgroundColor: "#191919" },
//       },
//       timeScale: {
//         borderColor: "#e1e3e6",
//         timeVisible: true,
//         rightOffset: 12,
//       },
//       rightPriceScale: { borderColor: "#e1e3e6" },
//     });

//     // 3. Add Series
//     const candleSeries = chart.addSeries(CandlestickSeries, {
//       upColor: "#089981",
//       downColor: "#f23645",
//       borderVisible: false,
//       wickUpColor: "#089981",
//       wickDownColor: "#f23645",
//     });
//     chartSeriesRef.current = candleSeries;

//     // 4. Setup Auto-Resizing
//     const handleResize = () => {
//       if (containerRef.current) {
//         chart.applyOptions({
//           width: containerRef.current.clientWidth,
//           height: containerRef.current.clientHeight,
//         });
//       }
//     };
//     const resizeObserver = new ResizeObserver(handleResize);
//     resizeObserver.observe(containerRef.current);

//     // --- Helper function to fetch & format ---
//     const fetchCandles = async (page: number) => {
//       const res = await fetchOHLCPrice({
//         instrument: selectedInstrument,
//         timeframe: 60,
//         page,
//         page_size: 1000,
//       });
//       const result: ApiResponse = res.data;
//       return result.data
//         .map((c) => ({
//           time: c.ts as any,
//           open: c.open,
//           high: c.high,
//           low: c.low,
//           close: c.close,
//         }))
//         .reverse();
//     };

//     // --- Initial Load ---
//     const loadInitialData = async () => {
//       try {
//         const formatted = await fetchCandles(1);
//         if (!isActive) return; // Ignore if user already switched instruments

//         allDataRef.current = formatted;
//         candleSeries.setData(formatted);

//         if (formatted.length > 0) {
//           const lastCandle = formatted[formatted.length - 1];
//           setLatestCandle({
//             open: lastCandle.open,
//             high: lastCandle.high,
//             low: lastCandle.low,
//             close: lastCandle.close,
//           });
//         }
//       } catch (error) {
//         if (isActive) setIsError(true);
//       } finally {
//         if (isActive) setIsInitialLoading(false);
//       }
//     };

//     // --- Pagination Load ---
//     const loadMoreHistory = async () => {
//       if (isLoadingRef.current || !hasMoreRef.current) return;
//       isLoadingRef.current = true;

//       try {
//         const nextPage = pageRef.current + 1;
//         const olderData = await fetchCandles(nextPage);

//         if (!isActive) return; // Ignore if component unmounted or instrument changed

//         if (olderData.length === 0) {
//           hasMoreRef.current = false;
//           return;
//         }

//         pageRef.current = nextPage;
//         allDataRef.current = [...olderData, ...allDataRef.current];
//         candleSeries.setData(allDataRef.current);
//       } catch (error) {
//         console.error("Failed to load historical data:", error);
//       } finally {
//         if (isActive) isLoadingRef.current = false;
//       }
//     };

//     // 5. Setup Listeners
//     chart.timeScale().subscribeVisibleLogicalRangeChange((range) => {
//       if (range && range.from < 20) {
//         loadMoreHistory();
//       }
//     });

//     chart.subscribeCrosshairMove((param) => {
//       if (
//         !param.point ||
//         !param.time ||
//         param.point.x < 0 ||
//         param.point.y < 0
//       ) {
//         setHoveredCandle(null);
//       } else {
//         const data = param.seriesData.get(candleSeries) as
//           | LegendData
//           | undefined;
//         if (data) {
//           setHoveredCandle({
//             open: data.open,
//             high: data.high,
//             low: data.low,
//             close: data.close,
//           });
//         }
//       }
//     });

//     // Start data fetch
//     loadInitialData();

//     // 6. Cleanup function: Runs right before the instrument changes or component unmounts
//     return () => {
//       isActive = false; // Kill any pending API requests
//       resizeObserver.disconnect();
//       chart.remove(); // Safely destroy the canvas
//     };
//   }, [selectedInstrument]);

//   // ==========================================
//   // NEW: EMPTY STATE CHECK
//   // If there is no instrument selected, show this UI instead of the chart
//   // ==========================================
//   if (!selectedInstrument) {
//     return (
//       <div style={emptyStateStyle}>
//         <h2 style={{ fontSize: "20px", marginBottom: "8px", fontWeight: 600 }}>
//           No Instrument Selected
//         </h2>
//         <p style={{ color: "#6b7280", fontSize: "14px" }}>
//           Please select a trading instrument to view its chart data.
//         </p>
//       </div>
//     );
//   }

//   // UI Render Logic
//   const displayCandle = hoveredCandle || latestCandle;

//   const valueColor = displayCandle
//     ? displayCandle.close >= displayCandle.open
//       ? "#089981"
//       : "#f23645"
//     : "#191919";

//   return (
//     <div style={{ position: "relative", width: "100%", height: "100%" }}>
//       {/* OHLC Legend Overlay */}
//       {displayCandle && (
//         <div style={legendWrapper}>
//           <div style={symbolStyle}>
//             {symbol} • {series}
//           </div>
//           <div style={legendStyle}>
//             <div style={legendItemStyle}>
//               <span style={labelStyle}>O</span>
//               <span style={{ ...valueStyle, color: valueColor }}>
//                 {displayCandle.open.toFixed(2)}
//               </span>
//             </div>
//             <div style={legendItemStyle}>
//               <span style={labelStyle}>H</span>
//               <span style={{ ...valueStyle, color: valueColor }}>
//                 {displayCandle.high.toFixed(2)}
//               </span>
//             </div>
//             <div style={legendItemStyle}>
//               <span style={labelStyle}>L</span>
//               <span style={{ ...valueStyle, color: valueColor }}>
//                 {displayCandle.low.toFixed(2)}
//               </span>
//             </div>
//             <div style={legendItemStyle}>
//               <span style={labelStyle}>C</span>
//               <span style={{ ...valueStyle, color: valueColor }}>
//                 {displayCandle.close.toFixed(2)}
//               </span>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Loading Overlay */}
//       {isInitialLoading && (
//         <div style={overlayStyle}>
//           <Loader />
//         </div>
//       )}

//       {/* Error Overlay */}
//       {isError && (
//         <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/90">
//           <div className="max-w-md text-center bg-white border border-gray-200 shadow-md rounded-lg px-6 py-4">
//             <span className="text-sm font-medium text-gray-700 leading-relaxed">
//               Due to a temporary issue, we are unable to fetch and load the
//               chart data. Please try again after some time.
//             </span>
//           </div>
//         </div>
//       )}

//       {/* Chart Container */}
//       <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
//     </div>
//   );
// };

// // --- Styles ---

// const emptyStateStyle: React.CSSProperties = {
//   display: "flex",
//   flexDirection: "column",
//   justifyContent: "center",
//   alignItems: "center",
//   width: "100%",
//   height: "100%",
//   minHeight: "400px", // Ensures it has space even if parent is collapsed
//   backgroundColor: "#ffffff",
//   color: "#191919",
//   fontFamily:
//     "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
//   textAlign: "center",
//   padding: "20px",
//   border: "1px dashed #e1e3e6",
//   borderRadius: "8px",
// };

// const legendWrapper: React.CSSProperties = {
//   position: "absolute",
//   top: 12,
//   left: 12,
//   zIndex: 20,
//   display: "flex",
//   alignItems: "center",
//   background: "rgba(255, 255, 255, 0.95)",
//   backdropFilter: "blur(4px)",
//   padding: "8px 16px",
//   borderRadius: "6px",
//   boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
//   border: "1px solid #e1e3e6",
//   pointerEvents: "none",
//   fontFamily:
//     "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
//   fontSize: "13px",
//   fontWeight: 500,
// };

// const symbolStyle: React.CSSProperties = {
//   fontSize: "14px",
//   fontWeight: 700,
//   color: "#191919",
//   borderRight: "1px solid #e1e3e6",
//   paddingRight: "16px",
//   marginRight: "16px",
// };

// const legendStyle: React.CSSProperties = {
//   display: "flex",
//   gap: "16px",
// };

// const legendItemStyle: React.CSSProperties = {
//   display: "flex",
//   alignItems: "center",
//   minWidth: "75px",
// };

// const labelStyle: React.CSSProperties = {
//   color: "#9094a6",
//   marginRight: "6px",
// };

// const valueStyle: React.CSSProperties = {
//   fontVariantNumeric: "tabular-nums",
// };

// const overlayStyle: React.CSSProperties = {
//   position: "absolute",
//   top: 0,
//   left: 0,
//   right: 0,
//   bottom: 0,
//   backgroundColor: "rgba(255, 255, 255, 0.9)",
//   color: "#191919",
//   display: "flex",
//   justifyContent: "center",
//   alignItems: "center",
//   zIndex: 10,
//   fontFamily: "sans-serif",
//   fontSize: "14px",
//   fontWeight: 500,
// };

// export default TradingChart;

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

  // Pagination & Fetching Refs
  const pageRef = useRef(1);
  const allDataRef = useRef<CandlestickData[]>([]);
  const isLoadingRef = useRef(false);
  const hasMoreRef = useRef(true);

  // NEW: This ref prevents the socket from contaminating the chart with old instrument prices
  const dataLockRef = useRef<string | null>(null);

  // UI State
  const [isError, setIsError] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Legend State
  const [hoveredCandle, setHoveredCandle] = useState<LegendData | null>(null);
  const [latestCandle, setLatestCandle] = useState<LegendData | null>(null);

  const chartSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  const topic = selectedInstrument ? `tick_message_${selectedInstrument}` : "";

  useSocket(topic, (tick) => {
    // SECURITY CHECK 1: Ensure we have data and the lock matches the CURRENT instrument
    if (
      !tick ||
      !allDataRef.current.length ||
      dataLockRef.current !== selectedInstrument
    ) {
      return;
    }

    // SECURITY CHECK 2 (Highly Recommended):
    // If your 'tick' object contains the instrument ID, uncomment and use this check!
    // if (tick.InstrumentId !== selectedInstrument) return;

    const price = tick.Price;
    const time = tick.Time;

    const lastCandle = allDataRef.current[allDataRef.current.length - 1];
    if (!lastCandle) return;

    const candleTime = lastCandle.time as number;
    const candleDuration = 60; // timeframe

    // same candle
    if (time < candleTime + candleDuration) {
      const updatedCandle = {
        ...lastCandle,
        close: price,
        high: Math.max(lastCandle.high, price),
        low: Math.min(lastCandle.low, price),
      };

      allDataRef.current[allDataRef.current.length - 1] = updatedCandle;
      chartSeriesRef.current?.update(updatedCandle);
      setLatestCandle(updatedCandle);
    }
    // new candle
    else {
      const newCandle = {
        time: time as any,
        open: price,
        high: price,
        low: price,
        close: price,
      };

      allDataRef.current.push(newCandle);
      chartSeriesRef.current?.update(newCandle);
      setLatestCandle(newCandle);
    }
  });

  // Sync selected instrument with router state
  useEffect(() => {
    if (location.state?.instrumentKey) {
      setSelectedInstrument(location.state.instrumentKey);
    }
  }, [location.state]);

  // MAIN CHART EFFECT: Runs whenever selectedInstrument changes
  useEffect(() => {
    if (!containerRef.current || !selectedInstrument) return;

    let isActive = true;

    // 1. Reset all state for the new instrument
    pageRef.current = 1;
    allDataRef.current = [];
    hasMoreRef.current = true;
    isLoadingRef.current = false;
    dataLockRef.current = null; // RELOCK THE SOCKET: Stop socket updates while loading

    setIsInitialLoading(true);
    setIsError(false);
    setHoveredCandle(null);
    setLatestCandle(null);

    // 2. Create New Chart
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

    // 3. Add Series
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#089981",
      downColor: "#f23645",
      borderVisible: false,
      wickUpColor: "#089981",
      wickDownColor: "#f23645",
    });
    chartSeriesRef.current = candleSeries;

    // 4. Setup Auto-Resizing
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

    // --- Helper function to fetch & format ---
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

    // --- Initial Load ---
    const loadInitialData = async () => {
      try {
        const formatted = await fetchCandles(1);
        if (!isActive) return;

        allDataRef.current = formatted;
        candleSeries.setData(formatted);

        // UNLOCK THE SOCKET: Tell the socket it's safe to start updating the chart now
        dataLockRef.current = selectedInstrument;

        if (formatted.length > 0) {
          const lastCandle = formatted[formatted.length - 1];
          setLatestCandle({
            open: lastCandle.open,
            high: lastCandle.high,
            low: lastCandle.low,
            close: lastCandle.close,
          });
        }
      } catch (error) {
        if (isActive) setIsError(true);
      } finally {
        if (isActive) setIsInitialLoading(false);
      }
    };

    // --- Pagination Load ---
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

    // 5. Setup Listeners
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
        setHoveredCandle(null);
      } else {
        const data = param.seriesData.get(candleSeries) as
          | LegendData
          | undefined;
        if (data) {
          setHoveredCandle({
            open: data.open,
            high: data.high,
            low: data.low,
            close: data.close,
          });
        }
      }
    });

    // Start data fetch
    loadInitialData();

    // 6. Cleanup
    return () => {
      isActive = false;
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [selectedInstrument]);

  // EMPTY STATE CHECK
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

  // UI Render Logic
  const displayCandle = hoveredCandle || latestCandle;

  const valueColor = displayCandle
    ? displayCandle.close >= displayCandle.open
      ? "#089981"
      : "#f23645"
    : "#191919";

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {displayCandle && (
        <div style={legendWrapper}>
          <div style={symbolStyle}>
            {symbol} • {series}
          </div>
          <div style={legendStyle}>
            <div style={legendItemStyle}>
              <span style={labelStyle}>O</span>
              <span style={{ ...valueStyle, color: valueColor }}>
                {displayCandle.open.toFixed(2)}
              </span>
            </div>
            <div style={legendItemStyle}>
              <span style={labelStyle}>H</span>
              <span style={{ ...valueStyle, color: valueColor }}>
                {displayCandle.high.toFixed(2)}
              </span>
            </div>
            <div style={legendItemStyle}>
              <span style={labelStyle}>L</span>
              <span style={{ ...valueStyle, color: valueColor }}>
                {displayCandle.low.toFixed(2)}
              </span>
            </div>
            <div style={legendItemStyle}>
              <span style={labelStyle}>C</span>
              <span style={{ ...valueStyle, color: valueColor }}>
                {displayCandle.close.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}

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

// ... (Your existing styles remain exactly the same below here)
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
const valueStyle: React.CSSProperties = { fontVariantNumeric: "tabular-nums" };
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