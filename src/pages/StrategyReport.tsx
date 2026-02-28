import React, { useEffect, useState } from "react";
import {
  Card,
  DatePicker,
  Select,
  Table,
  Spin,
  Button,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { DownloadOutlined } from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import { getSignalReportApi } from "../services/downloadApi";
import { getStrategyListApi } from "../services/orderService";

const { RangePicker } = DatePicker;
const { Title } = Typography;

interface SignalReportRow {
  key: number;
  strategy_name: string;
  entry_type: string;
  entry_time: string;
  entry_price: number;
  entry_signal: string;
  entry_pivot: string;
  exit_pivot: string;
  exit_time: string;
  exit_price: number;
  exit_signal: string;
  exit_type: string;
}

const StrategyReport: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SignalReportRow[]>([]);
  const [strategyId, setStrategyId] = useState<number>(0);
  const [format, setFormat] = useState("Full Format");
  const [strategyOptions, setStrategyOptions] = useState<
    { label: string; value: number }[]
  >([]);
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 1200);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 1200);
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [dates, setDates] = useState({
    start_date: dayjs().format("MM/DD/YYYY"),
    end_date: dayjs().format("MM/DD/YYYY"),
  });
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([
    dayjs(),
    dayjs(),
  ]);

  /* ================= Fetch ================= */

  const fetchReport = async () => {
    try {
      setLoading(true);

      const res = await getSignalReportApi({
        strategy_id: strategyId,
        start_date: dates.start_date,
        end_date: dates.end_date,
      });
      // ✅ detect correct array
      const apiData = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.data?.data)
          ? res.data.data
          : [];

      const mapped = apiData.map((item: any, index: number) => ({
        key: index,
        ...item,
      }));

      setData(mapped);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [strategyId, dates]);

  const fetchStrategies = async () => {
    try {
      const res = await getStrategyListApi();

      const list = Array.isArray(res?.data.result) ? res.data.result : [];

      const options = [
        { label: "All Strategy", value: 0 },
        ...list.map((item: any) => ({
          label: item.name,
          value: item.id,
        })),
      ];

      setStrategyOptions(options);
    } catch (error) {
      console.error("Strategy list error:", error);
    }
  };

  useEffect(() => {
    fetchStrategies();
  }, []);

  // useEffect(() => {
  //   const mockData: SignalReportRow[] = [
  //     {
  //       key: 1,
  //       strategy_name: "N_Man_3",
  //       entry_type: "pivot.3.2 Long",
  //       entry_time: "24-02-2025 11:40:46",
  //       entry_price: 48499.6,
  //       entry_signal: "48495.9",
  //       entry_pivot: "24-02-2025 10:25",
  //       exit_pivot: "24-02-2025 12:06",
  //       exit_time: "24-02-2025 12:15:15",
  //       exit_price: 48508.45,
  //       exit_signal: "48533.7",
  //       exit_type: "pivot.1.1 Long",
  //     },
  //     {
  //       key: 2,
  //       strategy_name: "N_Man_3",
  //       entry_type: "pivot.3.2 Long",
  //       entry_time: "24-02-2025 13:05:22",
  //       entry_price: 48520.2,
  //       entry_signal: "48510.4",
  //       entry_pivot: "24-02-2025 12:45",
  //       exit_pivot: "24-02-2025 13:30",
  //       exit_time: "24-02-2025 13:42:10",
  //       exit_price: 48590.3,
  //       exit_signal: "48600",
  //       exit_type: "Target Hit",
  //     },
  //   ];

  //   setData(mockData);
  // }, []);

  /* ================= Columns ================= */

  const columns: ColumnsType<SignalReportRow> = [
    {
      title: "Strategy",
      dataIndex: "strategy_name",
      align: "left",
      width: 130,
    },
    {
      title: "Entry Type",
      dataIndex: "entry_type",
      width: 160,
    },
    {
      title: "Entry Time",
      dataIndex: "entry_time",
      align: "left",
      width: 170,
    },
    {
      title: "Entry Price",
      dataIndex: "entry_price",
      align: "right",
      width: 120,
    },
    {
      title: "Entry Signal",
      dataIndex: "entry_signal",
      align: "right",
      width: 130,
    },
    {
      title: "Entry Pivot",
      dataIndex: "entry_pivot",
      width: 160,
    },
    {
      title: "Exit Pivot",
      dataIndex: "exit_pivot",
      width: 160,
    },
    {
      title: "Exit Time",
      dataIndex: "exit_time",
      width: 170,
    },
    {
      title: "Exit Price",
      dataIndex: "exit_price",
      align: "right",
      width: 120,
    },
    {
      title: "Exit Signal",
      dataIndex: "exit_signal",
      align: "right",
      width: 130,
    },
    {
      title: "Exit Type",
      dataIndex: "exit_type",
      align: "center",
      width: 150,
    },
  ];

  return (
    <div className="h-[calc(100vh-65px)] bg-slate-100 p-3 overflow-hidden">
      <Card
        size="small"
        className="h-full flex flex-col rounded-xl shadow-sm border border-slate-200 bg-white"
        styles={{
          body: {
            padding: 0,
            height: "100%",
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        {/* ================= HEADER ================= */}

        <div className="bg-slate-50 rounded-t-xl border-b px-3 sm:px-4 py-3 shadow-sm">
          {/* ================= MOBILE DESIGN ================= */}
          {/* ================= MOBILE DESIGN ================= */}
          <div className="flex flex-col gap-3 lg:hidden">
            {/* Header */}
            <div className="flex items-center justify-between">
              <Title level={5} className="!m-0 text-slate-700 font-semibold">
                Strategy Reports
              </Title>

              <Button size="small" icon={<DownloadOutlined />} type="primary">
                Download
              </Button>
            </div>

            {/* ================= DATE FILTER ================= */}
            <div className="space-y-1.5">
              {/* Start Date */}
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                <span className="w-4 text-green-500 font-semibold">→</span>
                <span>Start Date</span>
              </div>

              <DatePicker
                size="small"
                value={dateRange[0]}
                placeholder="Start Date"
                format="DD MMM YYYY"
                style={{ width: "100%" }}
                onChange={(date) => {
                  const updated = [date, dateRange[1]] as [
                    dayjs.Dayjs | null,
                    dayjs.Dayjs | null,
                  ];

                  setDateRange(updated);

                  if (updated[0] && updated[1]) {
                    setDates({
                      start_date: updated[0].format("MM/DD/YYYY"),
                      end_date: updated[1].format("MM/DD/YYYY"),
                    });
                  }
                }}
              />

              {/* End Date */}
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="w-4 text-red-500 font-semibold">←</span>
                <span>End Date</span>
              </div>

              <DatePicker
                size="small"
                value={dateRange[1]}
                placeholder="End Date"
                format="DD MMM YYYY"
                style={{ width: "100%" }}
                onChange={(date) => {
                  const updated = [dateRange[0], date] as [
                    dayjs.Dayjs | null,
                    dayjs.Dayjs | null,
                  ];

                  setDateRange(updated);

                  if (updated[0] && updated[1]) {
                    setDates({
                      start_date: updated[0].format("MM/DD/YYYY"),
                      end_date: updated[1].format("MM/DD/YYYY"),
                    });
                  }
                }}
              />
            </div>

            {/* ================= FILTERS ================= */}
            <div className="flex gap-2">
              {/* Strategy */}
              <Select
                size="small"
                value={strategyId}
                className="flex-1"
                onChange={(val) => setStrategyId(val)}
                options={strategyOptions}
                placeholder="Strategy"
              />

              {/* Format */}
              <Select
                size="small"
                value={format}
                className="flex-1"
                onChange={setFormat}
                options={[
                  { label: "Full Format", value: "Full Format" },
                  { label: "Summary", value: "Summary" },
                ]}
              />
            </div>
          </div>

          {/* ================= DESKTOP DESIGN ================= */}
          <div className="hidden lg:flex items-center justify-between gap-3">
            {/* LEFT */}
            <div className="flex items-center gap-3 flex-wrap">
              <Title level={5} className="!m-0 text-slate-700 font-semibold">
                Strategy Reports
              </Title>

              <div className="h-5 w-px bg-gray-200" />

              <RangePicker
                size="small"
                defaultValue={[dayjs(), dayjs()]}
                format="DD/MM/YYYY"
                style={{ width: 240 }}
                onChange={(value) => {
                  if (!value || !value[0] || !value[1]) return;

                  setDates({
                    start_date: value[0].format("MM/DD/YYYY"),
                    end_date: value[1].format("MM/DD/YYYY"),
                  });
                }}
              />

              <Select
                size="small"
                value={strategyId}
                style={{ width: 180 }}
                onChange={(val) => setStrategyId(val)}
                options={strategyOptions}
              />

              <Select
                size="small"
                value={format}
                style={{ width: 170 }}
                onChange={setFormat}
                options={[
                  { label: "Full Format", value: "Full Format" },
                  { label: "Summary", value: "Summary" },
                ]}
              />
            </div>

            {/* RIGHT */}
            <Button
              size="small"
              icon={<DownloadOutlined />}
              type="primary"
              className="shadow-sm"
            >
              Download CSV
            </Button>
          </div>
        </div>
        {/* ================= TABLE ================= */}

        <div className="flex-1 overflow-hidden p-2 bg-slate-50">
          <div className="h-full rounded-lg bg-white border border-slate-200 overflow-hidden">
            <Spin spinning={loading} className="h-full">
              <Table
                size="small"
                columns={columns}
                dataSource={data}
                pagination={false}
                sticky
                tableLayout="auto"
                scroll={{
                  x: 1000, // total column width
                  y: "calc(100vh - 210px)",
                }}
                className="modern-table"
                // locale={{ emptyText: "No records found" }}
              />
            </Spin>
          </div>
        </div>
      </Card>

      {/* ================= MODERN TABLE STYLE ================= */}

      <style>
        {`
.modern-table .ant-table {
  font-size:11px;
}

/* Header */
.modern-table .ant-table-thead > tr > th {
  background:#f8fafc !important;
  font-size:11px;
  font-weight:600;
  padding:6px 8px !important;
  border-bottom:1px solid #e5e7eb;
  white-space:nowrap;
}

/* Body */
.modern-table .ant-table-tbody > tr > td {
  padding:5px 8px !important;
  font-size:11px;
  border-bottom:1px solid #f1f5f9;
  white-space:nowrap;
}

/* Alternate rows */
.modern-table .ant-table-tbody > tr:nth-child(even){
  background:#fbfdff;
}

/* Hover */
.modern-table .ant-table-tbody > tr:hover > td{
  background:#eef6ff !important;
  transition:.15s;
}

/* Sticky shadow */
.ant-table-sticky-holder {
  box-shadow:0 1px 2px rgba(0,0,0,0.04);
}

/* Smooth scroll */
.ant-table-body{
  scrollbar-width:thin;
}

`}
      </style>
    </div>
  );
};

export default StrategyReport;
