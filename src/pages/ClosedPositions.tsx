import React, { useEffect, useState } from "react";
import { Table, Select, DatePicker, Typography } from "antd";
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

const { Text } = Typography;
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

  const [positions, setPositions] = useState<TableDataItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [strategies, setStrategies] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<number>(0);
  const [selectedStrategy, setSelectedStrategy] = useState<number>(0);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  // Fetch Positions
  const fetchPositions = async () => {
    try {
      setLoading(true);

      const safeStartDate = dateRange?.[0] ? dayjs(dateRange[0]) : dayjs();
      const safeEndDate = dateRange?.[1] ? dayjs(dateRange[1]) : dayjs();

      const startDateStr = safeStartDate.format("YYYY-MM-DD"); // Using format suitable for APIs
      const endDateStr = safeEndDate.format("YYYY-MM-DD");

      // Pass selectedStrategy and selectedClient to your updated API
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
        pnl: item.pnl || 0,
      }));

      // 2. Group the data by Strategy Name
      const groupedMap = new Map<string, TableDataItem[]>();
      formatted.forEach((item: TableDataItem) => {
        if (!groupedMap.has(item.strategyName)) {
          groupedMap.set(item.strategyName, []);
        }
        groupedMap.get(item.strategyName)!.push(item);
      });

      // 3. Rebuild the array inserting Group Headers
      const finalData: TableDataItem[] = [];
      groupedMap.forEach((items, strategyName) => {
        // Add the spanning header row
        finalData.push({
          key: `group-${strategyName}`,
          isGroupHeader: true,
          strategyName: strategyName,
        });
        // Add the actual trades for this strategy
        finalData.push(...items);
      });

      setPositions(finalData);
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

  useEffect(() => {
    fetchClients();
  }, []);

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
    fetchStrategies();
  }, []);

  // Total columns = 10. Group headers span all 10. Data rows span 1 each.
  const columns: ColumnsType<TableDataItem> = [
    {
      title: "", // Hidden text, keeps spacing clean
      dataIndex: "trade",
      align: "left",
      width: 200,
      render: (t, record) => {
        if (record.isGroupHeader) {
          return {
            children: (
              <span className="text-[13px] font-bold text-slate-900 ml-1">
                Strategy: {record.strategyName}
              </span>
            ),
            props: { colSpan: 10 },
          };
        }
        return {
          children: <span className="text-[12px] text-slate-700">{t}</span>,
          props: { colSpan: 1 },
        };
      },
    },
    {
      title: "",
      dataIndex: "strategyName",
      align: "left",
      width: 100,
      render: (v, record) => {
        if (record.isGroupHeader) return { props: { colSpan: 0 } };
        return {
          children: <span className="text-[12px] text-slate-700">{v}</span>,
          props: { colSpan: 1 },
        };
      },
    },
    {
      title: "",
      dataIndex: "entryTime",
      align: "left",
      width: 150,
      render: (t, record) => {
        if (record.isGroupHeader) return { props: { colSpan: 0 } };
        return {
          children: <span className="text-[12px] text-slate-700">{t}</span>,
          props: { colSpan: 1 },
        };
      },
    },
    {
      title: "",
      dataIndex: "exitTime",
      align: "left",
      width: 150,
      render: (t, record) => {
        if (record.isGroupHeader) return { props: { colSpan: 0 } };
        return {
          children: <span className="text-[12px] text-slate-700">{t}</span>,
          props: { colSpan: 1 },
        };
      },
    },
    {
      title: "",
      dataIndex: "entryPrice",
      align: "right",
      width: 80,
      render: (v, record) => {
        if (record.isGroupHeader) return { props: { colSpan: 0 } };
        return {
          children: (
            <span className="text-[12px] text-slate-700">
              {(v || 0).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          ),
          props: { colSpan: 1 },
        };
      },
    },
    {
      title: "",
      dataIndex: "exitPrice",
      align: "right",
      width: 80,
      render: (v, record) => {
        if (record.isGroupHeader) return { props: { colSpan: 0 } };
        return {
          children: (
            <span className="text-[12px] text-slate-700">
              {(v || 0).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          ),
          props: { colSpan: 1 },
        };
      },
    },
    {
      title: "",
      dataIndex: "qty",
      align: "right",
      width: 60,
      render: (v, record) => {
        if (record.isGroupHeader) return { props: { colSpan: 0 } };
        return {
          children: <span className="text-[12px] text-slate-700">{v}</span>,
          props: { colSpan: 1 },
        };
      },
    },
    {
      title: "",
      dataIndex: "buyValue",
      align: "right",
      width: 110,
      render: (v, record) => {
        if (record.isGroupHeader) return { props: { colSpan: 0 } };
        return {
          children: (
            <span className="text-[12px] text-slate-700">
              {(v || 0).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          ),
          props: { colSpan: 1 },
        };
      },
    },
    {
      title: "",
      dataIndex: "sellValue",
      align: "right",
      width: 110,
      render: (v, record) => {
        if (record.isGroupHeader) return { props: { colSpan: 0 } };
        return {
          children: (
            <span className="text-[12px] text-slate-700">
              {(v || 0).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          ),
          props: { colSpan: 1 },
        };
      },
    },
    {
      title: "",
      dataIndex: "pnl",
      align: "right",
      width: 110,
      render: (v, record) => {
        if (record.isGroupHeader) return { props: { colSpan: 0 } };
        const isProfit = v >= 0;
        return {
          children: (
            <span
              className={`text-[12px] ${isProfit ? "text-green-600" : "text-red-500"}`}
            >
              {isProfit ? "" : ""}
              {(v || 0).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          ),
          props: { colSpan: 1 },
        };
      },
    },
  ];

  if (loading && positions.length === 0) {
    return <Loader />;
  }

  return (
    <div className="bg-slate-50 p-2 sm:p-4 static h-full flex flex-col">
      <div className="bg-white rounded-t-lg border-b px-3 sm:px-4 py-3 shadow-sm border border-slate-200">
        {/* ================= MOBILE DESIGN ================= */}
        <div className="flex flex-col gap-3 lg:hidden">
          <div className="flex items-center justify-between">
            <span className="text-[16px] font-bold text-slate-800">
              Closed Positions
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                Date Range
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
                  style={{ width: "100%" }}
                  placeholder="Start Date"
                  format="DD MMM YYYY"
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
                  style={{ width: "100%" }}
                  placeholder="End Date"
                  format="DD MMM YYYY"
                  allowClear={false}
                />
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <Select
                size="small"
                value={selectedClient}
                className="flex-1"
                onChange={(value) => setSelectedClient(value)}
                options={[
                  { label: "All Clients", value: 0 },
                  ...clients.map((c: any) => ({
                    label: c.client_name,
                    value: c.client_id,
                  })),
                ]}
                suffixIcon={<UserOutlined className="text-[11px]" />}
              />

              <Select
                size="small"
                value={selectedStrategy}
                className="flex-1"
                onChange={(value) => setSelectedStrategy(value)}
                options={[
                  { label: "All Strategies", value: 0 },
                  ...strategies.map((s: any) => ({
                    label: s.name,
                    value: s.id,
                  })),
                ]}
                suffixIcon={<ApiOutlined className="text-[11px]" />}
              />
            </div>
          </div>
        </div>

        {/* ================= DESKTOP DESIGN ================= */}
        <div className="hidden lg:flex lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4 shrink-0">
            <span className="text-[18px] font-bold text-slate-800">
              Closed Positions
            </span>
            <div className="h-5 w-px bg-slate-200" />
          </div>

          <div className="flex items-center gap-3 w-full justify-end">
            <div className="w-[240px]">
              <RangePicker
                size="small"
                value={dateRange}
                onChange={(dates) =>
                  setDateRange(
                    (dates as [dayjs.Dayjs, dayjs.Dayjs]) ?? [today, today],
                  )
                }
                style={{ width: "100%" }}
                format="DD MMM YYYY"
                allowClear={false}
              />
            </div>

            <div className="w-[180px]">
              <Select
                size="small"
                value={selectedClient}
                style={{ width: "100%" }}
                onChange={(value) => setSelectedClient(value)}
                options={[
                  { label: "All Clients", value: 0 },
                  ...clients.map((c: any) => ({
                    label: c.client_name,
                    value: c.client_id,
                  })),
                ]}
                suffixIcon={<UserOutlined className="text-[11px]" />}
              />
            </div>

            <div className="w-[180px]">
              <Select
                size="small"
                value={selectedStrategy}
                style={{ width: "100%" }}
                onChange={(value) => setSelectedStrategy(value)}
                options={[
                  { label: "All Strategies", value: 0 },
                  ...strategies.map((s: any) => ({
                    label: s.name,
                    value: s.id,
                  })),
                ]}
                suffixIcon={<ApiOutlined className="text-[11px]" />}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ===== COMPACT TABLE ===== */}
      <div className="bg-white rounded-b-lg shadow-sm overflow-hidden flex-1 border border-t-0 border-slate-200">
        <div className="overflow-x-auto">
          <Table
            className="order-table custom-compact-table"
            columns={columns}
            dataSource={positions}
            loading={loading}
            size="small"
            rowKey="key"
            tableLayout="fixed"
            pagination={{
              position: ["bottomRight"] as const,
              current: currentPage,
              pageSize: pageSize,
              showSizeChanger: true,
              pageSizeOptions: ["20", "50", "100", "250"],
              onChange: (page, newPageSize) => {
                setCurrentPage(page);
                setPageSize(newPageSize);
              },
              showTotal: (total) => `Total ${total} rows`,
              className: "custom-pagination",
            }}
            scroll={{
              x: 1100,
              y: positions.length > 0 ? "calc(100vh - 230px)" : undefined,
            }}
            rowClassName={(record, index) => {
              if (positions.length === 0 && index === 0)
                return "h-0 opacity-0 invisible";
              if (record.isGroupHeader) return "group-header-row";
              return "data-row";
            }}
          />
        </div>
      </div>

      {/* STYLE FOR COMPACT TABLE */}
      <style>
        {`
        .custom-compact-table .ant-table {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }

        /* Hide Table Headers Completly as per screenshot */
        .custom-compact-table .ant-table-thead {
           display: none !important;
        }

        /* DATA ROW CELLS */
        .custom-compact-table .ant-table-tbody > tr.data-row > td {
          padding: 6px 12px !important;
          border-bottom: 1px solid #f1f5f9 !important; 
          vertical-align: middle;
        }
        
        .custom-compact-table .ant-table-tbody > tr.data-row:hover > td {
          background-color: #f8fafc !important; 
        }

        /* GROUP HEADER ROW STYLING */
        .group-header-row > td {
          background-color: #ffffff !important; 
          padding: 10px 12px 6px 12px !important;
          border-bottom: 1px solid #e2e8f0 !important;
          border-top: 1px solid #e2e8f0 !important;
        }
        /* Remove top border for the very first group header */
        .custom-compact-table .ant-table-tbody > tr:first-child > td {
           border-top: none !important;
        }
        .group-header-row:hover > td {
          background-color: #ffffff !important; 
        }

        .custom-compact-table .ant-table-header {
          overflow: hidden !important;
        }

        /* Scrollbar */
        .custom-compact-table .ant-table-body::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-compact-table .ant-table-body::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-compact-table .ant-table-body::-webkit-scrollbar-thumb {
          background: #cbd5e1; 
          border-radius: 10px;
        }
        .custom-compact-table .ant-table-body::-webkit-scrollbar-thumb:hover {
          background: #94a3b8; 
        }

        /* Pagination Setup */
        .custom-pagination {
          padding: 8px 16px;
          margin: 0 !important;
          border-top: 1px solid #e2e8f0;
          background: #ffffff;
          display: flex;
          align-items: center;
        }
        .custom-compact-table .ant-pagination-total-text {
          margin-right: auto !important;
          color: #64748b;
          font-size: 12px;
          font-weight: 600;
        }
        `}
      </style>
    </div>
  );
}
