// // import { useSearchParams } from "react-router-dom";
// // import { useEffect, useState } from "react";
// // import { Card, Table, Spin, Typography } from "antd";
// // import type { ColumnsType } from "antd/es/table";
// // import { getPositionApi } from "../services/positionApi";

// // const { Text } = Typography;

// // interface PositionRow {
// //   id: number;
// //   strategy_id: number;
// //   strategy_name: string;
// //   DisplayName: string;
// //   client_name?: string; // Included for strategy-mode grouping
// //   last_trade_price: number;
// //   sell_value: number;
// //   quantity: number;
// //   ltp: number;
// //   buy_value: number;
// //   PercentChange?: number;
// // }

// // const Positions = () => {
// //   const [searchParams] = useSearchParams();
// //   const mode = searchParams.get("mode") || "client";

// //   const [data, setData] = useState<Record<string, PositionRow[]>>({});
// //   const [loading, setLoading] = useState(false);

// //   // ==========================================
// //   // Fetch Data
// //   // ==========================================
// //   useEffect(() => {
// //     loadData(mode);
// //   }, [mode]);

// //   const loadData = async (currentMode: string) => {
// //     try {
// //       setLoading(true);
// //       const res = await getPositionApi({
// //         position_by: currentMode as "client" | "strategy",
// //       });
// //       setData(res.data?.result || {});
// //     } catch (error) {
// //       console.error("Error fetching positions:", error);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   // ==========================================
// //   // Table Columns (Logic kept exactly as original)
// //   // ==========================================
// //   const columns: ColumnsType<PositionRow> = [
// //     {
// //       title: "Instrument",
// //       dataIndex: "DisplayName",
// //     },
// //     {
// //       title: mode === "client" ? "Strategy Name" : "Client Name",
// //       render: (_, row) =>
// //         mode === "client" ? row.strategy_name : row.client_name || "-",
// //     },
// //     {
// //       title: "Qty",
// //       dataIndex: "quantity",
// //     },
// //     {
// //       title: "Buy Price",
// //       render: (_, row) =>
// //         row.quantity !== 0 ? (row.buy_value / row.quantity).toFixed(2) : "0.00",
// //     },
// //     {
// //       title: "Sell Price",
// //       render: (_, row) =>
// //         row.quantity !== 0 && row.sell_value
// //           ? (row.sell_value / row.quantity).toFixed(2)
// //           : "0.00",
// //     },
// //     {
// //       title: "LTP",
// //       dataIndex: "ltp",
// //     },
// //     {
// //       title: "Cur. Val",
// //       render: (_, row) => (row.ltp * row.quantity).toFixed(2),
// //     },
// //     {
// //       title: "P&L",
// //       render: (_, row) => {
// //         const pnl = row.ltp * row.quantity - row.buy_value;
// //         return (
// //           <span style={{ color: pnl >= 0 ? "green" : "red" }}>
// //             {pnl.toFixed(2)}
// //           </span>
// //         );
// //       },
// //     },
// //     {
// //       title: "Net chg.",
// //       render: (_, row) => {
// //         const pnl = row.ltp * row.quantity - row.buy_value;
// //         const percent =
// //           row.buy_value !== 0
// //             ? ((pnl / row.buy_value) * 100).toFixed(2)
// //             : "0.00";

// //         return (
// //           <span style={{ color: Number(percent) >= 0 ? "green" : "red" }}>
// //             {percent} %
// //           </span>
// //         );
// //       },
// //     },
// //     {
// //       title: "Day chg.",
// //       render: (_, row) => {
// //         const day = row.PercentChange || 0;
// //         return (
// //           <span style={{ color: day >= 0 ? "green" : "red" }}>
// //             {day.toFixed(2)} %
// //           </span>
// //         );
// //       },
// //     },
// //   ];

// //   // ==========================================
// //   // Unified Table Renderer with Calculations
// //   // ==========================================
// //   const renderTable = (subTitle: string, rows: PositionRow[]) => {
// //     let totalPnl = 0;
// //     let totalCurVal = 0;
// //     let totalBuyVal = 0;

// //     rows.forEach((row) => {
// //       const pnl = row.ltp * row.quantity - row.buy_value;
// //       totalPnl += pnl;
// //       totalCurVal += row.ltp * row.quantity;
// //       totalBuyVal += row.buy_value;
// //     });

// //     const totalNet =
// //       totalBuyVal !== 0 ? ((totalPnl / totalBuyVal) * 100).toFixed(2) : "0.00";

// //     return (
// //       <div key={subTitle} className="mb-8 last:mb-0">
// //         <div className="bg-gray-50 p-2 border-l-4 border-blue-500 mb-3">
// //           <Text strong className="text-gray-600">
// //             {mode === "client"
// //               ? `Strategy: ${subTitle}`
// //               : `Client: ${subTitle}`}
// //           </Text>
// //         </div>
// //         <Table
// //           rowKey="id"
// //           columns={columns}
// //           dataSource={rows}
// //           pagination={false}
// //           size="small"
// //           bordered
// //           summary={() => (
// //             <Table.Summary.Row className="bg-gray-50 font-bold">
// //               <Table.Summary.Cell index={0} colSpan={6}>
// //                 Total
// //               </Table.Summary.Cell>
// //               <Table.Summary.Cell index={6}>
// //                 {totalCurVal.toFixed(2)}
// //               </Table.Summary.Cell>
// //               <Table.Summary.Cell index={7}>
// //                 <span style={{ color: totalPnl >= 0 ? "green" : "red" }}>
// //                   {totalPnl.toFixed(2)}
// //                 </span>
// //               </Table.Summary.Cell>
// //               <Table.Summary.Cell index={8}>
// //                 <span
// //                   style={{ color: Number(totalNet) >= 0 ? "green" : "red" }}
// //                 >
// //                   {totalNet} %
// //                 </span>
// //               </Table.Summary.Cell>
// //               <Table.Summary.Cell index={9}></Table.Summary.Cell>
// //             </Table.Summary.Row>
// //           )}
// //         />
// //       </div>
// //     );
// //   };

// //   // ==========================================
// //   // Main Render
// //   // ==========================================
// //   if (loading) {
// //     return (
// //       <div className="flex justify-center items-center h-screen">
// //         <Spin size="large" tip="Loading Positions..." />
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="p-6 bg-gray-100 min-h-screen">
// //       {Object.entries(data).map(([mainKey, rows]) => {
// //         // Grouping logic for the inner tables
// //         const innerGroups: Record<string, PositionRow[]> = {};

// //         rows.forEach((row) => {
// //           // If mode is client, group by strategy name inside.
// //           // If mode is strategy, group by client name inside.
// //           const subKey =
// //             mode === "client"
// //               ? row.strategy_name
// //               : row.client_name || "General";

// //           if (!innerGroups[subKey]) {
// //             innerGroups[subKey] = [];
// //           }
// //           innerGroups[subKey].push(row);
// //         });

// //         return (
// //           <Card
// //             key={mainKey}
// //             className="mb-8 shadow-md border-none rounded-lg overflow-hidden"
// //             title={
// //               <div className="flex items-center">
// //                 <div className="w-1.5 h-5 bg-blue-600 mr-2 rounded" />
// //                 <span className="text-lg font-bold">
// //                   {mode === "client" ? "Client: " : "Strategy: "} {mainKey}
// //                 </span>
// //               </div>
// //             }
// //           >
// //             {Object.entries(innerGroups).map(([subTitle, subRows]) =>
// //               renderTable(subTitle, subRows),
// //             )}
// //           </Card>
// //         );
// //       })}
// //     </div>
// //   );
// // };

// // export default Positions;

// import { useSearchParams } from "react-router-dom";
// import { useEffect, useState } from "react";
// import { Card, Table, Spin, Typography } from "antd";
// import { DownOutlined, UpOutlined } from "@ant-design/icons";
// import type { ColumnsType } from "antd/es/table";
// import { getPositionApi } from "../services/positionApi";

// const { Text } = Typography;

// export interface PositionRow {
//   id: number;
//   strategy_id: number;
//   strategy_name: string;
//   DisplayName: string;
//   client_name?: string; // Included for strategy-mode grouping
//   last_trade_price: number;
//   sell_value: number;
//   quantity: number;
//   ltp: number;
//   buy_value: number;
//   PercentChange?: number;
// }

// // ==========================================
// // Sub-component for Collapsible Table
// // Defined outside so it doesn't lose state on parent re-renders
// // ==========================================
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
//   const [isOpen, setIsOpen] = useState(true); // Tables open by default

//   let totalPnl = 0;
//   let totalCurVal = 0;
//   let totalBuyVal = 0;

//   rows.forEach((row) => {
//     const pnl = row.ltp * row.quantity - row.buy_value;
//     totalPnl += pnl;
//     totalCurVal += row.ltp * row.quantity;
//     totalBuyVal += row.buy_value;
//   });

//   const totalNet =
//     totalBuyVal !== 0 ? ((totalPnl / totalBuyVal) * 100).toFixed(2) : "0.00";

//   return (
//     <div className="mb-8 last:mb-0">
//       {/* Clickable Header */}
//       <div
//         className="bg-gray-50 p-2 border-l-4 border-blue-500 mb-3 flex justify-between items-center cursor-pointer hover:bg-gray-100 transition-colors rounded-r-md"
//         onClick={() => setIsOpen(!isOpen)}
//       >
//         <Text strong className="text-gray-600">
//           {mode === "client" ? `Strategy: ${subTitle}` : `Client: ${subTitle}`}
//         </Text>
//         <div className="text-gray-500 mr-2">
//           {isOpen ? <UpOutlined /> : <DownOutlined />}
//         </div>
//       </div>

//       {/* Table Content - Conditionally Rendered */}
//       {isOpen && (
//         <div className="animate-fade-in">
//           <Table
//             rowKey="id"
//             columns={columns}
//             dataSource={rows}
//             pagination={false}
//             size="small"
//             bordered
//             summary={() => (
//               <Table.Summary.Row className="bg-gray-50 font-bold">
//                 <Table.Summary.Cell index={0} colSpan={6}>
//                   Total
//                 </Table.Summary.Cell>
//                 <Table.Summary.Cell index={6}>
//                   {totalCurVal.toFixed(2)}
//                 </Table.Summary.Cell>
//                 <Table.Summary.Cell index={7}>
//                   <span style={{ color: totalPnl >= 0 ? "green" : "red" }}>
//                     {totalPnl.toFixed(2)}
//                   </span>
//                 </Table.Summary.Cell>
//                 <Table.Summary.Cell index={8}>
//                   <span
//                     style={{ color: Number(totalNet) >= 0 ? "green" : "red" }}
//                   >
//                     {totalNet} %
//                   </span>
//                 </Table.Summary.Cell>
//                 <Table.Summary.Cell index={9}></Table.Summary.Cell>
//               </Table.Summary.Row>
//             )}
//           />
//         </div>
//       )}
//     </div>
//   );
// };

// const Positions = () => {
//   const [searchParams] = useSearchParams();
//   const mode = searchParams.get("mode") || "client";

//   const [data, setData] = useState<Record<string, PositionRow[]>>({});
//   const [loading, setLoading] = useState(false);

//   // ==========================================
//   // Fetch Data
//   // ==========================================
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
//     } catch (error) {
//       console.error("Error fetching positions:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ==========================================
//   // Table Columns
//   // ==========================================
//   const columns: ColumnsType<PositionRow> = [
//     {
//       title: "Instrument",
//       dataIndex: "DisplayName",
//     },
//     {
//       title: mode === "client" ? "Strategy Name" : "Client Name",
//       render: (_, row) =>
//         mode === "client" ? row.strategy_name : row.client_name || "-",
//     },
//     {
//       title: "Qty",
//       dataIndex: "quantity",
//     },
//     {
//       title: "Buy Price",
//       render: (_, row) =>
//         row.quantity !== 0 ? (row.buy_value / row.quantity).toFixed(2) : "0.00",
//     },
//     {
//       title: "Sell Price",
//       render: (_, row) =>
//         row.quantity !== 0 && row.sell_value
//           ? (row.sell_value / row.quantity).toFixed(2)
//           : "0.00",
//     },
//     {
//       title: "LTP",
//       dataIndex: "ltp",
//     },
//     {
//       title: "Cur. Val",
//       render: (_, row) => (row.ltp * row.quantity).toFixed(2),
//     },
//     {
//       title: "P&L",
//       render: (_, row) => {
//         const pnl = row.ltp * row.quantity - row.buy_value;
//         return (
//           <span style={{ color: pnl >= 0 ? "green" : "red" }}>
//             {pnl.toFixed(2)}
//           </span>
//         );
//       },
//     },
//     {
//       title: "Net chg.",
//       render: (_, row) => {
//         const pnl = row.ltp * row.quantity - row.buy_value;
//         const percent =
//           row.buy_value !== 0
//             ? ((pnl / row.buy_value) * 100).toFixed(2)
//             : "0.00";

//         return (
//           <span style={{ color: Number(percent) >= 0 ? "green" : "red" }}>
//             {percent} %
//           </span>
//         );
//       },
//     },
//     {
//       title: "Day chg.",
//       render: (_, row) => {
//         const day = row.PercentChange || 0;
//         return (
//           <span style={{ color: day >= 0 ? "green" : "red" }}>
//             {day.toFixed(2)} %
//           </span>
//         );
//       },
//     },
//   ];

//   // ==========================================
//   // Main Render
//   // ==========================================
//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <Spin size="large" tip="Loading Positions..." />
//       </div>
//     );
//   }

//   return (
//     <div className="p-6 bg-gray-100 min-h-screen">
//       {Object.entries(data).map(([mainKey, rows]) => {
//         // Grouping logic for the inner tables
//         const innerGroups: Record<string, PositionRow[]> = {};

//         rows.forEach((row) => {
//           const subKey =
//             mode === "client"
//               ? row.strategy_name
//               : row.client_name || "General";

//           if (!innerGroups[subKey]) {
//             innerGroups[subKey] = [];
//           }
//           innerGroups[subKey].push(row);
//         });

//         return (
//           <Card
//             key={mainKey}
//             className="mb-8 shadow-md border-none rounded-lg overflow-hidden"
//             title={
//               <div className="flex items-center">
//                 <div className="w-1.5 h-5 bg-blue-600 mr-2 rounded" />
//                 <span className="text-lg font-bold">
//                   {mode === "client" ? "Client: " : "Strategy: "} {mainKey}
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
import { useEffect, useState } from "react";
import { Card, Table, Spin, Typography } from "antd";
import { DownOutlined, UpOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { getPositionApi } from "../services/positionApi";
import Loader from "../components/Loader";

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
}

/* =====================================================
   Collapsible Table Group (Compact)
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

  let totalPnl = 0;
  let totalCurVal = 0;
  let totalBuyVal = 0;

  rows.forEach((row) => {
    const pnl = row.ltp * row.quantity - row.buy_value;
    totalPnl += pnl;
    totalCurVal += row.ltp * row.quantity;
    totalBuyVal += row.buy_value;
  });

  const totalNet =
    totalBuyVal !== 0 ? ((totalPnl / totalBuyVal) * 100).toFixed(2) : "0.00";

  return (
    <div className="mb-4 last:mb-0">
      {/* Header */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gray-50 px-2 py-1 border-l-2 border-blue-500 mb-2 flex justify-between items-center cursor-pointer hover:bg-gray-100 rounded text-xs"
      >
        <Text strong className="text-gray-700 text-xs">
          {mode === "client" ? `Strategy: ${subTitle}` : `Client: ${subTitle}`}
        </Text>

        {isOpen ? <UpOutlined /> : <DownOutlined />}
      </div>

      {isOpen && (
        <Table
          rowKey="id"
          columns={columns}
          dataSource={rows}
          pagination={false}
          bordered
          size="small"
          scroll={{ x: "max-content" }}
          className="compact-trade-table text-xs"
          summary={() => (
            <Table.Summary.Row className="bg-gray-50 font-semibold text-xs">
              <Table.Summary.Cell index={0} colSpan={6}>
                Total
              </Table.Summary.Cell>

              <Table.Summary.Cell index={6} align="right">
                {totalCurVal.toFixed(2)}
              </Table.Summary.Cell>

              <Table.Summary.Cell index={7} align="right">
                <span
                  style={{
                    color: totalPnl >= 0 ? "green" : "red",
                  }}
                >
                  {totalPnl.toFixed(2)}
                </span>
              </Table.Summary.Cell>

              <Table.Summary.Cell index={8} align="right">
                <span
                  style={{
                    color: Number(totalNet) >= 0 ? "green" : "red",
                  }}
                >
                  {totalNet} %
                </span>
              </Table.Summary.Cell>

              <Table.Summary.Cell index={9} />
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

  /* ================= Fetch ================= */

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
    } catch (error) {
      console.error("Error fetching positions:", error);
    } finally {
      setLoading(false);
    }
  };

  /* ================= Columns ================= */

  const columns: ColumnsType<PositionRow> = [
    {
      title: <span className="text-xs">Instrument</span>,
      dataIndex: "DisplayName",
      align: "left",
      render: (text) => (
        <span className="text-xs font-medium text-left">{text}</span>
      ),
    },
    {
      title: (
        <span className="text-xs text-left">
          {mode === "client" ? "Strategy Name" : "Client Name"}
        </span>
      ),
      render: (_, row) => (
        <span className="text-xs text-left">
          {mode === "client" ? row.strategy_name : row.client_name || "-"}
        </span>
      ),
    },
    {
      title: <span className="text-xs text-right">Qty</span>,
      dataIndex: "quantity",
      align: "right",
      render: (qty) => <span className="text-xs">{qty}</span>,
    },
    {
      title: <span className="text-xs">Buy Price</span>,
      align: "right",
      render: (_, row) => (
        <span className="text-xs">
          {row.quantity !== 0
            ? (row.buy_value / row.quantity).toFixed(2)
            : "0.00"}
        </span>
      ),
    },
    {
      title: <span className="text-xs">Sell Price</span>,
      align: "right",
      render: (_, row) => (
        <span className="text-xs">
          {row.quantity !== 0 && row.sell_value
            ? (row.sell_value / row.quantity).toFixed(2)
            : "0.00"}
        </span>
      ),
    },
    {
      title: <span className="text-xs">LTP</span>,
      align: "right",
      dataIndex: "ltp",
      render: (ltp) => <span className="text-xs">{ltp}</span>,
    },
    {
      title: <span className="text-xs">Cur. Val</span>,
      align: "right",
      render: (_, row) => (
        <span className="text-xs">{(row.ltp * row.quantity).toFixed(2)}</span>
      ),
    },
    {
      title: <span className="text-xs">P&L</span>,
      align: "right",
      render: (_, row) => {
        const pnl = row.ltp * row.quantity - row.buy_value;

        return (
          <span
            className={`text-xs font-semibold ${
              pnl >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {pnl.toFixed(2)}
          </span>
        );
      },
    },
    {
      title: <span className="text-xs">Net chg.</span>,
      align: "right",
      render: (_, row) => {
        const pnl = row.ltp * row.quantity - row.buy_value;

        const percent =
          row.buy_value !== 0
            ? ((pnl / row.buy_value) * 100).toFixed(2)
            : "0.00";

        return (
          <span
            className={`text-xs font-semibold text-right ${
              Number(percent) >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {percent} %
          </span>
        );
      },
    },
    {
      title: <span className="text-xs">Day chg.</span>,
      align: "right",
      render: (_, row) => {
        const day = row.PercentChange || 0;

        return (
          <span
            className={`text-xs ${
              day >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {day.toFixed(2)} %
          </span>
        );
      },
    },
  ];

  /* ================= Loading ================= */

  if (loading) {
    return <Loader />;
  }

  /* ================= Render ================= */

  return (
    <div className="px-3 py-2 bg-gray-100 min-h-screen text-[10px]">
      {Object.entries(data).map(([mainKey, rows]) => {
        const innerGroups: Record<string, PositionRow[]> = {};

        rows.forEach((row) => {
          const subKey =
            mode === "client"
              ? row.strategy_name
              : row.client_name || "General";

          if (!innerGroups[subKey]) {
            innerGroups[subKey] = [];
          }

          innerGroups[subKey].push(row);
        });

        return (
          <Card
            key={mainKey}
            size="small"
            className="mb-5 shadow-sm rounded-lg"
            title={
              <div className="flex items-center gap-2 py-1">
                <div className="w-1 h-4 bg-blue-600 rounded" />

                <span className="text-sm font-semibold">
                  {mode === "client" ? "Client:" : "Strategy:"} {mainKey}
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
