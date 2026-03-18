// import { useEffect, useState } from "react";
// import { useParams, useSearchParams } from "react-router-dom";
// import TimeframeChart from "../chart/TimeframeChart";
// import {
//   getStrategyInstrumentApi,
//   getStrategyTimeframeApi,
// } from "../services/autoStrategyApi";

// const MultiChartPage = () => {
//   const { id } = useParams();
//   const [searchParams] = useSearchParams();

//   const strategyName = searchParams.get("strategyName");

//   const [instrumentKey, setInstrumentKey] = useState<string | number>("");
//   const [symbol, setSymbol] = useState<string>("");

//   // 🔥 NEW: dynamic timeframes
//   const [timeframes, setTimeframes] = useState<number[]>([]);

//   // 🔥 control render order
//   const [visibleCharts, setVisibleCharts] = useState<number[]>([]);

//   /* ================= FETCH INSTRUMENT ================= */
//   useEffect(() => {
//     const fetchInstrument = async () => {
//       try {
//         if (!id) return;

//         const res = await getStrategyInstrumentApi(Number(id));
//         const result = res?.data;

//         if (
//           !Array.isArray(result) ||
//           result.length === 0 ||
//           !Array.isArray(result[0])
//         ) {
//           console.error("Invalid instrument data");
//           return;
//         }

//         const [instId, instSymbol] = result[0];

//         setInstrumentKey(instId);
//         setSymbol(instSymbol);
//       } catch (error) {
//         console.error("Error fetching instrument:", error);
//       }
//     };

//     fetchInstrument();
//   }, [id]);

//   /* ================= FETCH TIMEFRAMES ================= */
//   useEffect(() => {
//     const fetchTimeframes = async () => {
//       try {
//         if (!id) return;

//         const res = await getStrategyTimeframeApi(Number(id));
//         const result = res?.data;

//         console.log("Timeframe API:", result);

//         if (!Array.isArray(result)) return;

//         // 🔥 Convert seconds → minutes
//         const mapped = result.map((sec: number) => sec / 60);

//         setTimeframes(mapped);
//       } catch (error) {
//         console.error("Error fetching timeframes:", error);
//       }
//     };

//     fetchTimeframes();
//   }, [id]);

//   /* ================= SEQUENTIAL RENDER ================= */
//   useEffect(() => {
//     if (!instrumentKey || timeframes.length === 0) return;

//     setVisibleCharts([]);

//     timeframes.forEach((tf, index) => {
//       setTimeout(() => {
//         setVisibleCharts((prev) => [...prev, tf]);
//       }, index * 300);
//     });
//   }, [instrumentKey, timeframes]);

//   if (!instrumentKey) {
//     return (
//       <div className="flex items-center justify-center h-screen bg-gray-100 text-gray-500 font-medium">
//         Loading charts...
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col h-screen w-full bg-gray-100 p-2 overflow-scroll">
//       {/* HEADER */}
//       <div className="bg-white rounded shadow-sm border border-gray-200 px-4 py-2 mb-2 flex items-center gap-6 text-sm font-semibold flex-shrink-0">
//         <div>
//           Strategy Name:{" "}
//           <span className="font-normal text-gray-600">{strategyName}</span>
//         </div>
//         <div>
//           Underlying:{" "}
//           <span className="font-normal text-gray-600">{symbol}</span>
//         </div>
//       </div>

//       {/* GRID */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 lg:grid-rows-2 gap-2 flex-1 min-h-0 h-full">
//         {timeframes.map((tf) => (
//           <div
//             key={tf}
//             className="bg-white rounded border shadow-sm overflow-hidden h-full w-full relative"
//           >
//             {visibleCharts.includes(tf) ? (
//               <TimeframeChart
//                 key={`${instrumentKey}-${tf}`}
//                 timeframe={tf}
//                 instrumentKey={instrumentKey}
//                 symbol={symbol}
//               />
//             ) : (
//               <div className="flex items-center justify-center h-full text-gray-400">
//                 Loading {tf}m...
//               </div>
//             )}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default MultiChartPage;

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import TimeframeChart from "../chart/TimeframeChart";
import {
  getStrategyInstrumentApi,
  getStrategyTimeframeApi,
  getStrategyIndicatorApi,
} from "../services/autoStrategyApi";

const MultiChartPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();

  const strategyName = searchParams.get("strategyName");

  const [instrumentKey, setInstrumentKey] = useState<string | number>("");
  const [symbol, setSymbol] = useState<string>("");

  const [timeframes, setTimeframes] = useState<number[]>([]);
  const [visibleCharts, setVisibleCharts] = useState<number[]>([]);
  const [indicators, setIndicators] = useState<any>(null);

  /* ================= FETCH INSTRUMENT ================= */
  useEffect(() => {
    const fetchInstrument = async () => {
      try {
        if (!id) return;
        const res = await getStrategyInstrumentApi(Number(id));
        const result = res?.data;

        if (
          !Array.isArray(result) ||
          result.length === 0 ||
          !Array.isArray(result[0])
        ) {
          console.error("Invalid instrument data");
          return;
        }

        const [instId, instSymbol] = result[0];
        setInstrumentKey(instId);
        setSymbol(instSymbol);
      } catch (error) {
        console.error("Error fetching instrument:", error);
      }
    };

    fetchInstrument();
  }, [id]);

  /* ================= FETCH TIMEFRAMES ================= */
  // useEffect(() => {
  //   const fetchTimeframes = async () => {
  //     try {
  //       if (!id) return;
  //       const res = await getStrategyTimeframeApi(Number(id));
  //       const result = res?.data;

  //       if (!Array.isArray(result)) return;

  //       const mapped = result.map((sec: number) => sec / 60);
  //       setTimeframes(mapped);
  //     } catch (error) {
  //       console.error("Error fetching timeframes:", error);
  //     }
  //   };

  //   fetchTimeframes();
  // }, [id]);

  /* ================= FETCH TIMEFRAMES & INDICATORS ================= */
  useEffect(() => {
    const fetchTimeframesAndIndicators = async () => {
      try {
        if (!id) return;

        // Fetch timeframes
        const tfRes = await getStrategyTimeframeApi(Number(id));
        if (Array.isArray(tfRes?.data)) {
          setTimeframes(tfRes.data.map((sec: number) => sec / 60));
        }

        // 🔥 NEW: Fetch Indicators
        const indRes = await getStrategyIndicatorApi(Number(id));
        if (indRes?.data) {
          setIndicators(indRes.data);
        }
      } catch (error) {
        console.error("Error fetching strategy data:", error);
      }
    };

    fetchTimeframesAndIndicators();
  }, [id]);

  /* ================= SEQUENTIAL RENDER ================= */
  useEffect(() => {
    if (!instrumentKey || timeframes.length === 0) return;

    setVisibleCharts([]);

    timeframes.forEach((tf, index) => {
      setTimeout(() => {
        setVisibleCharts((prev) => [...prev, tf]);
      }, index * 300);
    });
  }, [instrumentKey, timeframes]);

  // 🔥 Strictly control rows and columns based on count so they don't guess
  const gridColsClass = timeframes.length === 1 ? "grid-cols-1" : "grid-cols-2";
  const gridRowsClass = timeframes.length <= 2 ? "grid-rows-1" : "grid-rows-2";

  /* ================= FULL PAGE LOADER ================= */
  if (!instrumentKey) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full bg-slate-50 text-slate-500">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <span className="font-medium tracking-wide">
          Initializing Charts...
        </span>
      </div>
    );
  }

  return (
    // 🔥 Changed to h-full w-full so it respects your layout's sidebar!
    <div className="flex flex-col h-full w-full bg-slate-50 p-2 overflow-hidden box-border">
      {/* HEADER */}
      {/* flex-none ensures header takes only what it needs, no more */}
      <div className="flex-none bg-white rounded shadow-sm border border-slate-200 px-4 py-2 mb-2 flex items-center justify-between">
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-xs">
              Strategy
            </span>
            <span className="bg-blue-50 text-blue-700 font-medium px-2 py-1 rounded">
              {strategyName || "Unknown"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-xs">
              Underlying
            </span>
            <span className="bg-emerald-50 text-emerald-700 font-medium px-2 py-1 rounded">
              {symbol}
            </span>
          </div>
        </div>
      </div>

      {/* GRID */}
      {/* 🔥 min-h-0 here stops the grid from expanding beyond the flex container */}
      <div
        className={`grid ${gridColsClass} ${gridRowsClass} gap-2 flex-1 min-h-0 w-full`}
      >
        {timeframes.map((tf) => (
          <div
            key={tf}
            // 🔥 min-h-0 on the grid item is CRITICAL to stop canvas from stretching it
            className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden relative flex flex-col min-h-0 w-full"
          >
            {visibleCharts.includes(tf) ? (
              // 🔥 min-h-0 on the chart wrapper forces the chart to obey the grid boundaries
              <div className="flex-1 min-h-0 min-w-0 w-full h-full relative">
                <TimeframeChart
                  key={`${instrumentKey}-${tf}`}
                  timeframe={tf}
                  instrumentKey={instrumentKey}
                  symbol={symbol}
                  indicatorConfig={indicators} // 🔥 NEW PROP
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full w-full bg-slate-50/50">
                <div className="animate-pulse flex flex-col items-center">
                  <div className="h-6 w-6 bg-slate-200 rounded-full mb-3"></div>
                  <span className="text-slate-400 font-medium text-sm">
                    Loading {tf}m...
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MultiChartPage;
