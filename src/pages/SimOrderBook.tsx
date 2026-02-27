import { useEffect, useState } from "react";
import { Table, Select, DatePicker, Button, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  DownloadOutlined,
  UserOutlined,
  ApiOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  getOrderBookApi,
  getClientListApi,
  getStrategyListApi,
} from "../services/orderService";
import { useLocation } from "react-router-dom";
import Loader from "../components/Loader";

const { Text } = Typography;
const { RangePicker } = DatePicker;

interface OrderData {
  key: string;
  clientName: string;
  strategyName: string;
  instrument: string;
  price: number;
  orderDateTime: string;
  qty: number;
  signalDateTime: string;
  signalPrice: number;

  signal: "BUY" | "SELL";
  status: string;
}

export default function SimOrderBook() {
  const location = useLocation();

  const endpoint = location.pathname.split("/")[1];

  const mode = endpoint === "sim-order-book" ? "sim" : "live";
  const today = dayjs();
  const [dateRange, setDateRange] = useState<
    [dayjs.Dayjs | null, dayjs.Dayjs | null]
  >([today, today]);
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [strategies, setStrategies] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<number>(0);
  const [selectedStrategy, setSelectedStrategy] = useState<number>(0);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50); // Default size

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const today = dayjs().format("MM/DD/YYYY");
      const startDate =
        dateRange?.[0]?.format("MM/DD/YYYY") || dayjs().format("MM/DD/YYYY");

      const endDate =
        dateRange?.[1]?.format("MM/DD/YYYY") || dayjs().format("MM/DD/YYYY");

      const res = await getOrderBookApi({
        strategy: selectedStrategy,
        start_date: startDate,
        end_date: endDate,
        client_id: selectedClient,
        mode: mode,
      });

      const apiData = res?.data?.result || [];

      // 🔥 Map API -> Table Data
      const formatted: OrderData[] = apiData.map((item: any) => ({
        key: item.order_id.toString(),
        clientName: item.client_name,
        strategyName: item.strategy_name,
        instrument: item.trade,
        price: item.price,
        orderDateTime: dayjs(
          item.create_datetime,
          "DD-MM-YYYY HH:mm:ss",
        ).format("DD MMM HH:mm"),
        qty: item.quantity,
        signalDateTime: dayjs(
          item.signal_datetime,
          "DD-MM-YYYY HH:mm:ss",
        ).format("DD MMM HH:mm"),
        signalPrice: item.signal_price,
        signal: item.strategy_signal,
        status: item.status,
      }));

      setOrders(formatted);
    } catch (error) {
      console.error("Order Fetch Error", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [dateRange, selectedClient, selectedStrategy, mode]);

  const fetchClients = async () => {
    try {
      const res = await getClientListApi({
        mode: mode,
      });

      const clientData = res?.data?.result || [];

      setClients(clientData);
    } catch (error) {
      console.error("Client Fetch Error", error);
    }
  };
  useEffect(() => {
    fetchClients();
  }, [mode]);

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

  const columns: ColumnsType<OrderData> = [
    {
      title: <span className="text-[13px] font-semibold">CLIENT</span>,
      dataIndex: "clientName",
      align: "left",
      width: 80,
      render: (v) => <Text className="text-[13px] font-semibold">{v}</Text>,
    },
    {
      title: <span className="text-[13px] font-semibold"> STRATEGY </span>,
      dataIndex: "strategyName",
      align: "left",
      width: 80,
      render: (v) => (
        <span className="text-[13px] text-gray-500 border px-1 rounded bg-gray-50">
          {v}
        </span>
      ),
    },
    {
      title: <span className="text-[13px] font-semibold"> INSTRUMENT </span>,
      dataIndex: "instrument",
      ellipsis: true,
      align: "left",
      width: 140,
      render: (t) => (
        <Text className="text-[13px]" ellipsis={{ tooltip: t }}>
          {t}
        </Text>
      ),
    },

    {
      title: <span className="text-[13px] font-semibold">QTY</span>,
      dataIndex: "qty",
      align: "right",
      width: 40,
      render: (v) => (
        <div
          style={{
            width: "100%",
            textAlign: "right",
          }}
          className="font-mono text-[13px]"
        >
          {v}
        </div>
      ),
    },
    {
      title: <span className="text-[13px] font-semibold">SIGNAL TIME</span>,
      dataIndex: "signalDateTime",
      align: "left",
      width: 70,
      render: (t) => <span className="text-[13px] text-gray-400 ">{t}</span>,
    },
    {
      title: <span className="text-[13px] font-semibold">PRICE</span>,
      dataIndex: "price",
      align: "right",
      width: 50,
      render: (v) => (
        <div
          style={{
            width: "100%",
            textAlign: "right",
          }}
          className="font-mono text-[13px] font-medium"
        >
          {/* {v.toFixed(2)} */}
          {(v || 0).toFixed(2)}
        </div>
      ),
    },
    {
      title: <span className="text-[13px] font-semibold">SIGNAL PRICE</span>,
      dataIndex: "signalPrice",
      align: "right",
      width: 70,
      render: (v) => (
        <div
          style={{
            width: "100%",
            textAlign: "right",
          }}
          className="font-mono text-[13px] text-gray-500"
        >
          {/* {v.toFixed(2)} */}
          {(v || 0).toFixed(2)}
        </div>
      ),
    },
    {
      title: <span className="text-[13px] font-semibold">ORDER TIME</span>,
      dataIndex: "orderDateTime",
      align: "left",
      width: 70,
      render: (t) => <span className="text-[13px] text-gray-400 ">{t}</span>,
    },
    {
      title: <span className="text-[13px] font-semibold">SIGNAL</span>,
      dataIndex: "signal",
      align: "left",
      width: 55,
      render: (v) => (
        <div
          className={`text-[13px]  ${v === "BUY" ? "text-green-500" : "text-red-500 "} text-left  px-1 rounded`}
          style={{
            backgroundColor:
              v === "BUY"
                ? "rgba(76, 175, 80, 0.15)"
                : "rgba(255, 77, 79, 0.15)", // green for BUY, red for SELL
            width: "100%",
          }}
        >
          {v}
        </div>
      ),
    },
    {
      title: <span className="text-[13px] font-semibold">STATUS</span>,
      dataIndex: "status",
      align: "left",
      width: 70,
      render: (t) => <span className="text-[13px] text-green-500">{t}</span>,
    },
  ];

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="bg-slate-100 p-2 sm:p-4 static">
      <div className="bg-white rounded-t-lg border-b px-3 sm:px-4 py-3 shadow-sm">
        {/* ================= MOBILE DESIGN ================= */}
        <div className="flex flex-col gap-3 lg:hidden">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[15px] font-semibold text-gray-800">
                Orders
              </span>

              <span
                className={`text-[10px] font-semibold px-2 py-[2px] rounded-md border
          ${
            mode === "live"
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-blue-50 text-blue-700 border-blue-200"
          }`}
              >
                {mode === "live" ? "LIVE" : "SIMULATOR"}
              </span>
            </div>

            <Button size="small" icon={<DownloadOutlined />} type="primary">
              Export
            </Button>
          </div>

          <div className="space-y-1.5">
            {/* Start Date */}
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
              <span className="w-4 text-green-500 font-semibold">→</span>
              <span>Start Date</span>
            </div>
            <DatePicker
              size="small"
              value={dateRange[0]}
              onChange={(date) =>
                setDateRange(date ? [date, dateRange[1]] : [null, dateRange[1]])
              }
              style={{ width: "100%" }}
              placeholder="Start Date"
              format="DD MMM"
            />

            {/* End Date */}
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="w-4 text-red-500 font-semibold">←</span>
              <span>End Date</span>
            </div>
            <DatePicker
              size="small"
              value={dateRange[1]}
              onChange={(date) =>
                setDateRange(date ? [dateRange[0], date] : [dateRange[0], null])
              }
              style={{ width: "100%" }}
              placeholder="End Date"
              format="DD MMM"
            />
          </div>

          {/* Client + Strategy */}
          <div className="flex gap-2">
            <Select
              size="small"
              value={selectedClient}
              className="flex-1"
              onChange={(value) => setSelectedClient(value)}
              options={[
                { label: "All Client", value: 0 },
                ...clients.map((c: any) => ({
                  label: c.name,
                  value: c.id,
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
                { label: "All Strategy", value: 0 },
                ...strategies.map((s: any) => ({
                  label: s.name,
                  value: s.id,
                })),
              ]}
              suffixIcon={<ApiOutlined className="text-[11px]" />}
            />

            {mode === "live" && (
              <Button
                size="small"
                icon={<ReloadOutlined />}
                onClick={fetchOrders}
              />
            )}
          </div>
        </div>

        {/* ================= DESKTOP DESIGN ================= */}
        <div className="hidden lg:flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          {/* LEFT SECTION */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full">
            {/* TITLE */}
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-[16px] font-semibold text-gray-800">
                Orders
              </span>

              <span
                className={`text-[11px] font-semibold px-2 py-[2px] rounded-md border
          ${
            mode === "live"
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-blue-50 text-blue-700 border-blue-200"
          }`}
              >
                {mode === "live" ? "LIVE" : "SIMULATOR"}
              </span>

              <div className="hidden sm:block h-5 w-px bg-gray-200" />
            </div>

            {/* FILTER AREA */}
            <div className="flex flex-wrap items-center gap-2 w-full">
              <div className="w-full sm:w-[240px]">
                <RangePicker
                  size="small"
                  value={dateRange}
                  onChange={(dates) => setDateRange(dates ?? [null, null])}
                  style={{ width: "100%" }}
                />
              </div>

              <div className="w-1/2 sm:w-[180px]">
                <Select
                  size="small"
                  value={selectedClient}
                  style={{ width: "100%" }}
                  onChange={(value) => setSelectedClient(value)}
                  options={[
                    { label: "All Client", value: 0 },
                    ...clients.map((c: any) => ({
                      label: c.name,
                      value: c.id,
                    })),
                  ]}
                  suffixIcon={<UserOutlined className="text-[11px]" />}
                />
              </div>

              <div className="w-1/2 sm:w-[200px]">
                <Select
                  size="small"
                  value={selectedStrategy}
                  style={{ width: "100%" }}
                  onChange={(value) => setSelectedStrategy(value)}
                  options={[
                    { label: "All Strategy", value: 0 },
                    ...strategies.map((s: any) => ({
                      label: s.name,
                      value: s.id,
                    })),
                  ]}
                  suffixIcon={<ApiOutlined className="text-[11px]" />}
                />
              </div>

              {mode === "live" && (
                <Button
                  size="small"
                  icon={<ReloadOutlined />}
                  onClick={fetchOrders}
                />
              )}
            </div>
          </div>

          {/* RIGHT ACTION */}
          <div className="flex justify-end items-center w-full lg:w-auto">
            <Button
              size="small"
              icon={<DownloadOutlined />}
              type="primary"
              className="shadow-sm"
            >
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* ===== COMPACT TABLE ===== */}
      <div className="bg-white rounded-b-lg shadow-sm overflow-hidden over">
        <div className="overflow-x-auto">
          {/* <Table
            columns={columns}
            dataSource={orders}
            // dataSource={data}
            loading={loading}
            size="small"
            tableLayout="fixed"
            pagination={{
              current: currentPage, // Use the state variable here
              pageSize: pageSize,
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "50", "100"],
              onChange: (page, newPageSize) => {
                setCurrentPage(page); // Update the page when clicked
                setPageSize(newPageSize);
              },
              position: ["bottomRight"],
            }}
            scroll={{
              // 'max-content' ensures the header doesn't clump together
              x: 1000,
              y: "calc(100vh - 225px)",
            }}
            style={{
              scrollbarWidth: "none", // Firefox
              msOverflowStyle: "none", // IE/Edge
              width: "100%",
            }}
            rowClassName={() => "hover:bg-blue-50/50 transition-colors"}
            components={{
              body: {
                cell: (props: any) => (
                  <td
                    {...props}
                    style={{
                      padding: "3px 8px",
                    }}
                  />
                ),
              },
            }}
          /> */}

          <Table
            columns={columns}
            dataSource={orders} // Add dummy row when empty
            loading={loading}
            size="small"
            rowKey="key"
            tableLayout="fixed"
            pagination={{
              position: ["bottomRight"] as const,
              current: currentPage,
              pageSize: pageSize,
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "50", "100"],
              onChange: (page, newPageSize) => {
                setCurrentPage(page);
                setPageSize(newPageSize);
              },

              showTotal: (total) =>
                total === 0 ? null : `Showing ${total} orders`,
            }}
            scroll={{
              x: 1000,
              y: orders.length > 0 ? "calc(100vh - 230px)" : undefined, // No vertical scroll when empty
            }}
            rowClassName={(record, index) => {
              // Hide dummy row styling
              if (orders.length === 0 && index === 0)
                return "h-0 opacity-0 invisible";
              return "hover:bg-blue-50/50 transition-colors";
            }}
            components={{
              body: {
                row: (props: any) => {
                  // Completely hide dummy row content
                  if (orders.length === 0 && props.index === 0) {
                    return (
                      <tr style={{ height: 0, display: "none" }} {...props} />
                    );
                  }
                  return <tr {...props} />;
                },
                cell: (props: any) => {
                  // Hide content in dummy row cells
                  if (
                    orders.length === 0 &&
                    props["data-row-key"] === orders[0]?.key
                  ) {
                    return (
                      <td
                        style={{ padding: 0, height: 0, border: "none" }}
                        {...props}
                      />
                    );
                  }
                  return <td {...props} style={{ padding: "4px 8px" }} />;
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
