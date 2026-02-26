import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, Table, Spin, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { getPositionApi } from "../services/positionApi";

const { Text } = Typography;

interface PositionRow {
  id: number;
  strategy_id: number;
  strategy_name: string;
  DisplayName: string;
  client_name?: string; // Included for strategy-mode grouping
  last_trade_price: number;
  sell_value: number;
  quantity: number;
  ltp: number;
  buy_value: number;
  PercentChange?: number;
}

const Positions = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode") || "client";

  const [data, setData] = useState<Record<string, PositionRow[]>>({});
  const [loading, setLoading] = useState(false);

  // ==========================================
  // Fetch Data
  // ==========================================
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

  // ==========================================
  // Table Columns (Logic kept exactly as original)
  // ==========================================
  const columns: ColumnsType<PositionRow> = [
    {
      title: "Instrument",
      dataIndex: "DisplayName",
    },
    {
      title: mode === "client" ? "Strategy Name" : "Client Name",
      render: (_, row) =>
        mode === "client" ? row.strategy_name : row.client_name || "-",
    },
    {
      title: "Qty",
      dataIndex: "quantity",
    },
    {
      title: "Buy Price",
      render: (_, row) =>
        row.quantity !== 0 ? (row.buy_value / row.quantity).toFixed(2) : "0.00",
    },
    {
      title: "Sell Price",
      render: (_, row) =>
        row.quantity !== 0 && row.sell_value
          ? (row.sell_value / row.quantity).toFixed(2)
          : "0.00",
    },
    {
      title: "LTP",
      dataIndex: "ltp",
    },
    {
      title: "Cur. Val",
      render: (_, row) => (row.ltp * row.quantity).toFixed(2),
    },
    {
      title: "P&L",
      render: (_, row) => {
        const pnl = row.ltp * row.quantity - row.buy_value;
        return (
          <span style={{ color: pnl >= 0 ? "green" : "red" }}>
            {pnl.toFixed(2)}
          </span>
        );
      },
    },
    {
      title: "Net chg.",
      render: (_, row) => {
        const pnl = row.ltp * row.quantity - row.buy_value;
        const percent =
          row.buy_value !== 0
            ? ((pnl / row.buy_value) * 100).toFixed(2)
            : "0.00";

        return (
          <span style={{ color: Number(percent) >= 0 ? "green" : "red" }}>
            {percent} %
          </span>
        );
      },
    },
    {
      title: "Day chg.",
      render: (_, row) => {
        const day = row.PercentChange || 0;
        return (
          <span style={{ color: day >= 0 ? "green" : "red" }}>
            {day.toFixed(2)} %
          </span>
        );
      },
    },
  ];

  // ==========================================
  // Unified Table Renderer with Calculations
  // ==========================================
  const renderTable = (subTitle: string, rows: PositionRow[]) => {
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
      <div key={subTitle} className="mb-8 last:mb-0">
        <div className="bg-gray-50 p-2 border-l-4 border-blue-500 mb-3">
          <Text strong className="text-gray-600">
            {mode === "client"
              ? `Strategy: ${subTitle}`
              : `Client: ${subTitle}`}
          </Text>
        </div>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={rows}
          pagination={false}
          size="small"
          bordered
          summary={() => (
            <Table.Summary.Row className="bg-gray-50 font-bold">
              <Table.Summary.Cell index={0} colSpan={6}>
                Total
              </Table.Summary.Cell>
              <Table.Summary.Cell index={6}>
                {totalCurVal.toFixed(2)}
              </Table.Summary.Cell>
              <Table.Summary.Cell index={7}>
                <span style={{ color: totalPnl >= 0 ? "green" : "red" }}>
                  {totalPnl.toFixed(2)}
                </span>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={8}>
                <span
                  style={{ color: Number(totalNet) >= 0 ? "green" : "red" }}
                >
                  {totalNet} %
                </span>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={9}></Table.Summary.Cell>
            </Table.Summary.Row>
          )}
        />
      </div>
    );
  };

  // ==========================================
  // Main Render
  // ==========================================
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" tip="Loading Positions..." />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {Object.entries(data).map(([mainKey, rows]) => {
        // Grouping logic for the inner tables
        const innerGroups: Record<string, PositionRow[]> = {};

        rows.forEach((row) => {
          // If mode is client, group by strategy name inside.
          // If mode is strategy, group by client name inside.
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
            className="mb-8 shadow-md border-none rounded-lg overflow-hidden"
            title={
              <div className="flex items-center">
                <div className="w-1.5 h-5 bg-blue-600 mr-2 rounded" />
                <span className="text-lg font-bold">
                  {mode === "client" ? "Client: " : "Strategy: "} {mainKey}
                </span>
              </div>
            }
          >
            {Object.entries(innerGroups).map(([subTitle, subRows]) =>
              renderTable(subTitle, subRows),
            )}
          </Card>
        );
      })}
    </div>
  );
};

export default Positions;
