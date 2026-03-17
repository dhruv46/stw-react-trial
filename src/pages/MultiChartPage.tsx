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

//   // 🔥 NEW: control chart rendering order
//   const [visibleCharts, setVisibleCharts] = useState<number[]>([]);

//   useEffect(() => {
//     const fetchInstrument = async () => {
//       try {
//         if (!id) return;

//         const res = await getStrategyInstrumentApi(Number(id));

//         // ✅ FIXED (IMPORTANT)
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

//   // 🔥 MAIN FIX: sequential rendering
//   useEffect(() => {
//     if (!instrumentKey) return;

//     const tfs = [1, 15, 30, 60];

//     setVisibleCharts([]); // reset

//     tfs.forEach((tf, index) => {
//       setTimeout(() => {
//         setVisibleCharts((prev) => [...prev, tf]);
//       }, index * 300); // delay each chart
//     });
//   }, [instrumentKey]);

//   if (!instrumentKey) {
//     return (
//       <div className="flex items-center justify-center h-screen bg-gray-100 text-gray-500 font-medium">
//         Loading charts...
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col h-screen w-full bg-gray-100 p-2 overflow-hidden">
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

//       {/* GRID (UNCHANGED DESIGN) */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 lg:grid-rows-2 gap-2 flex-1 min-h-0 h-full">
//         <div className="bg-white rounded border shadow-sm overflow-hidden h-full w-full relative">
//           {visibleCharts.includes(1) ? (
//             <TimeframeChart
//               key={`${instrumentKey}-1`}
//               timeframe={1}
//               instrumentKey={instrumentKey}
//               symbol={symbol}
//             />
//           ) : (
//             <div className="flex items-center justify-center h-full text-gray-400">
//               Loading 1m...
//             </div>
//           )}
//         </div>

//         <div className="bg-white rounded border shadow-sm overflow-hidden h-full w-full relative">
//           {visibleCharts.includes(15) ? (
//             <TimeframeChart
//               key={`${instrumentKey}-15`}
//               timeframe={15}
//               instrumentKey={instrumentKey}
//               symbol={symbol}
//             />
//           ) : (
//             <div className="flex items-center justify-center h-full text-gray-400">
//               Loading 15m...
//             </div>
//           )}
//         </div>

//         <div className="bg-white rounded border shadow-sm overflow-hidden h-full w-full relative">
//           {visibleCharts.includes(30) ? (
//             <TimeframeChart
//               key={`${instrumentKey}-30`}
//               timeframe={30}
//               instrumentKey={instrumentKey}
//               symbol={symbol}
//             />
//           ) : (
//             <div className="flex items-center justify-center h-full text-gray-400">
//               Loading 30m...
//             </div>
//           )}
//         </div>

//         <div className="bg-white rounded border shadow-sm overflow-hidden h-full w-full relative">
//           {visibleCharts.includes(60) ? (
//             <TimeframeChart
//               key={`${instrumentKey}-60`}
//               timeframe={60}
//               instrumentKey={instrumentKey}
//               symbol={symbol}
//             />
//           ) : (
//             <div className="flex items-center justify-center h-full text-gray-400">
//               Loading 60m...
//             </div>
//           )}
//         </div>
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
} from "../services/autoStrategyApi";

const MultiChartPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();

  const strategyName = searchParams.get("strategyName");

  const [instrumentKey, setInstrumentKey] = useState<string | number>("");
  const [symbol, setSymbol] = useState<string>("");

  // 🔥 NEW: dynamic timeframes
  const [timeframes, setTimeframes] = useState<number[]>([]);

  // 🔥 control render order
  const [visibleCharts, setVisibleCharts] = useState<number[]>([]);

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
  useEffect(() => {
    const fetchTimeframes = async () => {
      try {
        if (!id) return;

        const res = await getStrategyTimeframeApi(Number(id));
        const result = res?.data;

        console.log("Timeframe API:", result);

        if (!Array.isArray(result)) return;

        // 🔥 Convert seconds → minutes
        const mapped = result.map((sec: number) => sec / 60);

        setTimeframes(mapped);
      } catch (error) {
        console.error("Error fetching timeframes:", error);
      }
    };

    fetchTimeframes();
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

  if (!instrumentKey) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 text-gray-500 font-medium">
        Loading charts...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full bg-gray-100 p-2 overflow-hidden">
      {/* HEADER */}
      <div className="bg-white rounded shadow-sm border border-gray-200 px-4 py-2 mb-2 flex items-center gap-6 text-sm font-semibold flex-shrink-0">
        <div>
          Strategy Name:{" "}
          <span className="font-normal text-gray-600">{strategyName}</span>
        </div>
        <div>
          Underlying:{" "}
          <span className="font-normal text-gray-600">{symbol}</span>
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 lg:grid-rows-2 gap-2 flex-1 min-h-0 h-full">
        {timeframes.map((tf) => (
          <div
            key={tf}
            className="bg-white rounded border shadow-sm overflow-hidden h-full w-full relative"
          >
            {visibleCharts.includes(tf) ? (
              <TimeframeChart
                key={`${instrumentKey}-${tf}`}
                timeframe={tf}
                instrumentKey={instrumentKey}
                symbol={symbol}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                Loading {tf}m...
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MultiChartPage;
