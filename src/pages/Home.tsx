import { useEffect, useMemo, useState } from "react";
import { Card, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { getPositionList } from "../services/HomeApi";
import Loader from "../components/Loader";

const { Text } = Typography;

/* ================= Cookie Helper ================= */

const getCookie = (name: string): string => {
  const cookies = document.cookie.split(";");

  for (let cookie of cookies) {
    const [key, value] = cookie.trim().split("=");

    if (key === name) {
      return decodeURIComponent(value);
    }
  }

  return "User";
};

/* ================= Types ================= */

interface PositionRow {
  id: number;
  name: string;
  DisplayName: string;
  create_datetime: string;
  quantity: number;
  ltp: number;
  last_trade_price: number;
  sell_value: number;
  PercentChange: number;
}

/* ================= Component ================= */

export default function Home() {
  const [positions, setPositions] = useState<PositionRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fullName = getCookie("full_name");

  /* ================= Fetch ================= */

  useEffect(() => {
    getPositionList()
      .then((res) => {
        setPositions(res.data?.result || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  /* ================= Columns ================= */

  const columns: ColumnsType<PositionRow> = useMemo(
    () => [
      {
        title: "Strategy",
        dataIndex: "name",
        render: (v) => <span className="font-medium text-gray-800">{v}</span>,
      },
      {
        title: "Display",
        dataIndex: "DisplayName",
      },
      {
        title: "Created",
        dataIndex: "create_datetime",
        width: 180,
      },
      {
        title: "Qty",
        dataIndex: "quantity",
        align: "right",
      },
      {
        title: "LTP",
        dataIndex: "ltp",
        align: "right",
        render: (v) => v.toFixed(2),
      },
      {
        title: "Buy",
        dataIndex: "last_trade_price",
        align: "right",
        render: (v) => v.toFixed(2),
      },
      {
        title: "Sell",
        dataIndex: "sell_value",
        align: "right",
        render: (v) => v.toFixed(2),
      },
      {
        title: "P&L",
        align: "right",
        render: (_, row) => {
          const pnl = (row.ltp - row.last_trade_price) * row.quantity;

          return (
            <span className={pnl >= 0 ? "text-green-600" : "text-red-600"}>
              {pnl.toFixed(2)}
            </span>
          );
        },
      },
      {
        title: "Chg %",
        dataIndex: "PercentChange",
        align: "right",
        render: (v) => (
          <span className={v >= 0 ? "text-green-600" : "text-red-600"}>
            {v.toFixed(2)}%
          </span>
        ),
      },
    ],
    [],
  );

  /* ================= Loading ================= */

  if (loading) {
    return <Loader />;
  }

  /* ================= UI ================= */

  return (
    <div className="bg-gray-100 min-h-screen p-3">
      <Card size="small" className="shadow-sm rounded-lg">
        {/* Header */}
        <div className="mb-3">
          <Text className="text-base">
            Hi, <span className="font-semibold">{fullName}</span>
          </Text>
        </div>

        {/* Table */}
        <Table
          rowKey="id"
          columns={columns}
          dataSource={positions}
          pagination={false}
          size="small"
          bordered
          scroll={{ x: "max-content", y: 520 }}
          className="compact-trading-table"
        />
      </Card>
    </div>
  );
}
