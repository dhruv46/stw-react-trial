// import React, { useEffect, useState } from "react";
// import { Table, Select, DatePicker, Typography, Collapse } from "antd";
// import type { ColumnsType } from "antd/es/table";
// import { UserOutlined, ApiOutlined } from "@ant-design/icons";
// import dayjs from "dayjs";
// import { useLocation } from "react-router-dom";
// import Loader from "../components/Loader";

// // Import your actual API services
// import { getStrategyListApi } from "../services/orderService";
// import {
//   getClosedPositionPnl,
//   getUserClientsList,
// } from "../services/closedpositionsApi";

// const { Text } = Typography;
// const { RangePicker } = DatePicker;

// interface TableDataItem {
//   key: string;
//   isGroupHeader?: boolean;
//   strategyName: string;
//   clientName?: string;
//   trade?: string;
//   entryTime?: string;
//   exitTime?: string;
//   entryPrice?: number;
//   exitPrice?: number;
//   qty?: number;
//   buyValue?: number;
//   sellValue?: number;
//   pnl?: number;
// }

// export default function ClosedPositions() {
//   const location = useLocation();
//   const endpoint = location.pathname.split("/")[1];
//   const mode = endpoint.includes("sim") ? "sim" : "live";

//   const today = dayjs();
//   const [dateRange, setDateRange] = useState<
//     [dayjs.Dayjs | null, dayjs.Dayjs | null]
//   >([today, today]);

//   const [clientGroups, setClientGroups] = useState<
//     { clientName: string; data: TableDataItem[] }[]
//   >([]);
//   const [loading, setLoading] = useState(false);
//   const [clients, setClients] = useState<any[]>([]);
//   const [strategies, setStrategies] = useState<any[]>([]);
//   const [selectedClient, setSelectedClient] = useState<number>(0);
//   const [selectedStrategy, setSelectedStrategy] = useState<number>(0);

//   // Fetch Positions
//   const fetchPositions = async () => {
//     try {
//       setLoading(true);

//       const safeStartDate = dateRange?.[0] ? dayjs(dateRange[0]) : dayjs();
//       const safeEndDate = dateRange?.[1] ? dayjs(dateRange[1]) : dayjs();

//       const startDateStr = safeStartDate.format("YYYY-MM-DD"); // Using format suitable for APIs
//       const endDateStr = safeEndDate.format("YYYY-MM-DD");

//       // Pass selectedStrategy and selectedClient to your updated API
//       const res = await getClosedPositionPnl(
//         startDateStr,
//         endDateStr,
//         selectedStrategy,
//         selectedClient,
//       );

//       const apiData = res?.data?.result || [];

//       // 1. Format the raw data
//       const formatted = apiData.map((item: any) => ({
//         key: item.position_id?.toString() || Math.random().toString(),
//         clientName: item.client_name || "-",
//         strategyName: item.strategy_name || "-",
//         trade: item.trade || "-",
//         entryTime: item.entry_time
//           ? dayjs(item.entry_time).format("DD MMM YYYY, HH:mm:ss")
//           : "-",
//         exitTime: item.exit_time
//           ? dayjs(item.exit_time).format("DD MMM YYYY, HH:mm:ss")
//           : "-",
//         entryPrice: item.entry_price || 0,
//         exitPrice: item.exit_price || 0,
//         qty: item.entry_quantity || item.LotSize || 0,
//         buyValue: item.buy_value || 0,
//         sellValue: item.sell_value || 0,
//         pnl: item.pnl || 0,
//       }));

//       // 2. Group the data by Client Name, then Strategy Name
//       const clientMap = new Map<string, Map<string, TableDataItem[]>>();
//       formatted.forEach((item: TableDataItem) => {
//         const cName = item.clientName || "-";
//         if (!clientMap.has(cName)) {
//           clientMap.set(cName, new Map());
//         }
//         const strategyMap = clientMap.get(cName)!;
//         if (!strategyMap.has(item.strategyName)) {
//           strategyMap.set(item.strategyName, []);
//         }
//         strategyMap.get(item.strategyName)!.push(item);
//       });

//       // 3. Rebuild the array inserting Group Headers per Client
//       const finalClientGroups: { clientName: string; data: TableDataItem[] }[] =
//         [];
//       clientMap.forEach((strategyMap, clientName) => {
//         const clientData: TableDataItem[] = [];
//         strategyMap.forEach((items, strategyName) => {
//           // Add the spanning header row for strategy
//           clientData.push({
//             key: `group-${clientName}-${strategyName}`,
//             isGroupHeader: true,
//             strategyName: strategyName,
//           });
//           // Add the actual trades for this strategy
//           clientData.push(...items);
//         });
//         finalClientGroups.push({
//           clientName,
//           data: clientData,
//         });
//       });

//       setClientGroups(finalClientGroups);
//     } catch (error) {
//       console.error("Position Fetch Error", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchPositions();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [dateRange, selectedClient, selectedStrategy, mode]);

//   const fetchClients = async () => {
//     try {
//       const res = await getUserClientsList();
//       const clientData = res?.data?.result || [];
//       setClients(clientData);
//     } catch (error) {
//       console.error("Client Fetch Error", error);
//     }
//   };

//   useEffect(() => {
//     fetchClients();
//   }, []);

//   const fetchStrategies = async () => {
//     try {
//       const res = await getStrategyListApi();
//       const strategyData = res?.data?.result || [];
//       setStrategies(strategyData);
//     } catch (error) {
//       console.error("Strategy Fetch Error", error);
//     }
//   };

//   useEffect(() => {
//     fetchStrategies();
//   }, []);

//   // Total columns = 10. Group headers span all 10. Data rows span 1 each.
//   const columns: ColumnsType<TableDataItem> = [
//     {
//       title: "Trade",
//       dataIndex: "trade",
//       align: "left",
//       width: 250,
//       render: (t, record) => {
//         if (record.isGroupHeader) {
//           return {
//             children: (
//               <span className="text-[13px] font-bold text-slate-900 ml-1">
//                 Strategy: {record.strategyName}
//               </span>
//             ),
//             props: { colSpan: 10 },
//           };
//         }
//         return {
//           children: (
//             <span className="text-[12px] text-slate-700 font-medium">{t}</span>
//           ),
//           props: { colSpan: 1 },
//         };
//       },
//     },
//     {
//       title: "Strategy Name",
//       dataIndex: "strategyName",
//       align: "left",
//       width: 140,
//       render: (v, record) => {
//         if (record.isGroupHeader) return { props: { colSpan: 0 } };
//         return {
//           children: <span className="text-[12px] text-slate-700">{v}</span>,
//           props: { colSpan: 1 },
//         };
//       },
//     },
//     {
//       title: "Entry Time",
//       dataIndex: "entryTime",
//       align: "left",
//       width: 160,
//       render: (t, record) => {
//         if (record.isGroupHeader) return { props: { colSpan: 0 } };
//         return {
//           children: <span className="text-[12px] text-slate-700">{t}</span>,
//           props: { colSpan: 1 },
//         };
//       },
//     },
//     {
//       title: "Exit Time",
//       dataIndex: "exitTime",
//       align: "left",
//       width: 160,
//       render: (t, record) => {
//         if (record.isGroupHeader) return { props: { colSpan: 0 } };
//         return {
//           children: <span className="text-[12px] text-slate-700">{t}</span>,
//           props: { colSpan: 1 },
//         };
//       },
//     },
//     {
//       title: "Entry Price",
//       dataIndex: "entryPrice",
//       align: "right",
//       width: 90,
//       render: (v, record) => {
//         if (record.isGroupHeader) return { props: { colSpan: 0 } };
//         return {
//           children: (
//             <span className="text-[12px] text-slate-700">
//               {(v || 0).toLocaleString("en-IN", {
//                 minimumFractionDigits: 2,
//                 maximumFractionDigits: 2,
//               })}
//             </span>
//           ),
//           props: { colSpan: 1 },
//         };
//       },
//     },
//     {
//       title: "Exit Price",
//       dataIndex: "exitPrice",
//       align: "right",
//       width: 90,
//       render: (v, record) => {
//         if (record.isGroupHeader) return { props: { colSpan: 0 } };
//         return {
//           children: (
//             <span className="text-[12px] text-slate-700">
//               {(v || 0).toLocaleString("en-IN", {
//                 minimumFractionDigits: 2,
//                 maximumFractionDigits: 2,
//               })}
//             </span>
//           ),
//           props: { colSpan: 1 },
//         };
//       },
//     },
//     {
//       title: "Quantity",
//       dataIndex: "qty",
//       align: "right",
//       width: 80,
//       render: (v, record) => {
//         if (record.isGroupHeader) return { props: { colSpan: 0 } };
//         return {
//           children: <span className="text-[12px] text-slate-700">{v}</span>,
//           props: { colSpan: 1 },
//         };
//       },
//     },
//     {
//       title: "Buy Value",
//       dataIndex: "buyValue",
//       align: "right",
//       width: 120,
//       render: (v, record) => {
//         if (record.isGroupHeader) return { props: { colSpan: 0 } };
//         return {
//           children: (
//             <span className="text-[12px] text-slate-700">
//               {(v || 0).toLocaleString("en-IN", {
//                 minimumFractionDigits: 2,
//                 maximumFractionDigits: 2,
//               })}
//             </span>
//           ),
//           props: { colSpan: 1 },
//         };
//       },
//     },
//     {
//       title: "Sell Value",
//       dataIndex: "sellValue",
//       align: "right",
//       width: 120,
//       render: (v, record) => {
//         if (record.isGroupHeader) return { props: { colSpan: 0 } };
//         return {
//           children: (
//             <span className="text-[12px] text-slate-700">
//               {(v || 0).toLocaleString("en-IN", {
//                 minimumFractionDigits: 2,
//                 maximumFractionDigits: 2,
//               })}
//             </span>
//           ),
//           props: { colSpan: 1 },
//         };
//       },
//     },
//     {
//       title: "PNL",
//       dataIndex: "pnl",
//       align: "right",
//       width: 120,
//       render: (v, record) => {
//         if (record.isGroupHeader) return { props: { colSpan: 0 } };
//         const isProfit = v > 0;
//         const isLoss = v < 0;
//         return {
//           children: (
//             <span
//               className={`text-[12px] font-medium ${
//                 isProfit
//                   ? "text-green-600"
//                   : isLoss
//                     ? "text-red-500"
//                     : "text-slate-700"
//               }`}
//             >
//               {(v || 0).toLocaleString("en-IN", {
//                 minimumFractionDigits: 2,
//                 maximumFractionDigits: 2,
//               })}
//             </span>
//           ),
//           props: { colSpan: 1 },
//         };
//       },
//     },
//   ];

//   if (loading && clientGroups.length === 0) {
//     return <Loader />;
//   }

//   return (
//     <div className="bg-slate-50 p-2 sm:p-4 min-h-screen">
//       <div className="bg-white rounded-t-lg border-b px-3 sm:px-4 py-3 shadow-sm border border-slate-200">
//         {/* ================= MOBILE DESIGN ================= */}
//         <div className="flex flex-col gap-3 lg:hidden">
//           <div className="flex items-center justify-between">
//             <span className="text-[16px] font-bold text-slate-800">
//               Closed Positions
//             </span>
//           </div>

//           <div className="space-y-2">
//             <div className="flex flex-col gap-1">
//               <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
//                 Date Range
//               </span>
//               <div className="flex gap-2">
//                 <DatePicker
//                   size="small"
//                   value={dateRange[0]}
//                   onChange={(date) =>
//                     setDateRange(
//                       date ? [dayjs(date), dateRange[1]] : [null, dateRange[1]],
//                     )
//                   }
//                   style={{ width: "100%" }}
//                   placeholder="Start Date"
//                   format="DD MMM YYYY"
//                   allowClear={false}
//                 />
//                 <DatePicker
//                   size="small"
//                   value={dateRange[1]}
//                   onChange={(date) =>
//                     setDateRange(
//                       date ? [dateRange[0], dayjs(date)] : [dateRange[0], null],
//                     )
//                   }
//                   style={{ width: "100%" }}
//                   placeholder="End Date"
//                   format="DD MMM YYYY"
//                   allowClear={false}
//                 />
//               </div>
//             </div>

//             <div className="flex gap-2 pt-1">
//               <Select
//                 size="small"
//                 value={selectedClient}
//                 className="flex-1"
//                 onChange={(value) => setSelectedClient(value)}
//                 options={[
//                   { label: "All Clients", value: 0 },
//                   ...clients.map((c: any) => ({
//                     label: c.client_name,
//                     value: c.client_id,
//                   })),
//                 ]}
//                 suffixIcon={<UserOutlined className="text-[11px]" />}
//               />

//               <Select
//                 size="small"
//                 value={selectedStrategy}
//                 className="flex-1"
//                 onChange={(value) => setSelectedStrategy(value)}
//                 options={[
//                   { label: "All Strategies", value: 0 },
//                   ...strategies.map((s: any) => ({
//                     label: s.name,
//                     value: s.id,
//                   })),
//                 ]}
//                 suffixIcon={<ApiOutlined className="text-[11px]" />}
//               />
//             </div>
//           </div>
//         </div>

//         {/* ================= DESKTOP DESIGN ================= */}
//         <div className="hidden lg:flex lg:items-center lg:justify-between gap-4">
//           <div className="flex items-center gap-4 shrink-0">
//             <span className="text-[18px] font-bold text-slate-800">
//               Closed Positions
//             </span>
//             <div className="h-5 w-px bg-slate-200" />
//           </div>

//           <div className="flex items-center gap-3 w-full justify-end">
//             <div className="w-[240px]">
//               <RangePicker
//                 size="small"
//                 value={dateRange}
//                 onChange={(dates) =>
//                   setDateRange(
//                     (dates as [dayjs.Dayjs, dayjs.Dayjs]) ?? [today, today],
//                   )
//                 }
//                 style={{ width: "100%" }}
//                 format="DD MMM YYYY"
//                 allowClear={false}
//               />
//             </div>

//             <div className="w-[180px]">
//               <Select
//                 size="small"
//                 value={selectedClient}
//                 style={{ width: "100%" }}
//                 onChange={(value) => setSelectedClient(value)}
//                 options={[
//                   { label: "All Clients", value: 0 },
//                   ...clients.map((c: any) => ({
//                     label: c.client_name,
//                     value: c.client_id,
//                   })),
//                 ]}
//                 suffixIcon={<UserOutlined className="text-[11px]" />}
//               />
//             </div>

//             <div className="w-[180px]">
//               <Select
//                 size="small"
//                 value={selectedStrategy}
//                 style={{ width: "100%" }}
//                 onChange={(value) => setSelectedStrategy(value)}
//                 options={[
//                   { label: "All Strategies", value: 0 },
//                   ...strategies.map((s: any) => ({
//                     label: s.name,
//                     value: s.id,
//                   })),
//                 ]}
//                 suffixIcon={<ApiOutlined className="text-[11px]" />}
//               />
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* ===== COMPACT TABLES WITHIN COLLAPSE ===== */}
//       <div className="bg-transparent pt-4 pb-4">
//         {clientGroups.length === 0 && !loading ? (
//           <div className="bg-white rounded-lg border border-slate-200 p-8 flex flex-col items-center justify-center text-slate-500">
//             No closed positions found for the selected criteria.
//           </div>
//         ) : (
//           <Collapse
//             defaultActiveKey={clientGroups.map((g) => g.clientName)}
//             expandIconPosition="end"
//             className="client-collapse flex flex-col gap-4"
//             ghost
//           >
//             {clientGroups.map((group) => (
//               <Collapse.Panel
//                 key={group.clientName}
//                 header={
//                   <span className="font-semibold text-[14px] text-slate-800">
//                     Position | {group.clientName}
//                   </span>
//                 }
//                 className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm !mb-0"
//               >
//                 <div className="overflow-x-auto">
//                   <Table
//                     className="order-table custom-compact-table"
//                     columns={columns}
//                     dataSource={group.data}
//                     loading={loading}
//                     size="small"
//                     rowKey="key"
//                     tableLayout="fixed"
//                     pagination={{
//                       position: ["bottomRight"] as const,
//                       hideOnSinglePage: true,
//                       pageSize: 50,
//                       showSizeChanger: true,
//                       pageSizeOptions: ["20", "50", "100", "250"],
//                       className: "custom-pagination",
//                     }}
//                     scroll={{
//                       x: 1330,
//                     }}
//                     rowClassName={(record, index) => {
//                       if (group.data.length === 0 && index === 0)
//                         return "h-0 opacity-0 invisible";
//                       if (record.isGroupHeader) return "group-header-row";
//                       return "data-row";
//                     }}
//                   />
//                 </div>
//               </Collapse.Panel>
//             ))}
//           </Collapse>
//         )}
//       </div>

//       {/* STYLE FOR COMPACT TABLE & COLLAPSE */}
//       <style>
//         {`
//         .custom-compact-table .ant-table {
//           font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
//         }

//         /* Table Header Styling */
//         .custom-compact-table .ant-table-thead > tr > th {
//           background-color: #ffffff !important;
//           color: #1e293b !important;
//           font-weight: 700 !important;
//           font-size: 12px;
//           border-bottom: 2px solid #e2e8f0 !important;
//           padding: 8px 10px !important;
//         }

//         .custom-compact-table .ant-table-thead > tr > th::before {
//           display: none !important;
//         }

//         /* COLLAPSE STYLING */
//         .client-collapse > .ant-collapse-item > .ant-collapse-header {
//           background-color: #f8fafc !important;
//           padding: 12px 16px !important;
//           align-items: center;
//           border-bottom: 1px solid #e2e8f0;
//         }
//         .client-collapse .ant-collapse-content {
//           border-top: none;
//         }
//         .client-collapse .ant-collapse-content > .ant-collapse-content-box {
//           padding: 0 !important;
//         }

//         /* DATA ROW CELLS */
//         .custom-compact-table .ant-table-tbody > tr.data-row > td {
//           padding: 4px 10px !important;
//           border-bottom: 1px solid #f1f5f9 !important;
//           vertical-align: middle;
//         }

//         .custom-compact-table .ant-table-tbody > tr.data-row:hover > td {
//           background-color: #f8fafc !important;
//         }

//         /* GROUP HEADER ROW STYLING */
//         .group-header-row > td {
//           background-color: #ffffff !important;
//           padding: 6px 10px 4px 10px !important;
//           border-bottom: 1px solid #e2e8f0 !important;
//           border-top: 1px solid #e2e8f0 !important;
//         }
//         /* Remove top border for the very first group header */
//         .custom-compact-table .ant-table-tbody > tr:first-child > td {
//            border-top: none !important;
//         }
//         .group-header-row:hover > td {
//           background-color: #ffffff !important;
//         }

//         .custom-compact-table .ant-table-header {
//           overflow: hidden !important;
//         }

//         /* Scrollbar */
//         .custom-compact-table .ant-table-body::-webkit-scrollbar {
//           width: 6px;
//           height: 6px;
//         }
//         .custom-compact-table .ant-table-body::-webkit-scrollbar-track {
//           background: transparent;
//         }
//         .custom-compact-table .ant-table-body::-webkit-scrollbar-thumb {
//           background: #cbd5e1;
//           border-radius: 10px;
//         }
//         .custom-compact-table .ant-table-body::-webkit-scrollbar-thumb:hover {
//           background: #94a3b8;
//         }

//         /* Pagination Setup */
//         .custom-pagination {
//           padding: 8px 16px;
//           margin: 0 !important;
//           border-top: 1px solid #e2e8f0;
//           background: #ffffff;
//           display: flex;
//           align-items: center;
//         }
//         .custom-compact-table .ant-pagination-total-text {
//           margin-right: auto !important;
//           color: #64748b;
//           font-size: 12px;
//           font-weight: 600;
//         }
//         `}
//       </style>
//     </div>
//   );
// }

import React, { useEffect, useState } from "react";
import { Table, Select, DatePicker, Typography, Collapse } from "antd";
import type { ColumnsType } from "antd/es/table";
import { UserOutlined, ApiOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useLocation } from "react-router-dom";
import Loader from "../components/Loader";

// Import your actual API services
import { getStrategyListApi } from "../services/orderService";
import {
  getClosedPositionPnl,
  getUserClientsList,
} from "../services/closedpositionsApi";

const { RangePicker } = DatePicker;

interface TableDataItem {
  key: string;
  isGroupHeader?: boolean;
  strategyName: string;
  clientName?: string;
  trade?: string;
  entryTime?: string;
  exitTime?: string;
  entryPrice?: number;
  exitPrice?: number;
  qty?: number;
  buyValue?: number;
  sellValue?: number;
  currentValue?: number; // Added new property
  pnl?: number;
}

export default function ClosedPositions() {
  const location = useLocation();
  const endpoint = location.pathname.split("/")[1];
  const mode = endpoint.includes("sim") ? "sim" : "live";

  const today = dayjs();
  const [dateRange, setDateRange] = useState<
    [dayjs.Dayjs | null, dayjs.Dayjs | null]
  >([today, today]);

  const [clientGroups, setClientGroups] = useState<
    { clientName: string; data: TableDataItem[] }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [strategies, setStrategies] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<number>(0);
  const [selectedStrategy, setSelectedStrategy] = useState<number>(0);

  // Fetch Positions
  const fetchPositions = async () => {
    try {
      setLoading(true);

      const safeStartDate = dateRange?.[0] ? dayjs(dateRange[0]) : dayjs();
      const safeEndDate = dateRange?.[1] ? dayjs(dateRange[1]) : dayjs();

      const startDateStr = safeStartDate.format("YYYY-MM-DD");
      const endDateStr = safeEndDate.format("YYYY-MM-DD");

      const res = await getClosedPositionPnl(
        startDateStr,
        endDateStr,
        selectedStrategy,
        selectedClient,
      );

      const apiData = res?.data?.result || [];

      // 1. Format the raw data
      const formatted = apiData.map((item: any) => ({
        key: item.position_id?.toString() || Math.random().toString(),
        clientName: item.client_name || "-",
        strategyName: item.strategy_name || "-",
        trade: item.trade || "-",
        entryTime: item.entry_time
          ? dayjs(item.entry_time).format("DD MMM YYYY, HH:mm:ss")
          : "-",
        exitTime: item.exit_time
          ? dayjs(item.exit_time).format("DD MMM YYYY, HH:mm:ss")
          : "-",
        entryPrice: item.entry_price || 0,
        exitPrice: item.exit_price || 0,
        qty: item.entry_quantity || item.LotSize || 0,
        buyValue: item.buy_value || 0,
        sellValue: item.sell_value || 0,
        currentValue: item.current_value || item.CurrentValue || 0, // Map current value
        pnl: item.pnl || 0,
      }));

      // 2. Group the data by Client Name, then Strategy Name
      const clientMap = new Map<string, Map<string, TableDataItem[]>>();
      formatted.forEach((item: TableDataItem) => {
        const cName = item.clientName || "-";
        if (!clientMap.has(cName)) {
          clientMap.set(cName, new Map());
        }
        const strategyMap = clientMap.get(cName)!;
        if (!strategyMap.has(item.strategyName)) {
          strategyMap.set(item.strategyName, []);
        }
        strategyMap.get(item.strategyName)!.push(item);
      });

      // 3. Rebuild the array inserting Group Headers per Client
      const finalClientGroups: { clientName: string; data: TableDataItem[] }[] =
        [];
      clientMap.forEach((strategyMap, clientName) => {
        const clientData: TableDataItem[] = [];
        strategyMap.forEach((items, strategyName) => {
          clientData.push({
            key: `group-${clientName}-${strategyName}`,
            isGroupHeader: true,
            strategyName: strategyName,
          });
          clientData.push(...items);
        });
        finalClientGroups.push({
          clientName,
          data: clientData,
        });
      });

      setClientGroups(finalClientGroups);
    } catch (error) {
      console.error("Position Fetch Error", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPositions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange, selectedClient, selectedStrategy, mode]);

  const fetchClients = async () => {
    try {
      const res = await getUserClientsList();
      const clientData = res?.data?.result || [];
      setClients(clientData);
    } catch (error) {
      console.error("Client Fetch Error", error);
    }
  };

  const fetchStrategies = async () => {
    try {
      const res = await getStrategyListApi();
      const strategyData = res?.data?.result || [];
      setStrategies(strategyData);
    } catch (error) {
      console.error("Strategy Fetch Error", error);
    }
  };

  useEffect(() => {
    fetchClients();
    fetchStrategies();
  }, []);

  // Format Helper
  const formatNum = (num: number) =>
    (num || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  // Total columns = 11. Group headers span all 11.
  const columns: ColumnsType<TableDataItem> = [
    {
      title: "Trade",
      dataIndex: "trade",
      align: "left",
      width: 220,
      render: (t, record) => {
        if (record.isGroupHeader) {
          return {
            children: (
              <span className="text-[12px] font-bold text-slate-800 ml-1">
                Strategy: {record.strategyName}
              </span>
            ),
            props: { colSpan: 11 }, // Updated to 11 to account for new column
          };
        }
        return {
          children: (
            <span className="text-[12px] text-slate-700 font-medium">{t}</span>
          ),
          props: { colSpan: 1 },
        };
      },
    },
    {
      title: "Strategy",
      dataIndex: "strategyName",
      align: "left",
      width: 120,
      render: (v, record) =>
        record.isGroupHeader
          ? { props: { colSpan: 0 } }
          : {
              children: <span className="text-[12px] text-slate-700">{v}</span>,
            },
    },
    {
      title: "Entry Time",
      dataIndex: "entryTime",
      align: "left",
      width: 140,
      render: (t, record) =>
        record.isGroupHeader
          ? { props: { colSpan: 0 } }
          : {
              children: <span className="text-[11px] text-slate-600">{t}</span>,
            },
    },
    {
      title: "Exit Time",
      dataIndex: "exitTime",
      align: "left",
      width: 140,
      render: (t, record) =>
        record.isGroupHeader
          ? { props: { colSpan: 0 } }
          : {
              children: <span className="text-[11px] text-slate-600">{t}</span>,
            },
    },
    {
      title: "Entry Price",
      dataIndex: "entryPrice",
      align: "right",
      width: 90,
      render: (v, record) =>
        record.isGroupHeader
          ? { props: { colSpan: 0 } }
          : {
              children: (
                <span className="text-[12px] text-slate-700">
                  {formatNum(v)}
                </span>
              ),
            },
    },
    {
      title: "Exit Price",
      dataIndex: "exitPrice",
      align: "right",
      width: 90,
      render: (v, record) =>
        record.isGroupHeader
          ? { props: { colSpan: 0 } }
          : {
              children: (
                <span className="text-[12px] text-slate-700">
                  {formatNum(v)}
                </span>
              ),
            },
    },
    {
      title: "Qty",
      dataIndex: "qty",
      align: "right",
      width: 70,
      render: (v, record) =>
        record.isGroupHeader
          ? { props: { colSpan: 0 } }
          : {
              children: <span className="text-[12px] text-slate-700">{v}</span>,
            },
    },
    {
      title: "Buy Value",
      dataIndex: "buyValue",
      align: "right",
      width: 100,
      render: (v, record) =>
        record.isGroupHeader
          ? { props: { colSpan: 0 } }
          : {
              children: (
                <span className="text-[12px] text-slate-700">
                  {formatNum(v)}
                </span>
              ),
            },
    },
    {
      title: "Sell Value",
      dataIndex: "sellValue",
      align: "right",
      width: 100,
      render: (v, record) =>
        record.isGroupHeader
          ? { props: { colSpan: 0 } }
          : {
              children: (
                <span className="text-[12px] text-slate-700">
                  {formatNum(v)}
                </span>
              ),
            },
    },
    {
      title: "Current Value",
      dataIndex: "sellValue",
      align: "right",
      width: 100,
      render: (v, record) =>
        record.isGroupHeader
          ? { props: { colSpan: 0 } }
          : {
              children: (
                <span className="text-[12px] text-slate-700">
                  {formatNum(v)}
                </span>
              ),
            },
    },
    {
      title: "PNL",
      dataIndex: "pnl",
      align: "right",
      width: 100,
      render: (v, record) => {
        if (record.isGroupHeader) return { props: { colSpan: 0 } };
        return {
          children: (
            <span
              className={`text-[12px] font-semibold ${v > 0 ? "text-emerald-600" : v < 0 ? "text-rose-600" : "text-slate-700"}`}
            >
              {formatNum(v)}
            </span>
          ),
          props: { colSpan: 1 },
        };
      },
    },
  ];

  if (loading && clientGroups.length === 0) return <Loader />;

  return (
    <div className="bg-slate-50 p-2 sm:p-3 min-h-screen w-full overflow-hidden">
      <div className="bg-white rounded-lg border px-3 py-2 shadow-sm border-slate-200">
        {/* ================= MOBILE CONTROLS ================= */}
        <div className="flex flex-col gap-2 lg:hidden">
          <span className="text-[15px] font-bold text-slate-800">
            Closed Positions
          </span>
          <div className="flex gap-2">
            <DatePicker
              size="small"
              value={dateRange[0]}
              onChange={(date) =>
                setDateRange(
                  date ? [dayjs(date), dateRange[1]] : [null, dateRange[1]],
                )
              }
              className="w-full text-[12px]"
              placeholder="Start"
              format="DD MMM YY"
              allowClear={false}
            />
            <DatePicker
              size="small"
              value={dateRange[1]}
              onChange={(date) =>
                setDateRange(
                  date ? [dateRange[0], dayjs(date)] : [dateRange[0], null],
                )
              }
              className="w-full text-[12px]"
              placeholder="End"
              format="DD MMM YY"
              allowClear={false}
            />
          </div>
          <div className="flex gap-2">
            <Select
              size="small"
              value={selectedClient}
              className="flex-1 text-[12px]"
              onChange={(value) => setSelectedClient(value)}
              options={[
                { label: "All Clients", value: 0 },
                ...clients.map((c: any) => ({
                  label: c.client_name,
                  value: c.client_id,
                })),
              ]}
              suffixIcon={<UserOutlined className="text-[10px]" />}
            />
            <Select
              size="small"
              value={selectedStrategy}
              className="flex-1 text-[12px]"
              onChange={(value) => setSelectedStrategy(value)}
              options={[
                { label: "All Strategies", value: 0 },
                ...strategies.map((s: any) => ({ label: s.name, value: s.id })),
              ]}
              suffixIcon={<ApiOutlined className="text-[10px]" />}
            />
          </div>
        </div>

        {/* ================= DESKTOP CONTROLS ================= */}
        <div className="hidden lg:flex lg:items-center lg:justify-between gap-3">
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-[16px] font-bold text-slate-800">
              Closed Positions
            </span>
            <div className="h-4 w-px bg-slate-300" />
          </div>

          <div className="flex items-center gap-2 w-full justify-end">
            <div className="w-[220px]">
              <RangePicker
                size="small"
                value={dateRange}
                onChange={(dates) =>
                  setDateRange(
                    (dates as [dayjs.Dayjs, dayjs.Dayjs]) ?? [today, today],
                  )
                }
                className="w-full text-[12px]"
                format="DD MMM YYYY"
                allowClear={false}
              />
            </div>
            <div className="w-[160px]">
              <Select
                size="small"
                value={selectedClient}
                className="w-full text-[12px]"
                onChange={(value) => setSelectedClient(value)}
                options={[
                  { label: "All Clients", value: 0 },
                  ...clients.map((c: any) => ({
                    label: c.client_name,
                    value: c.client_id,
                  })),
                ]}
                suffixIcon={<UserOutlined className="text-[10px]" />}
              />
            </div>
            <div className="w-[160px]">
              <Select
                size="small"
                value={selectedStrategy}
                className="w-full text-[12px]"
                onChange={(value) => setSelectedStrategy(value)}
                options={[
                  { label: "All Strategies", value: 0 },
                  ...strategies.map((s: any) => ({
                    label: s.name,
                    value: s.id,
                  })),
                ]}
                suffixIcon={<ApiOutlined className="text-[10px]" />}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ===== TABLES ZONE ===== */}
      <div className="pt-3 pb-4">
        {clientGroups.length === 0 && !loading ? (
          <div className="bg-white rounded-lg border border-slate-200 p-6 flex items-center justify-center text-slate-500 text-[13px]">
            No closed positions found for the selected criteria.
          </div>
        ) : (
          <Collapse
            defaultActiveKey={clientGroups.map((g) => g.clientName)}
            expandIconPosition="end"
            className="client-collapse flex flex-col gap-3"
            ghost
          >
            {clientGroups.map((group) => (
              <Collapse.Panel
                key={group.clientName}
                header={
                  <span className="font-semibold text-[13px] text-slate-800">
                    Position | {group.clientName}
                  </span>
                }
                className="bg-white rounded-md border border-slate-200 overflow-hidden shadow-sm !mb-0"
              >
                {/* Removed the div wrapper with overflow-x-auto to prevent double scrolling. Ant handles it natively. */}
                <Table
                  className="custom-compact-table"
                  columns={columns}
                  dataSource={group.data}
                  loading={loading}
                  size="small"
                  rowKey="key"
                  tableLayout="fixed"
                  pagination={{
                    position: ["bottomRight"] as const,
                    hideOnSinglePage: true,
                    pageSize: 50,
                    showSizeChanger: true,
                    pageSizeOptions: ["20", "50", "100", "250"],
                    className: "custom-pagination",
                  }}
                  scroll={{ x: "max-content" }} // Changed hard-coded width to max-content to natively fit headers
                  rowClassName={(record, index) => {
                    if (group.data.length === 0 && index === 0)
                      return "h-0 opacity-0 invisible";
                    if (record.isGroupHeader) return "group-header-row";
                    return "data-row";
                  }}
                />
              </Collapse.Panel>
            ))}
          </Collapse>
        )}
      </div>

      {/* COMPACT TABLE STYLES */}
      <style>
        {`
        .custom-compact-table .ant-table {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }

        /* Thinner, cleaner header */
        .custom-compact-table .ant-table-thead > tr > th {
          background-color: #f8fafc !important;
          color: #475569 !important;
          font-weight: 600 !important;
          font-size: 11px;
          text-transform: uppercase;
          border-bottom: 1px solid #cbd5e1 !important;
          padding: 6px 8px !important;
        }

        .custom-compact-table .ant-table-thead > tr > th::before { display: none !important; }

        /* Compact Collapse Headers */
        .client-collapse > .ant-collapse-item > .ant-collapse-header {
          background-color: #f1f5f9 !important;
          padding: 8px 12px !important;
          align-items: center;
          border-bottom: 1px solid #e2e8f0;
        }
        .client-collapse .ant-collapse-content { border-top: none; }
        .client-collapse .ant-collapse-content > .ant-collapse-content-box { padding: 0 !important; }

        /* Ultra-tight Data Rows */
        .custom-compact-table .ant-table-tbody > tr.data-row > td {
          padding: 4px 8px !important;
          border-bottom: 1px solid #f1f5f9 !important; 
          vertical-align: middle;
        }
        
        .custom-compact-table .ant-table-tbody > tr.data-row:hover > td { background-color: #f8fafc !important; }

        /* Compact Group Headers */
        .group-header-row > td {
          background-color: #ffffff !important; 
          padding: 4px 8px !important;
          border-bottom: 1px solid #e2e8f0 !important;
          border-top: 1px solid #e2e8f0 !important;
        }
        .custom-compact-table .ant-table-tbody > tr:first-child > td { border-top: none !important; }
        .group-header-row:hover > td { background-color: #ffffff !important; }

        .custom-compact-table .ant-table-header { overflow: hidden !important; }

        /* Custom minimal scrollbar */
        .custom-compact-table .ant-table-body::-webkit-scrollbar { height: 6px; }
        .custom-compact-table .ant-table-body::-webkit-scrollbar-track { background: transparent; }
        .custom-compact-table .ant-table-body::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-compact-table .ant-table-body::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

        /* Compact Pagination */
        .custom-pagination {
          padding: 6px 12px;
          margin: 0 !important;
          border-top: 1px solid #e2e8f0;
          background: #ffffff;
          display: flex;
          align-items: center;
        }
        .custom-compact-table .ant-pagination-total-text {
          margin-right: auto !important;
          color: #64748b;
          font-size: 11px;
          font-weight: 500;
        }
        `}
      </style>
    </div>
  );
}
