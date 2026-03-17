import React, { useEffect, useState } from "react";
import { Table, Card, Spin, Typography, Button, Space, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { LineChartOutlined, PlusOutlined } from "@ant-design/icons";
import { FiEdit2 } from "react-icons/fi";
import { IoStatsChart } from "react-icons/io5";
import {
  fetchEnabledAutomatedStrategyList,
  getStrategyInstrumentApi,
} from "../services/autoStrategyApi";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";

const { Title } = Typography;

interface StrategyRow {
  id: number; // ✅ ADD THIS
  key: number;
  name: string;
  instrument_name: string;
  ExchangeSegment: string;
  underlying_from: string;
  multileg: boolean;
  strategy_type: string;
  strategy_enabled: boolean;
}

export default function AutoStrategy() {
  const navigate = useNavigate();

  const [strategies, setStrategies] = useState<StrategyRow[]>([]);
  const [loading, setLoading] = useState(false);

  /* ================= FETCH DATA ================= */

  const loadStrategies = async () => {
    try {
      setLoading(true);

      const res = await fetchEnabledAutomatedStrategyList();

      const result = res?.data?.result || [];

      const mapped = result.map((item: any) => ({
        key: item.id, // ✅ important
        ...item,
      }));

      setStrategies(mapped);
    } catch (error) {
      console.error("Error fetching strategies:", error);
      setStrategies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStrategies();
  }, []);

  /* ================= COLUMNS ================= */

  const columns: ColumnsType<StrategyRow> = [
    {
      title: "Name",
      dataIndex: "name",
      render: (text, record) => {
        const handleOpenChart = async () => {
          try {
            const res = await getStrategyInstrumentApi(record.id);

            const result = res?.data;
            if (!result || !Array.isArray(result) || result.length === 0) {
              message.error("No instrument data found");
              return;
            }

            // ✅ Check valid response
            if (Array.isArray(result) && result.length > 0) {
              const url = `/chart/${record.id}?strategyName=${encodeURIComponent(record.name)}`;

              // ✅ Open in new tab
              window.open(url, "_blank", "noopener,noreferrer");
            } else {
              console.warn("No instrument data found");
            }
          } catch (error) {
            console.error("Error fetching strategy instrument:", error);
          }
        };

        return (
          <div className="flex items-center gap-2">
            <div
              className="border p-[2px] rounded cursor-pointer hover:bg-gray-100"
              onClick={handleOpenChart}
            >
              <LineChartOutlined
                style={{ fontSize: "17px" }}
                className="text-blue-500"
              />
            </div>
            {text}
          </div>
        );
      },
    },
    {
      title: "Underlying",
      dataIndex: "instrument_name",
    },
    {
      title: "Exchange",
      dataIndex: "ExchangeSegment",
    },
    {
      title: "Instrument",
      dataIndex: "underlying_from",
    },
    {
      title: "Execution Time",
      render: (_, record) =>
        record.multileg ? "Single Leg" : "Synthetic Future",
    },
    {
      title: "Strategy Type",
      dataIndex: "strategy_type",
    },
    {
      title: "Action",
      align: "center",
      render: (_, record) => (
        <Space size={6}>
          <Button
            size="small"
            type="text"
            icon={<FiEdit2 size={14} />}
            onClick={() => navigate(`/edit-strategy/${record.key}`)}
          />
        </Space>
      ),
    },
  ];

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="max-h-screen bg-slate-100 p-3 overflow-hidden">
      <Card
        size="small"
        className="h-full flex flex-col rounded-xl border bg-white shadow-sm"
        styles={{
          body: {
            padding: 0,
            height: "100%",
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        {/* HEADER */}
        <div className="px-4 py-2 border-b bg-white rounded-t-xl">
          <div className="flex items-center justify-between">
            <Title level={4} className="!m-0 !font-bold">
              Strategy List
            </Title>

            <Button
              type="primary"
              icon={<PlusOutlined />}
              className="bg-blue-600 font-semibold"
              onClick={() => navigate("/add-auto-strategy")}
            >
              Add New Strategy
            </Button>
          </div>
        </div>

        {/* TABLE */}
        <div className="flex-1 p-2 overflow-hidden bg-slate-50">
          <div className="h-full bg-white rounded-lg border overflow-hidden">
            <Spin spinning={loading} className="h-full">
              <Table
                size="small"
                columns={columns}
                dataSource={strategies}
                pagination={false}
                sticky
                tableLayout="auto"
                rowClassName={(record) =>
                  record.strategy_enabled ? "strategy-enabled-row" : ""
                }
                scroll={{
                  x: 900,
                  y: "calc(100vh - 220px)",
                }}
                className="strategy-table"
              />
            </Spin>
          </div>
        </div>
      </Card>

      {/* STYLE */}
      <style>
        {`
/* ================= TABLE ================= */

.strategy-table .ant-table {
  font-size: 11px;
}

/* HEADER */

.strategy-table .ant-table-thead > tr > th {
  background: #f8fafc !important;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 6px !important;
  height: 32px;
}

/* BODY */

.strategy-table .ant-table-tbody > tr > td {
  padding: 3px 6px !important;
  height: 26px;
  font-size: 11px;
}

/* Highlight Enabled Strategy */

.strategy-enabled-row td {
  background-color: #E6E6E6 !important;
}





/* Scrollbar */

.strategy-table .ant-table-body::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.strategy-table .ant-table-body::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 6px;
}

`}
      </style>
    </div>
  );
}
