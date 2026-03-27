// import { useSearchParams } from "react-router-dom";
// import { useEffect, useMemo, useRef, useState } from "react";
// import { Card, Table, Typography } from "antd";
// import { DownOutlined, UpOutlined } from "@ant-design/icons";
// import type { ColumnsType } from "antd/es/table";
// import { getPositionApi } from "../services/positionApi";
// import Loader from "../components/Loader";
// import socketService from "../services/socketService";

// const { Text } = Typography;

// export interface PositionRow {
//   id: number;
//   strategy_id: number;
//   strategy_name: string;
//   DisplayName: string;
//   client_name?: string;
//   last_trade_price: number;
//   sell_value: number;
//   quantity: number;
//   ltp: number;
//   buy_value: number;
//   PercentChange?: number;
//   instrument?: number;
// }

// /* =====================================================
//    Helpers (Updated with your exact formulas)
// ===================================================== */

// const getCurrentValue = (row: PositionRow) => {
//   return Math.abs(row.ltp * row.quantity);
// };

// const getPnl = (row: PositionRow) => {
//   if (row.ltp && row.quantity) {
//     return row.quantity > 0
//       ? (row.ltp - row.last_trade_price) * row.quantity
//       : (row.last_trade_price - row.ltp) * Math.abs(row.quantity);
//   }
//   return 0;
// };

// const getNetChangePercent = (row: PositionRow) => {
//   if (row.last_trade_price && row.last_trade_price !== 0) {
//     return ((row.ltp - row.last_trade_price) / row.last_trade_price) * 100;
//   }
//   return 0;
// };

// const getDayChangePercent = (row: PositionRow) => {
//   if (row.last_trade_price && row.last_trade_price !== 0) {
//     return ((row.ltp - row.last_trade_price) / row.last_trade_price) * 100;
//   }
//   return 0;
// };

// // Kept these just in case you still want to display them in the columns
// const getAvgBuyPrice = (row: PositionRow) =>
//   !row.quantity || row.buy_value === 0
//     ? 0
//     : row.buy_value / Math.abs(row.quantity);

// const getAvgSellPrice = (row: PositionRow) =>
//   !row.quantity || row.sell_value === 0
//     ? 0
//     : Math.abs(row.sell_value) / Math.abs(row.quantity);

// /* =====================================================
//    Collapsible Table Group
// ===================================================== */
// const CollapsibleTableGroup = ({
//   subTitle,
//   rows,
//   mode,
//   columns,
// }: {
//   subTitle: string;
//   rows: PositionRow[];
//   mode: string;
//   columns: ColumnsType<PositionRow>;
// }) => {
//   const [isOpen, setIsOpen] = useState(true);

//   let totalPnl = 0,
//     totalCurVal = 0,
//     totalBaseVal = 0;

//   rows.forEach((row) => {
//     totalPnl += getPnl(row);
//     totalCurVal += getCurrentValue(row);
//     // Updated totalBaseVal to use last_trade_price to keep the group Total Net% accurate
//     totalBaseVal += Math.abs(row.last_trade_price * row.quantity);
//   });

//   const totalNet =
//     totalBaseVal !== 0 ? ((totalPnl / totalBaseVal) * 100).toFixed(2) : "0.00";

//   return (
//     <div className="mb-2 last:mb-0">
//       {/* Header - Ultra Compact */}
//       <div
//         onClick={() => setIsOpen(!isOpen)}
//         className="bg-slate-100 px-2 py-1 border-b border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-200 transition-colors"
//       >
//         <Text
//           strong
//           className="text-slate-700 text-[11px] uppercase tracking-wide"
//         >
//           {mode === "client" ? `STG: ${subTitle}` : `CLI: ${subTitle}`}
//         </Text>
//         {isOpen ? (
//           <UpOutlined className="text-[10px]" />
//         ) : (
//           <DownOutlined className="text-[10px]" />
//         )}
//       </div>

//       {isOpen && (
//         <Table
//           rowKey="id"
//           columns={columns}
//           dataSource={rows}
//           pagination={false}
//           bordered={false}
//           size="small"
//           tableLayout="fixed"
//           scroll={{ x: 950 }}
//           className="ultra-compact-table overflow-x-auto"
//           summary={() => (
//             <Table.Summary.Row className="bg-slate-50 font-semibold text-[11px]">
//               <Table.Summary.Cell index={0} colSpan={6}>
//                 <span className="text-slate-600 uppercase text-[10px] tracking-wider">
//                   Total
//                 </span>
//               </Table.Summary.Cell>
//               <Table.Summary.Cell index={6} align="right">
//                 <span className="tabular-nums text-slate-800">
//                   {totalCurVal.toFixed(2)}
//                 </span>
//               </Table.Summary.Cell>
//               <Table.Summary.Cell index={7} align="right">
//                 <span
//                   className="tabular-nums"
//                   style={{ color: totalPnl >= 0 ? "#16a34a" : "#dc2626" }}
//                 >
//                   {totalPnl > 0 ? "+" : ""}
//                   {totalPnl.toFixed(2)}
//                 </span>
//               </Table.Summary.Cell>
//               <Table.Summary.Cell index={8} align="right">
//                 <span
//                   className="tabular-nums"
//                   style={{
//                     color: Number(totalNet) >= 0 ? "#16a34a" : "#dc2626",
//                   }}
//                 >
//                   {Number(totalNet) > 0 ? "+" : ""}
//                   {totalNet}%
//                 </span>
//               </Table.Summary.Cell>
//               <Table.Summary.Cell index={9} />
//             </Table.Summary.Row>
//           )}
//         />
//       )}
//     </div>
//   );
// };

// /* =====================================================
//    Main Component
// ===================================================== */
// const Positions = () => {
//   const [searchParams] = useSearchParams();
//   const mode = searchParams.get("mode") || "client";
//   const [data, setData] = useState<Record<string, PositionRow[]>>({});
//   const [loading, setLoading] = useState(false);
//   const subscribedRef = useRef<number[]>([]);

//   useEffect(() => {
//     loadData(mode);
//   }, [mode]);

//   const loadData = async (currentMode: string) => {
//     try {
//       setLoading(true);
//       const res = await getPositionApi({
//         position_by: currentMode as "client" | "strategy",
//       });
//       setData(res.data?.result || {});
//       subscribedRef.current = [];
//     } catch (error) {
//       console.error("Error fetching positions:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const allRows = useMemo(() => Object.values(data).flat(), [data]);

//   useEffect(() => {
//     if (!allRows.length) return;

//     const allInstruments = [
//       ...new Set(allRows.map((row) => row.instrument).filter(Boolean)),
//     ] as number[];
//     const newInstruments = allInstruments.filter(
//       (inst) => !subscribedRef.current.includes(inst),
//     );

//     if (!newInstruments.length) return;

//     newInstruments.forEach((inst) => {
//       const topic = `tick_message_${inst}`;
//       socketService.subscribe(topic, (body: any) => {
//         try {
//           const inner =
//             typeof body?.data === "string" ? JSON.parse(body.data) : body?.data;
//           setData((prevData) => {
//             const newData = { ...prevData };
//             let isUpdated = false;
//             Object.keys(newData).forEach((key) => {
//               newData[key] = newData[key].map((p) => {
//                 if (p.instrument === inst) {
//                   isUpdated = true;
//                   return {
//                     ...p,
//                     ltp: Number(inner?.Price ?? p.ltp),
//                     PercentChange: Number(
//                       inner?.PercentChange ?? p.PercentChange ?? 0,
//                     ),
//                   };
//                 }
//                 return p;
//               });
//             });
//             return isUpdated ? newData : prevData;
//           });
//         } catch (error) {
//           console.error(`Socket parse error for ${inst}:`, error);
//         }
//       });
//     });

//     subscribedRef.current = [...subscribedRef.current, ...newInstruments];
//   }, [allRows]);

//   /* ================= Columns ================= */
//   const HeaderText = ({ text }: { text: string }) => (
//     <span className="text-[10px] uppercase text-slate-500 tracking-wider font-bold">
//       {text}
//     </span>
//   );

//   // Add this helper function above your columns array
//   const formatCurrency = (num: number, decimals = 2) => {
//     if (!num || isNaN(num))
//       return (0).toLocaleString("en-IN", { minimumFractionDigits: decimals });
//     return Number(num).toLocaleString("en-IN", {
//       minimumFractionDigits: decimals,
//       maximumFractionDigits: decimals,
//     });
//   };

//   const formatQty = (num: number) => {
//     if (!num || isNaN(num)) return "0";
//     return Number(num).toLocaleString("en-IN"); // No decimals for Quantity
//   };

//   // Your updated columns array
//   const columns: ColumnsType<PositionRow> = [
//     {
//       title: <HeaderText text="Instrument" />,
//       dataIndex: "DisplayName",
//       align: "left",
//       width: 200,
//       ellipsis: true,
//       render: (text) => (
//         <span
//           className="text-[12px] font-bold text-slate-800 truncate"
//           title={text}
//         >
//           {text}
//         </span>
//       ),
//     },
//     {
//       title: <HeaderText text={mode === "client" ? "Strategy" : "Client"} />,
//       width: 130,
//       ellipsis: true,
//       render: (_, row) => (
//         <span className="text-[12px] text-slate-600 truncate block">
//           {mode === "client" ? row.strategy_name : row.client_name || "-"}
//         </span>
//       ),
//     },
//     {
//       title: <HeaderText text="Qty" />,
//       dataIndex: "quantity",
//       align: "right",
//       width: 70,
//       render: (qty) => (
//         <span
//           className={`text-[12px] tabular-nums font-bold ${qty > 0 ? "text-blue-600" : qty < 0 ? "text-red-600" : "text-slate-700"}`}
//         >
//           {formatQty(qty)}
//         </span>
//       ),
//     },
//     {
//       title: <HeaderText text="Buy Avg" />,
//       align: "right",
//       width: 90,
//       render: (_, row) => (
//         <span className="text-[12px] tabular-nums text-slate-600">
//           {formatCurrency(getAvgBuyPrice(row))}
//         </span>
//       ),
//     },
//     {
//       title: <HeaderText text="Sell Avg" />,
//       align: "right",
//       width: 90,
//       render: (_, row) => (
//         <span className="text-[12px] tabular-nums text-slate-600">
//           {formatCurrency(getAvgSellPrice(row))}
//         </span>
//       ),
//     },
//     {
//       title: <HeaderText text="LTP" />,
//       align: "right",
//       dataIndex: "ltp",
//       width: 90,
//       render: (ltp) => (
//         <span className="text-[12px] tabular-nums font-bold text-slate-900 block bg-slate-100 rounded px-1 py-0.5">
//           {formatCurrency(ltp)}
//         </span>
//       ),
//     },
//     {
//       title: <HeaderText text="Cur. Val" />,
//       align: "right",
//       width: 100,
//       render: (_, row) => {
//         const val = getCurrentValue(row); // Returns absolute value
//         const isPositive = row.quantity > 0;
//         const isNegative = row.quantity < 0;

//         return (
//           <span
//             className={`text-[12px] font-bold tabular-nums ${
//               isPositive
//                 ? "text-green-600"
//                 : isNegative
//                   ? "text-red-600"
//                   : "text-slate-700"
//             }`}
//           >
//             {isPositive ? "+" : isNegative ? "-" : ""}
//             {formatCurrency(val)}
//           </span>
//         );
//       },
//     },
//     {
//       title: <HeaderText text="P&L" />,
//       align: "right",
//       width: 100,
//       render: (_, row) => {
//         const pnl = getPnl(row);
//         return (
//           <span
//             className={`text-[12px] font-bold tabular-nums ${pnl >= 0 ? "text-green-600" : "text-red-600"}`}
//           >
//             {pnl > 0 ? "+" : ""}
//             {formatCurrency(pnl)}
//           </span>
//         );
//       },
//     },
//     {
//       title: <HeaderText text="Net %" />,
//       align: "right",
//       width: 80,
//       render: (_, row) => {
//         const percent = getNetChangePercent(row);
//         return (
//           <span
//             className={`text-[12px] font-bold tabular-nums ${percent >= 0 ? "text-green-600" : "text-red-600"}`}
//           >
//             {percent > 0 ? "+" : ""}
//             {formatCurrency(percent)}%
//           </span>
//         );
//       },
//     },
//     {
//       title: <HeaderText text="Day %" />,
//       align: "right",
//       width: 80,
//       render: (_, row) => {
//         const day = getDayChangePercent(row);
//         return (
//           <span
//             className={`text-[11px] font-bold tabular-nums ${day >= 0 ? "text-green-600" : "text-red-600"}`}
//           >
//             {day > 0 ? "+" : ""}
//             {formatCurrency(day)}%
//           </span>
//         );
//       },
//     },
//   ];

//   if (loading) return <Loader />;

//   return (
//     <div className="px-2 py-2 bg-slate-50 min-h-screen">
//       <style>
//         {`
//           /* Aggressive Compaction Overrides */
//           .ultra-compact-table .ant-table {
//             background: white !important;
//             border-bottom: 1px solid #e2e8f0;
//           }

//           .ultra-compact-table .ant-table-thead > tr > th {
//             background: #ffffff !important;
//             color: #64748b !important;
//             padding: 4px 6px !important; /* Extremely tight headers */
//             border-bottom: 2px solid #f1f5f9 !important;
//           }

//           .ultra-compact-table .ant-table-tbody > tr > td {
//             padding: 3px 6px !important; /* Extremely tight rows */
//             line-height: 1.2 !important;
//             border-bottom: 1px solid #f8fafc !important;
//           }

//           .ultra-compact-table .ant-table-tbody > tr:hover > td {
//             background: #f1f5f9 !important;
//           }

//           .ultra-compact-table .ant-table-summary > tr > td {
//             padding: 4px 6px !important;
//             background: #f8fafc !important;
//             border-top: 1px solid #e2e8f0 !important;
//           }

//           .ant-card.compact-card {
//             border-radius: 6px !important;
//             border: 1px solid #cbd5e1 !important;
//           }

//           .ant-card.compact-card > .ant-card-head {
//             min-height: 32px !important;
//             padding: 0 10px !important;
//             border-bottom: 1px solid #e2e8f0 !important;
//             background: #f8fafc !important;
//           }

//           .ant-card.compact-card > .ant-card-head .ant-card-head-title {
//             padding: 6px 0 !important;
//           }

//           .ant-card.compact-card > .ant-card-body {
//             padding: 4px !important; /* Near zero padding inside card */
//           }
//         `}
//       </style>

//       {Object.entries(data).map(([mainKey, rows]) => {
//         const innerGroups: Record<string, PositionRow[]> = {};

//         rows.forEach((row) => {
//           const subKey =
//             mode === "client"
//               ? row.strategy_name
//               : row.client_name || "General";
//           if (!innerGroups[subKey]) innerGroups[subKey] = [];
//           innerGroups[subKey].push(row);
//         });

//         return (
//           <Card
//             key={mainKey}
//             size="small"
//             className="mb-3 shadow-sm compact-card"
//             title={
//               <div className="flex items-center gap-2">
//                 <div className="w-1.5 h-3 bg-blue-600 rounded-sm" />
//                 <span className="text-[12px] font-bold text-slate-800 uppercase tracking-wide">
//                   {mode === "client" ? "CLI:" : "STG:"} {mainKey}
//                 </span>
//               </div>
//             }
//           >
//             {Object.entries(innerGroups).map(([subTitle, subRows]) => (
//               <CollapsibleTableGroup
//                 key={subTitle}
//                 subTitle={subTitle}
//                 rows={subRows}
//                 mode={mode}
//                 columns={columns}
//               />
//             ))}
//           </Card>
//         );
//       })}
//     </div>
//   );
// };

// export default Positions;

import { useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { Card, Table, Typography } from "antd";
import { DownOutlined, UpOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { getPositionApi } from "../services/positionApi";
import Loader from "../components/Loader";
import socketService from "../services/socketService";

const { Text } = Typography;

export interface PositionRow {
  id: number;
  strategy_id: number;
  strategy_name: string;
  DisplayName: string;
  client_name?: string;
  last_trade_price: number;
  sell_value: number;
  quantity: number;
  ltp: number;
  buy_value: number;
  PercentChange?: number;
  instrument?: number;
}

/* =====================================================
   Formatters (Moved to top so all components can use them)
===================================================== */

const formatCurrency = (num: number, decimals = 2) => {
  if (!num || isNaN(num))
    return (0).toLocaleString("en-IN", { minimumFractionDigits: decimals });
  return Number(num).toLocaleString("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

const formatQty = (num: number) => {
  if (!num || isNaN(num)) return "0";
  return Number(num).toLocaleString("en-IN");
};

/* =====================================================
   Helpers 
===================================================== */

// Removed Math.abs so it correctly becomes negative when quantity is negative
const getCurrentValue = (row: PositionRow) => {
  return row.ltp * row.quantity;
};

const getPnl = (row: PositionRow) => {
  if (row.ltp && row.quantity) {
    return row.quantity > 0
      ? (row.ltp - row.last_trade_price) * row.quantity
      : (row.last_trade_price - row.ltp) * Math.abs(row.quantity);
  }
  return 0;
};

const getNetChangePercent = (row: PositionRow) => {
  if (row.last_trade_price && row.last_trade_price !== 0) {
    return ((row.ltp - row.last_trade_price) / row.last_trade_price) * 100;
  }
  return 0;
};

const getDayChangePercent = (row: PositionRow) => {
  if (row.last_trade_price && row.last_trade_price !== 0) {
    return ((row.ltp - row.last_trade_price) / row.last_trade_price) * 100;
  }
  return 0;
};

const getAvgBuyPrice = (row: PositionRow) =>
  !row.quantity || row.buy_value === 0
    ? 0
    : row.buy_value / Math.abs(row.quantity);

const getAvgSellPrice = (row: PositionRow) =>
  !row.quantity || row.sell_value === 0
    ? 0
    : Math.abs(row.sell_value) / Math.abs(row.quantity);

/* =====================================================
   Collapsible Table Group
===================================================== */
const CollapsibleTableGroup = ({
  subTitle,
  rows,
  mode,
  columns,
}: {
  subTitle: string;
  rows: PositionRow[];
  mode: string;
  columns: ColumnsType<PositionRow>;
}) => {
  const [isOpen, setIsOpen] = useState(true);

  let totalPnl = 0,
    totalCurVal = 0,
    totalNetPercentSum = 0; // Replaced totalBaseVal with this

  rows.forEach((row) => {
    totalPnl += getPnl(row);
    totalCurVal += getCurrentValue(row);
    totalNetPercentSum += getNetChangePercent(row); // Add up each row's net change %
  });

  // Calculate the simple average of the percentages
  const totalNet =
    rows.length > 0 ? (totalNetPercentSum / rows.length).toFixed(2) : "0.00";

  return (
    <div className="mb-2 last:mb-0">
      {/* Header - Ultra Compact */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="bg-slate-100 px-2 py-1 border-b border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-200 transition-colors"
      >
        <Text
          strong
          className="text-slate-700 text-[11px] uppercase tracking-wide"
        >
          {mode === "client" ? `STG: ${subTitle}` : `CLI: ${subTitle}`}
        </Text>
        {isOpen ? (
          <UpOutlined className="text-[10px]" />
        ) : (
          <DownOutlined className="text-[10px]" />
        )}
      </div>

      {isOpen && (
        <Table
          rowKey="id"
          columns={columns}
          dataSource={rows}
          pagination={false}
          bordered={false}
          size="small"
          tableLayout="fixed"
          scroll={{ x: 950 }}
          className="ultra-compact-table overflow-x-auto"
          summary={() => (
            <Table.Summary.Row className="bg-slate-50 font-semibold text-[11px]">
              <Table.Summary.Cell index={0} colSpan={6}>
                <span className="text-slate-600 uppercase text-[10px] tracking-wider">
                  Total
                </span>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={6} align="right">
                <span
                  className={`tabular-nums font-bold ${totalCurVal > 0 ? "text-green-600" : totalCurVal < 0 ? "text-red-600" : "text-slate-800"}`}
                >
                  {totalCurVal > 0 ? "+" : ""}
                  {formatCurrency(totalCurVal)}
                </span>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={7} align="right">
                <span
                  className="tabular-nums"
                  style={{ color: totalPnl >= 0 ? "#16a34a" : "#dc2626" }}
                >
                  {totalPnl > 0 ? "+" : ""}
                  {formatCurrency(totalPnl)}
                </span>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={8} align="right">
                <span
                  className="tabular-nums"
                  style={{
                    color: Number(totalNet) >= 0 ? "#16a34a" : "#dc2626",
                  }}
                >
                  {Number(totalNet) > 0 ? "+" : ""}
                  {formatCurrency(Number(totalNet))}%
                </span>
              </Table.Summary.Cell>
              {/* <Table.Summary.Cell index={9} /> */}
              <Table.Summary.Cell index={9} align="right">
                <span
                  className="tabular-nums"
                  style={{
                    color: Number(totalNet) >= 0 ? "#16a34a" : "#dc2626",
                  }}
                >
                  {Number(totalNet) > 0 ? "+" : ""}
                  {formatCurrency(Number(totalNet))}%
                </span>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          )}
        />
      )}
    </div>
  );
};

/* =====================================================
   Main Component
===================================================== */
const Positions = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode") || "client";
  const [data, setData] = useState<Record<string, PositionRow[]>>({});
  const [loading, setLoading] = useState(false);
  const subscribedRef = useRef<number[]>([]);

  useEffect(() => {
    loadData(mode);
  }, [mode]);

  const loadData = async (currentMode: string) => {
    try {
      setLoading(true);
      const res = await getPositionApi({
        position_by: currentMode as "client" | "strategy",
      });
      setData(res.data?.result || {});
      subscribedRef.current = [];
    } catch (error) {
      console.error("Error fetching positions:", error);
    } finally {
      setLoading(false);
    }
  };

  const allRows = useMemo(() => Object.values(data).flat(), [data]);

  useEffect(() => {
    if (!allRows.length) return;

    const allInstruments = [
      ...new Set(allRows.map((row) => row.instrument).filter(Boolean)),
    ] as number[];
    const newInstruments = allInstruments.filter(
      (inst) => !subscribedRef.current.includes(inst),
    );

    if (!newInstruments.length) return;

    newInstruments.forEach((inst) => {
      const topic = `tick_message_${inst}`;
      socketService.subscribe(topic, (body: any) => {
        try {
          const inner =
            typeof body?.data === "string" ? JSON.parse(body.data) : body?.data;
          setData((prevData) => {
            const newData = { ...prevData };
            let isUpdated = false;
            Object.keys(newData).forEach((key) => {
              newData[key] = newData[key].map((p) => {
                if (p.instrument === inst) {
                  isUpdated = true;
                  return {
                    ...p,
                    ltp: Number(inner?.Price ?? p.ltp),
                    PercentChange: Number(
                      inner?.PercentChange ?? p.PercentChange ?? 0,
                    ),
                  };
                }
                return p;
              });
            });
            return isUpdated ? newData : prevData;
          });
        } catch (error) {
          console.error(`Socket parse error for ${inst}:`, error);
        }
      });
    });

    subscribedRef.current = [...subscribedRef.current, ...newInstruments];
  }, [allRows]);

  /* ================= Columns ================= */
  const HeaderText = ({ text }: { text: string }) => (
    <span className="text-[10px] uppercase text-slate-500 tracking-wider font-bold">
      {text}
    </span>
  );

  const columns: ColumnsType<PositionRow> = [
    {
      title: <HeaderText text="Instrument" />,
      dataIndex: "DisplayName",
      align: "left",
      width: 200,
      ellipsis: true,
      render: (text) => (
        <span
          className="text-[12px] font-bold text-slate-800 truncate"
          title={text}
        >
          {text}
        </span>
      ),
    },
    {
      title: <HeaderText text={mode === "client" ? "Strategy" : "Client"} />,
      width: 130,
      ellipsis: true,
      render: (_, row) => (
        <span className="text-[12px] text-slate-600 truncate block">
          {mode === "client" ? row.strategy_name : row.client_name || "-"}
        </span>
      ),
    },
    {
      title: <HeaderText text="Qty" />,
      dataIndex: "quantity",
      align: "right",
      width: 70,
      render: (qty) => (
        <span
          className={`text-[12px] tabular-nums font-bold ${qty > 0 ? "text-green-600" : qty < 0 ? "text-red-600" : "text-slate-700"}`}
        >
          {formatQty(qty)}
        </span>
      ),
    },
    {
      title: <HeaderText text="Buy Avg" />,
      align: "right",
      width: 90,
      render: (_, row) => (
        <span className="text-[12px] tabular-nums text-slate-600">
          {formatCurrency(getAvgBuyPrice(row))}
        </span>
      ),
    },
    {
      title: <HeaderText text="Sell Avg" />,
      align: "right",
      width: 90,
      render: (_, row) => (
        <span className="text-[12px] tabular-nums text-slate-600">
          {formatCurrency(getAvgSellPrice(row))}
        </span>
      ),
    },
    {
      title: <HeaderText text="LTP" />,
      align: "right",
      dataIndex: "ltp",
      width: 90,
      render: (ltp) => (
        <span className="text-[12px] tabular-nums font-bold text-slate-900 block bg-slate-100 rounded px-1 py-0.5">
          {formatCurrency(ltp)}
        </span>
      ),
    },
    {
      title: <HeaderText text="Cur. Val" />,
      align: "right",
      width: 100,
      render: (_, row) => {
        const curVal = getCurrentValue(row);
        return (
          <span
            className={`text-[12px] font-bold tabular-nums ${curVal > 0 ? "text-green-600" : curVal < 0 ? "text-red-600" : "text-slate-700"}`}
          >
            {curVal > 0 ? "+" : ""}
            {formatCurrency(curVal)}
          </span>
        );
      },
    },
    {
      title: <HeaderText text="P&L" />,
      align: "right",
      width: 100,
      render: (_, row) => {
        const pnl = getPnl(row);
        return (
          <span
            className={`text-[12px] font-bold tabular-nums ${pnl >= 0 ? "text-green-600" : "text-red-600"}`}
          >
            {pnl > 0 ? "+" : ""}
            {formatCurrency(pnl)}
          </span>
        );
      },
    },
    {
      title: <HeaderText text="Net %" />,
      align: "right",
      width: 80,
      render: (_, row) => {
        const percent = getNetChangePercent(row);
        return (
          <span
            className={`text-[12px] font-bold tabular-nums ${percent >= 0 ? "text-green-600" : "text-red-600"}`}
          >
            {percent > 0 ? "+" : ""}
            {formatCurrency(percent)}%
          </span>
        );
      },
    },
    {
      title: <HeaderText text="Day %" />,
      align: "right",
      width: 80,
      render: (_, row) => {
        const day = getDayChangePercent(row);
        return (
          <span
            className={`text-[11px] font-bold tabular-nums ${day >= 0 ? "text-green-600" : "text-red-600"}`}
          >
            {day > 0 ? "+" : ""}
            {formatCurrency(day)}%
          </span>
        );
      },
    },
  ];

  if (loading) return <Loader />;

  return (
    <div className="px-2 py-2 bg-slate-50 min-h-screen">
      <style>
        {`
          /* Aggressive Compaction Overrides */
          .ultra-compact-table .ant-table {
            background: white !important;
            border-bottom: 1px solid #e2e8f0;
          }

          .ultra-compact-table .ant-table-thead > tr > th {
            background: #ffffff !important;
            color: #64748b !important;
            padding: 4px 6px !important; /* Extremely tight headers */
            border-bottom: 2px solid #f1f5f9 !important;
          }

          .ultra-compact-table .ant-table-tbody > tr > td {
            padding: 3px 6px !important; /* Extremely tight rows */
            line-height: 1.2 !important;
            border-bottom: 1px solid #f8fafc !important;
          }

          .ultra-compact-table .ant-table-tbody > tr:hover > td {
            background: #f1f5f9 !important;
          }

          .ultra-compact-table .ant-table-summary > tr > td {
            padding: 4px 6px !important;
            background: #f8fafc !important;
            border-top: 1px solid #e2e8f0 !important;
          }

          .ant-card.compact-card {
            border-radius: 6px !important;
            border: 1px solid #cbd5e1 !important;
          }
          
          .ant-card.compact-card > .ant-card-head {
            min-height: 32px !important;
            padding: 0 10px !important;
            border-bottom: 1px solid #e2e8f0 !important;
            background: #f8fafc !important;
          }

          .ant-card.compact-card > .ant-card-head .ant-card-head-title {
            padding: 6px 0 !important;
          }

          .ant-card.compact-card > .ant-card-body {
            padding: 4px !important; /* Near zero padding inside card */
          }
        `}
      </style>

      {Object.entries(data).map(([mainKey, rows]) => {
        const innerGroups: Record<string, PositionRow[]> = {};

        rows.forEach((row) => {
          const subKey =
            mode === "client"
              ? row.strategy_name
              : row.client_name || "General";
          if (!innerGroups[subKey]) innerGroups[subKey] = [];
          innerGroups[subKey].push(row);
        });

        return (
          <Card
            key={mainKey}
            size="small"
            className="mb-3 shadow-sm compact-card"
            title={
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-3 bg-blue-600 rounded-sm" />
                <span className="text-[12px] font-bold text-slate-800 uppercase tracking-wide">
                  {mode === "client" ? "CLI:" : "STG:"} {mainKey}
                </span>
              </div>
            }
          >
            {Object.entries(innerGroups).map(([subTitle, subRows]) => (
              <CollapsibleTableGroup
                key={subTitle}
                subTitle={subTitle}
                rows={subRows}
                mode={mode}
                columns={columns}
              />
            ))}
          </Card>
        );
      })}
    </div>
  );
};

export default Positions;
