import React, { useState } from "react";
import { Table, Card, Typography, Switch } from "antd";
import type { ColumnsType } from "antd/es/table";
import { UpOutlined, DownOutlined } from "@ant-design/icons";

const { Text } = Typography;

// --- TYPES ---
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
  const [isSimActive, setIsSimActive] = useState(true);

  const [data] = useState<OrderRow[]>([
    {
      key: 1,
      trade: "NIFTY 10MAR2026 PE 24650",
      price: 0.0,
      qty: 65,
      orderDateTime: "06-03-2026 10:24:00",
      status: "Executed",
    },
    {
      key: 2,
      trade: "NIFTY 10MAR2026 CE 24650",
      price: 0.0,
      qty: 65,
      orderDateTime: "06-03-2026 10:24:00",
      status: "Executed",
    },
    {
      key: 3,
      trade: "NIFTY 10MAR2026 PE 24650",
      price: 0.0,
      qty: 65,
      orderDateTime: "06-03-2026 10:22:06",
      status: "Executed",
    },
    {
      key: 4,
      trade: "NIFTY 10MAR2026 CE 24650",
      price: 0.0,
      qty: 65,
      orderDateTime: "06-03-2026 10:22:06",
      status: "Executed",
    },
    {
      key: 5,
      trade: "NIFTY 10MAR2026 PE 24650",
      price: 0.0,
      qty: 65,
      orderDateTime: "06-03-2026 10:18:02",
      status: "Executed",
    },
    {
      key: 6,
      trade: "NIFTY 10MAR2026 CE 24650",
      price: 0.0,
      qty: 65,
      orderDateTime: "06-03-2026 10:18:02",
      status: "Executed",
    },
    {
      key: 7,
      trade: "NIFTY 10MAR2026 PE 24650",
      price: 0.0,
      qty: 65,
      orderDateTime: "06-03-2026 10:15:43",
      status: "Executed",
    },
    {
      key: 8,
      trade: "NIFTY 10MAR2026 CE 24650",
      price: 0.0,
      qty: 65,
      orderDateTime: "06-03-2026 10:15:43",
      status: "Executed",
    },
  ]);

  const columns: ColumnsType<OrderRow> = [
    {
      title: "Trade",
      dataIndex: "trade",
      key: "trade",
      width: 180,
      className: "text-[10px]",
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      align: "center",
      width: 50,
      className: "text-[10px]",
      render: (val: number) => val.toFixed(2),
    },
    {
      title: "Qty",
      dataIndex: "qty",
      key: "qty",
      align: "center",
      width: 40,
      className: "text-[10px]",
    },
    {
      title: "Order date-time",
      dataIndex: "orderDateTime",
      key: "orderDateTime",
      align: "center",
      width: 120,
      className: "text-[10px]",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      align: "center",
      width: 60,
      className: "text-[10px]",
      render: (text: string) => (
        <span className="text-emerald-500 font-medium">{text}</span>
      ),
    },
  ];

  return (
    <div className="p-1">
      <Card
        size="small"
        className="rounded-md border border-gray-200 bg-white shadow-sm overflow-hidden"
      >
        {/* HEADER */}
        <div
          className="px-2 py-1 bg-white flex items-center justify-between cursor-pointer select-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Text className="text-[11px] font-semibold text-gray-800">
            Orders
          </Text>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Text className="text-[10px] font-medium">SIM</Text>
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
          <div className="border-t border-gray-100 bg-white">
            <Table
              size="small"
              columns={columns}
              dataSource={data}
              pagination={false}
              className="orders-table"
              scroll={{ y: 280 }}
            />
          </div>
        )}
      </Card>

      <style>
        {`
        /* ================= TABLE ================= */
        .orders-table .ant-table {
          font-size: 10px;
        }

        /* HEADER */
        .orders-table .ant-table-thead > tr > th {
          background: #f9fafb !important;
          font-size: 10px;
          font-weight: 600;
          padding: 4px 6px !important;
          color: #475569;
          border-bottom: 1px solid #e2e8f0 !important;
        }

        .orders-table .ant-table-thead > tr > th::before {
          display: none !important;
        }

        /* BODY */
        .orders-table .ant-table-tbody > tr > td {
          padding: 3px 6px !important;
          color: #334155;
          border-bottom: 1px solid #f1f5f9 !important;
          font-size: 10px;
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
