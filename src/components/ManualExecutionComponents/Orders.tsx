import React, { useEffect, useState } from "react";
import { Table, Card, Typography, Switch } from "antd";
import type { ColumnsType } from "antd/es/table";
import { UpOutlined, DownOutlined } from "@ant-design/icons";
import { fetchOrderBook } from "../../services/manualExecutionApi";
import { getCookieData } from "../../hook/getCookieData";
import eventBus from "../../utils/eventBus";

const { Text } = Typography;

/* ================= TYPES ================= */

interface OrderRow {
  key: number;
  trade: string;
  price: number;
  qty: number;
  orderDateTime: string;
  status: string;
}

const Orders: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [isSimActive, setIsSimActive] = useState(false);
  const [data, setData] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(false);

  const clientId = Number(getCookieData("client_id"));

  useEffect(() => {
    const refresh = () => {
      loadOrders();
    };

    eventBus.on("ORDER_EXECUTED", refresh);

    return () => {
      eventBus.off("ORDER_EXECUTED", refresh);
    };
  }, [clientId, isSimActive]);

  /* ================= FETCH ORDER BOOK ================= */

  // const loadOrders = async () => {
  //   if (!clientId) return;

  //   const mode = isSimActive ? "sim" : "live";

  //   try {
  //     setLoading(true);

  //     const res = await fetchOrderBook(clientId, mode);

  //     const result = res?.data?.result || [];

  //     const mapped = result.map((item: any) => ({
  //       key: item.order_id,
  //       trade: item.trade,
  //       price: item.price,
  //       qty: item.quantity,
  //       orderDateTime: item.create_datetime,
  //       status: item.status,
  //     }));

  //     setData(mapped);
  //   } catch (error) {
  //     console.error("Error fetching order book:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const loadOrders = async (forceSim = false) => {
    if (!clientId) return;

    const mode = forceSim ? "sim" : isSimActive ? "sim" : "live";

    try {
      setLoading(true);

      const res = await fetchOrderBook(clientId, mode);

      const result = res?.data?.result || [];

      const mapped = result.map((item: any) => ({
        key: item.order_id,
        trade: item.trade,
        price: item.price,
        qty: item.quantity,
        orderDateTime: item.create_datetime
          ? item.create_datetime.split(".")[0]
          : "",
        status: item.status,
      }));

      setData(mapped);
    } catch (error) {
      console.error("Error fetching order book:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const refresh = () => {
      setIsSimActive(true); // ✅ switch UI to SIM
      loadOrders(true); // ✅ force SIM mode
    };

    eventBus.on("ORDER_EXECUTED", refresh);

    return () => {
      eventBus.off("ORDER_EXECUTED", refresh);
    };
  }, [clientId]);

  /* ================= EFFECT ================= */

  useEffect(() => {
    loadOrders();
  }, [clientId, isSimActive]);

  /* ================= TABLE COLUMNS ================= */

  const columns: ColumnsType<OrderRow> = [
    {
      title: "Trade",
      dataIndex: "trade",
      key: "trade",
      align: "left",
      width: 140,
      className: "text-[12px]",
    },
    {
      title: <span style={{ whiteSpace: "nowrap", width: "full" }}>Price</span>,
      dataIndex: "price",
      key: "price",
      align: "right",
      width: 30,
      className: "text-[12px]",
      render: (val: number) => val?.toFixed(2),
    },
    {
      title: <span style={{ whiteSpace: "nowrap", width: "full" }}>Qty</span>,
      dataIndex: "qty",
      key: "qty",
      align: "right",
      width: 20,
      className: "text-[12px]",
    },
    {
      title: <span className="w-96">Order date-time</span>,
      dataIndex: "orderDateTime",
      key: "orderDateTime",
      align: "right",
      width: 90,
      className: "text-[12px]",
    },
    {
      title: <span className="w-96">Status</span>,
      dataIndex: "status",
      key: "status",
      align: "center",
      width: 30,
      className: "text-[12px]",
      render: (text: string) => {
        let colorClass = "";

        if (text?.toLowerCase() === "executed") {
          colorClass = "text-emerald-500";
        } else if (text?.toLowerCase() === "pending") {
          colorClass = "text-yellow-500";
        } else if (
          text?.toLowerCase() === "fail" ||
          text?.toLowerCase() === "failed"
        ) {
          colorClass = "text-red-500";
        }

        return <span className={`${colorClass} font-medium`}>{text}</span>;
      },
    },
  ];

  const isEmpty = data.length === 0;

  return (
    <div className="p-1">
      <Card
        size="small"
        className="rounded-md border border-gray-200 bg-white shadow-sm overflow-hidden"
      >
        {/* HEADER */}
        <div
          className=" bg-white flex items-center justify-between cursor-pointer select-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Text className="text-[15px] font-semibold text-gray-800">
            Orders
          </Text>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Text className="text-[12px] font-medium">
                {" "}
                {isSimActive ? "SIM" : "LIVE"}
              </Text>

              <Switch
                size="small"
                checked={isSimActive}
                className={isSimActive ? "bg-blue-500" : "bg-gray-300"}
                onClick={(checked, event) => {
                  event.stopPropagation();
                  setIsSimActive(checked);
                }}
              />
            </div>

            {isOpen ? (
              <UpOutlined className="text-gray-600 text-[10px]" />
            ) : (
              <DownOutlined className="text-gray-600 text-[10px]" />
            )}
          </div>
        </div>

        {/* TABLE */}
        {isOpen && (
          <div className="border-t border-gray-100 bg-white mt-2">
            {isEmpty ? (
              <div className="w-full text-[12px]">
                {/* HEADER */}
                <div className="grid grid-cols-[2fr_1fr_1fr_2fr_1fr] px-2 py-1 bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                  <span>Trade</span>
                  <span className="text-right">Price</span>
                  <span className="text-right">Qty</span>
                  <span className="text-center">Order date-time</span>
                  <span className="text-center">Status</span>
                </div>

                {/* BODY */}
                <div className="flex items-center justify-center py-6 text-gray-400">
                  No orders available
                </div>
              </div>
            ) : (
              <Table
                size="small"
                columns={columns}
                dataSource={data}
                pagination={false}
                loading={loading}
                className="orders-table"
                tableLayout="fixed"
                scroll={{ x: "max-content", y: 280 }}
              />
            )}
          </div>
        )}
      </Card>

      <style>
        {`
        
        /* ================= TABLE ================= */
        .orders-table .ant-table {
          font-size: 12px;
        }

        /* HEADER */
        .orders-table .ant-table-thead > tr > th {
          background: #f9fafb !important;
          font-size: 12px;
          font-weight: 600;
          padding: 3px 6px !important;
          color: #475569;
          border-bottom: 1px solid #e2e8f0 !important;
          white-space: nowrap !important;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .orders-table .ant-table-thead > tr > th::before {
          display: none !important;
        }

        /* BODY */
        .orders-table .ant-table-tbody > tr > td {
          padding: 2px 6px !important;
          color: #334155;
          border-bottom: 1px solid #f1f5f9 !important;
          font-size: 12px;
        }

        .orders-table .ant-table-tbody > tr:hover > td {
          background: #f8fafc !important;
          transition: 0.1s;
        }

        .orders-table .ant-table-tbody > tr:last-child > td {
          border-bottom: none !important;
        }

        /* Scrollbar */
        .orders-table .ant-table-body::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }

        .orders-table .ant-table-body::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        `}
      </style>
    </div>
  );
};

export default Orders;
