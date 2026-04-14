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
      width: 180,
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
      width: 50,
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
      width: 130,
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
      width: 130,
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
      width: 50,
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
      width: 50,
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
      width: 30,
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
      width: 60,
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
      width: 60,
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
      width: 60,
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
      width: 60,
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
                  scroll={{ x: "1000" }} // Changed hard-coded width to max-content to natively fit headers
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
