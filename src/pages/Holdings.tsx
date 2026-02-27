import React, { useEffect, useMemo, useState } from "react";
import { Card, Table, Select, Spin, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { getHoldingApi } from "../services/holdingApi";
import Loader from "../components/Loader";

const { Text } = Typography;

interface HoldingRow {
  tradingsymbol: string;
  quantity: number;
  average_price: number;
  last_price: number;
  pnl: number;
  day_change: number;
  day_change_percentage: number;
}

export default function Holdings() {
  const [data, setData] = useState<Record<string, HoldingRow[]>>({});
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [clientId, clientName] = useMemo(() => {
    if (!selectedClient) return ["", ""];

    const parts = selectedClient.split("_");

    return [parts[0] || "", parts.slice(1).join("_") || ""];
  }, [selectedClient]);

  /* ================= Fetch ================= */

  useEffect(() => {
    getHoldingApi()
      .then((response) => {
        const result = response.data?.result || {};

        setData(result);

        const clients = Object.keys(result);
        if (clients.length) {
          setSelectedClient(clients[0]);
        }
      })
      .catch((error) => console.error("Holding fetch error:", error))
      .finally(() => setLoading(false));
  }, []);

  /* ================= Current Data ================= */

  const currentHoldings = data[selectedClient] || [];

  /* ================= Summary ================= */

  const summary = useMemo(() => {
    let investment = 0;
    let value = 0;

    currentHoldings.forEach((row) => {
      investment += row.quantity * row.average_price;

      value += row.quantity * row.last_price;
    });

    const pnl = value - investment;

    return {
      investment,
      value,
      pnl,
      percent: investment !== 0 ? (pnl / investment) * 100 : 0,
    };
  }, [currentHoldings]);

  /* ================= Columns ================= */

  /* ================= Columns ================= */

  const columns: ColumnsType<HoldingRow> = [
    {
      title: "Trading Symbol",
      dataIndex: "tradingsymbol",
      render: (v) => <span className="font-semibold text-gray-800">{v}</span>,
    },
    {
      title: "Client ID",
      // Assuming Client ID is '1' as per your image
      render: () => <span className="text-blue-500"> {clientId}</span>,
    },
    {
      title: "Client Name",
      // Pulling name from the selectedClient string (e.g., "1_Dhruv Bhavsar")
      render: () => <span>{clientName}</span>,
    },
    {
      title: "Qty",
      dataIndex: "quantity",
      align: "right",
      render: (v) => (
        // Matches the specific green color for quantity in the image
        <span className="font-semibold" style={{ color: "#26a69a" }}>
          {v}
        </span>
      ),
    },
    {
      title: "Avg Price",
      dataIndex: "average_price",
      align: "right",
      render: (v) => <span>{v.toFixed(2)}</span>,
    },
    {
      title: "LTP",
      dataIndex: "last_price",
      align: "right",
      render: (v) => <span>{v.toFixed(2)}</span>,
    },
    {
      title: "PNL",
      dataIndex: "pnl",
      align: "right",
      render: (v) => (
        <span className={v >= 0 ? "text-green-600" : "text-red-600"}>
          {v.toFixed(2)}
        </span>
      ),
    },
    {
      title: "Day Change",
      dataIndex: "day_change",
      align: "right",
      render: (v) => (
        <span className={v >= 0 ? "text-green-600" : "text-red-600"}>
          {v.toFixed(2)}
        </span>
      ),
    },
    {
      title: "Day (%)",
      dataIndex: "day_change_percentage",
      align: "right",
      render: (v) => (
        <span className={v >= 0 ? "text-green-600" : "text-red-600"}>
          {v.toFixed(2)}%
        </span>
      ),
    },
  ];

  /* ================= Loading ================= */

  if (loading) {
    return <Loader />;
  }

  /* ================= UI ================= */

  return (
    <div className="bg-gray-100 min-h-screen p-3">
      <Card size="small" className="shadow-sm rounded-lg">
        {/* Header */}
        <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
          <Text strong className="text-base">
            Holdings
          </Text>

          <Select
            size="small"
            value={selectedClient}
            style={{ minWidth: 220 }}
            onChange={(v) => setSelectedClient(v)}
            options={Object.keys(data).map((client) => ({
              label: client,
              value: client,
            }))}
          />
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
          <Card size="small">
            <Text type="secondary">Investment</Text>
            <div className="text-sm font-semibold">
              ₹{summary.investment.toLocaleString("en-IN")}
            </div>
          </Card>

          <Card size="small">
            <Text type="secondary">Current Value</Text>
            <div className="text-sm font-semibold">
              ₹{summary.value.toLocaleString("en-IN")}
            </div>
          </Card>

          <Card size="small">
            <Text type="secondary">Total P&L</Text>

            <div
              className={`text-sm font-semibold ${
                summary.pnl >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              ₹{summary.pnl.toFixed(2)}
            </div>
          </Card>

          <Card size="small">
            <Text type="secondary">Return %</Text>

            <div
              className={`text-sm font-semibold ${
                summary.percent >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {summary.percent.toFixed(2)}%
            </div>
          </Card>
        </div>

        {/* Table */}

        <Table
          rowKey={(r) => r.tradingsymbol}
          columns={columns}
          dataSource={currentHoldings}
          pagination={false}
          size="small"
          bordered
          scroll={{ x: "max-content", y: 520 }}
          className="compact-holding-table"
        />
      </Card>
    </div>
  );
}
