import React, { useEffect, useState } from "react";
import { Table, Card, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { UpOutlined, DownOutlined } from "@ant-design/icons";
import { fetchManualPositionList } from "../../services/manualExecutionApi";
import { getCookieData } from "../../hook/getCookieData";

const { Text } = Typography;

// --- TYPES ---
interface OpenPositionRow {
  key: number;
  strategy: string;
  displayName: string;
  qty: number;
  ltp: number;
  pnl: number;
  chg: number;
}

const OpenPositions: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [positions, setPositions] = useState<any[]>([]);
  const clientId = Number(getCookieData("client_id"));

  useEffect(() => {
    const loadPositions = async () => {
      if (!clientId) return;

      try {
        const res = await fetchManualPositionList(clientId);

        const result = res?.data?.result || [];

        console.log("Manual Positions:", result); // print data

        setPositions(result); // store data
      } catch (error) {
        console.error("Error fetching manual position list:", error);
      }
    };

    loadPositions();
  }, [clientId]);

  const tableData: OpenPositionRow[] = positions.map((item, index) => ({
    key: index,
    strategy: item.name, // strategy column
    displayName: item.DisplayName, // display name
    qty: item.quantity, // quantity
    ltp: item.ltp, // ltp
    pnl: 0, // blank
    chg: 0, // blank
  }));
  const formatCurrency = (value: number) =>
    value.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const columns: ColumnsType<OpenPositionRow> = [
    {
      title: "Strategy",
      dataIndex: "strategy",
      key: "strategy",
      width: 70,
      className: "text-[10px]",
    },
    {
      title: "Display Name",
      dataIndex: "displayName",
      key: "displayName",
      width: 150,
      className: "text-[10px]",
    },
    {
      title: "Qty",
      dataIndex: "qty",
      key: "qty",
      align: "center",
      width: 50,
      className: "text-[10px]",
    },
    {
      title: "Ltp",
      dataIndex: "ltp",
      key: "ltp",
      align: "right",
      width: 60,
      className: "text-[10px]",
      render: (val: number) => formatCurrency(val),
    },
    {
      title: "P&L",
      dataIndex: "pnl",
      key: "pnl",
      align: "right",
      width: 80,
      className: "text-[10px]",
      render: (val: number) => (
        <span className={val < 0 ? "text-red-500" : "text-emerald-500"}>
          {formatCurrency(val)}
        </span>
      ),
    },
    {
      title: "Chg(%)",
      dataIndex: "chg",
      key: "chg",
      align: "right",
      width: 60,
      className: "text-[10px]",
      render: (val: number) => (
        <span className={val < 0 ? "text-red-500" : "text-emerald-500"}>
          {val.toFixed(2)}%
        </span>
      ),
    },
  ];

  return (
    <div className="p-1">
      <Card
        size="small"
        className="rounded-md border border-gray-200 bg-white shadow-sm overflow-hidden"
      >
        {/* HEADER / COLLAPSIBLE TOGGLE */}
        <div
          className=" bg-white flex items-center justify-between cursor-pointer select-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Text className="text-[17px] font-semibold text-gray-800">
            Open Positions
          </Text>
          <div className="flex items-center gap-2 text-[10px]">
            <Text className="font-medium text-gray-800">P&L 0.00</Text>
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
              dataSource={tableData}
              pagination={false}
              className="open-positions-table"
              scroll={{ x: "max-content", y: 280 }}
              locale={{ emptyText: "No data available" }}
            />
          </div>
        )}
      </Card>

      <style>
        {`
          .open-positions-table .ant-table {
            font-size: 10px;
            color: #334155;
          }

          .open-positions-table .ant-table-thead > tr > th {
            background: #f9fafb !important;
            font-size: 10px;
            font-weight: 600;
            padding: 4px 6px !important;
            color: #475569;
           
          }

          .open-positions-table .ant-table-thead > tr > th::before {
            display: none !important;
          }

          .open-positions-table .ant-table-tbody > tr > td {
            padding: 3px 6px !important;
            color: #334155;
            border-bottom: 1px solid #f1f5f9 !important;
            font-size: 10px;
          }

          .open-positions-table .ant-table-tbody > tr:hover > td {
            background: #f8fafc !important;
            transition: 0.1s;
          }

          .open-positions-table .ant-table-tbody > tr:last-child > td {
            border-bottom: none !important;
          }
        `}
      </style>
    </div>
  );
};

export default OpenPositions;
