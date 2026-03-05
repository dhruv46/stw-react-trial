import {
  Table,
  Card,
  Spin,
  Typography,
  Button,
  DatePicker,
  Dropdown,
  Checkbox,
} from "antd";

import { useState, useEffect } from "react";
import dayjs, { Dayjs } from "dayjs";
import type { ColumnsType, ColumnType } from "antd/es/table";
import {
  fetchAllPnlStatement,
  downloadPnlStatementCsv,
} from "../../services/SettingsService/pnlReportService";

const { Title } = Typography;
const { RangePicker } = DatePicker;

// Updated interface to strictly match your provided JSON response
interface ChargeRow {
  key: number;
  id: number;
  trade: string;
  broker: string;
  exch_order_id: string;
  client_id: number;
  name: string;
  created_date: number;
  order_id: string;
  strategy_signal: string;
  last_traded_quantity: number;
  avg_traded_price: number;
  trade_value: number; // Maps to Turnover
  brokerage: number;
  stt_ctt: number;
  transaction_charges_nse: number;
  transaction_charges_bse: number;
  gst: number;
  stamp_charges: number;
  inv_protection_charges: number;
  clearing_charges: number;
  sebi_charges: number;
  total_charges: number;
}

const Charges = () => {
  const [chargesData, setChargesData] = useState<ChargeRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageSize, setPageSize] = useState(50);
  const [pageNum, setPageNum] = useState(1);
  const [dateRange, setDateRange] = useState<
    [Dayjs | null, Dayjs | null] | null
  >([dayjs(), dayjs()]);
  const [totalRows, setTotalRows] = useState(0);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);

  const loadCharges = async (
    page = pageNum,
    size = pageSize,
    selectedDates = dateRange,
  ) => {
    try {
      setLoading(true);

      let start_date = dayjs().format("YYYY-MM-DD");
      let end_date = dayjs().format("YYYY-MM-DD");

      if (selectedDates && selectedDates[0] && selectedDates[1]) {
        start_date = dayjs(selectedDates[0]).format("YYYY-MM-DD");
        end_date = dayjs(selectedDates[1]).format("YYYY-MM-DD");
      }

      const res = await fetchAllPnlStatement({
        start_date,
        end_date,
        csv: false,
        page_size: size,
        page_num: page,
      });

      // Extract from the specific JSON structure ("result" array)
      const apiData = res?.result || [];

      const rows = apiData.map((item: any, index: number) => ({
        key: item.id || index,
        ...item,
      }));

      setChargesData(rows);

      // Calculate total rows based on "pageable" object in JSON
      if (res?.pageable) {
        setTotalRows(res.pageable.total_page * res.pageable.page_size);
      } else {
        setTotalRows(rows.length);
      }
    } catch (err) {
      console.error("Charges API Error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCharges();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Helper function to format numbers cleanly
  const renderNumber = (val: number) =>
    val !== undefined && val !== null ? val.toFixed(2) : "0.00";

  /* ================= COLUMNS ================= */
  const columns: ColumnsType<ChargeRow> = [
    {
      title: "Trade",
      dataIndex: "trade",
      width: 170,
    },
    {
      title: "Broker",
      dataIndex: "broker",
      width: 100,
      align: "center",
      className: "capitalize",
    },
    { title: "Exch Order Id", dataIndex: "exch_order_id", width: 170 },
    {
      title: "Client ID",
      dataIndex: "client_id",
      width: 140,
      render: (_, record) => `${record.client_id} - ${record.name || ""}`,
    },
    {
      title: "Created Date",
      dataIndex: "created_date",
      width: 130,
      render: (val) => (val ? dayjs(val).format("DD MMM YY") : "-"),
    },
    { title: "Order ID", dataIndex: "order_id", width: 100 },
    {
      title: "Signal",
      dataIndex: "strategy_signal",
      width: 80,
      align: "center",
      render: (val) => (
        <span
          className={`font-semibold ${val === "BUY" ? "text-green-600" : val === "SELL" ? "text-red-500" : ""}`}
        >
          {val}
        </span>
      ),
    },
    {
      title: "Last Traded Quantity",
      dataIndex: "last_traded_quantity",
      width: 140,
      align: "right",
    },
    {
      title: "Avg Traded Price",
      dataIndex: "avg_traded_price",
      width: 130,
      align: "right",
      render: renderNumber,
    },
    {
      title: "Turnover",
      dataIndex: "trade_value",
      width: 120,
      align: "right",
      render: renderNumber,
    },
    {
      title: "Brokerage",
      dataIndex: "brokerage",
      width: 100,
      align: "right",
      render: renderNumber,
    },
    {
      title: "STT CTT",
      dataIndex: "stt_ctt",
      width: 90,
      align: "right",
      render: renderNumber,
    },
    {
      title: "Txn. Charges NSE",
      dataIndex: "transaction_charges_nse",
      width: 130,
      align: "right",
      render: renderNumber,
    },
    {
      title: "Txn. Charges BSE",
      dataIndex: "transaction_charges_bse",
      width: 130,
      align: "right",
      render: renderNumber,
    },
    {
      title: "GST",
      dataIndex: "gst",
      width: 80,
      align: "right",
      render: renderNumber,
    },
    {
      title: "Stamp Charges",
      dataIndex: "stamp_charges",
      width: 110,
      align: "right",
      render: renderNumber,
    },
    {
      title: "Inv Protection Charges",
      dataIndex: "inv_protection_charges",
      width: 150,
      align: "right",
      render: renderNumber,
    },
    {
      title: "Clearing Charges",
      dataIndex: "clearing_charges",
      width: 120,
      align: "right",
      render: renderNumber,
    },
    {
      title: "Sebi Charges",
      dataIndex: "sebi_charges",
      width: 100,
      align: "right",
      render: renderNumber,
    },
    {
      title: "Total Charges",
      dataIndex: "total_charges",
      width: 110,
      align: "right",
      //   fixed: "right",
      render: (val) => (
        <span className="font-bold text-gray-800">{renderNumber(val)}</span>
      ),
    },
  ];
  useEffect(() => {
    const allCols = columns
      .map((col) => ("dataIndex" in col ? col.dataIndex : null))
      .filter(Boolean) as string[];
    setVisibleColumns(allCols);
  }, []);
  const filteredColumns = columns.filter((col) =>
    "dataIndex" in col
      ? visibleColumns.includes(col.dataIndex as string)
      : true,
  );
  const columnFilterMenu = (
    <div className="bg-white p-3 shadow rounded max-h-[300px] overflow-auto">
      <Checkbox.Group
        value={visibleColumns}
        onChange={(checkedValues) => {
          setVisibleColumns(checkedValues as string[]);
        }}
      >
        <div className="flex flex-col gap-2">
          {columns
            .filter((col): col is ColumnType<ChargeRow> => "dataIndex" in col)
            .map((col) => (
              <Checkbox
                key={col.dataIndex as string}
                value={col.dataIndex as string}
              >
                {col.title as string}
              </Checkbox>
            ))}
        </div>
      </Checkbox.Group>
    </div>
  );

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
        <div className="px-4 py-3 border-b bg-white rounded-t-xl">
          <div className="flex flex-col md:flex-row sm:items-center justify-between gap-4">
            {/* TITLE */}
            <Title level={3} className="!m-0 text-gray-700 font-normal">
              Charges
            </Title>

            {/* RIGHT SIDE CONTROLS */}
            <div className="flex flex-col md:flex-row gap-3">
              {/* ================= DESKTOP UI (UNCHANGED) ================= */}
              <div className="hidden md:flex items-end gap-3">
                <div className="custom-field-group">
                  <label>Enter a date range</label>
                  <RangePicker
                    value={dateRange}
                    format="DD/MM/YYYY"
                    className="custom-range-picker w-[260px]"
                    onChange={(dates) => {
                      setDateRange(dates);
                      setPageNum(1);
                      loadCharges(1, pageSize, dates);
                    }}
                  />
                </div>

                <Button
                  className="flex-1 text-blue-600 border-gray-300 font-medium h-[32px]"
                  onClick={() => {
                    let start_date = dayjs().format("YYYY-MM-DD");
                    let end_date = dayjs().format("YYYY-MM-DD");

                    if (dateRange && dateRange[0] && dateRange[1]) {
                      start_date = dayjs(dateRange[0]).format("YYYY-MM-DD");
                      end_date = dayjs(dateRange[1]).format("YYYY-MM-DD");
                    }

                    downloadPnlStatementCsv({
                      start_date,
                      end_date,
                      page_size: pageSize,
                      page_num: pageNum,
                    });
                  }}
                >
                  Download CSV
                </Button>

                <Dropdown
                  trigger={["click"]}
                  dropdownRender={() => columnFilterMenu}
                >
                  <Button className="text-blue-600 border-blue-200 bg-blue-50/30 font-medium h-[32px]">
                    Columns Filter
                  </Button>
                </Dropdown>
              </div>

              {/* ================= MOBILE UI ================= */}
              <div className="flex flex-col gap-2 md:hidden">
                {/* DATE PICKERS */}
                <div className="flex gap-2">
                  <div className="flex flex-col w-full">
                    <label className="text-[10px] text-gray-500">
                      Start Date
                    </label>
                    <DatePicker
                      value={dateRange?.[0]}
                      format="DD/MM/YYYY"
                      onChange={(date) => {
                        const newRange: [Dayjs | null, Dayjs | null] = [
                          date,
                          dateRange?.[1] ?? null,
                        ];

                        setDateRange(newRange);
                        setPageNum(1);
                        loadCharges(1, pageSize, newRange);
                      }}
                    />
                  </div>

                  <div className="flex flex-col w-full">
                    <label className="text-[10px] text-gray-500">
                      End Date
                    </label>
                    <DatePicker
                      value={dateRange?.[1]}
                      format="DD/MM/YYYY"
                      onChange={(date) => {
                        const newRange: [Dayjs | null, Dayjs | null] = [
                          dateRange?.[0] ?? null,
                          date,
                        ];

                        setDateRange(newRange);
                        setPageNum(1);
                        loadCharges(1, pageSize, newRange);
                      }}
                    />
                  </div>
                </div>

                {/* MOBILE BUTTONS */}
                <div className="flex gap-2">
                  <Button
                    className="flex-1 text-blue-600 border-gray-300 font-medium h-[32px]"
                    onClick={() => {
                      let start_date = dayjs().format("YYYY-MM-DD");
                      let end_date = dayjs().format("YYYY-MM-DD");

                      if (dateRange && dateRange[0] && dateRange[1]) {
                        start_date = dayjs(dateRange[0]).format("YYYY-MM-DD");
                        end_date = dayjs(dateRange[1]).format("YYYY-MM-DD");
                      }

                      const url = `https://stw.coupsoft.com/api/fetch_all_pnl_statement?start_date=${start_date}&end_date=${end_date}&csv=true&page_size=${pageSize}&page_num=${pageNum}`;
                      window.open(url, "_blank");
                    }}
                  >
                    Download CSV
                  </Button>

                  <Dropdown
                    trigger={["click"]}
                    dropdownRender={() => columnFilterMenu}
                  >
                    <Button className="flex-1 text-blue-600 border-blue-200 bg-blue-50/30 font-medium h-[32px]">
                      Columns Filter
                    </Button>
                  </Dropdown>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="flex-1 overflow-hidden bg-white">
          <div className="h-full w-full">
            <Spin spinning={loading} className="h-full">
              <Table
                size="small"
                columns={filteredColumns}
                dataSource={chargesData}
                pagination={{
                  pageSize: pageSize,
                  current: pageNum,
                  total: totalRows,
                  showSizeChanger: true,
                  pageSizeOptions: ["50", "100", "200"],
                  onChange: (page, size) => {
                    setPageNum(page);
                    setPageSize(size);
                    loadCharges(page, size);
                  },
                  showTotal: (total, range) =>
                    `${range[0]} to ${range[1]} of ${total}`,
                  className: "px-4",
                }}
                sticky
                tableLayout="auto"
                scroll={{
                  x: "max-content",
                  y: "calc(100vh - 220px)",
                }}
                className="charges-table"
                locale={{
                  emptyText: "No Rows To Show",
                }}
              />
            </Spin>
          </div>
        </div>
      </Card>

      {/* COMPACT TABLE & FIELD STYLES */}
      <style>
        {`
/* ================= FIELD ================= */
.custom-field-group {
  position: relative;
  padding-top: 5px;
}
.custom-field-group label {
  position: absolute;
  top: -5px;
  left: 8px;
  background: white;
  padding: 0 4px;
  font-size: 10px;
  color: #64748b;

}
.custom-range-picker {
  height: 32px !important;
  border-radius: 6px !important;
}

/* ================= TABLE ================= */
.charges-table .ant-table {
  font-size: 11px;
}
.charges-table .ant-table-thead > tr > th {
  background: white !important;
  font-size: 11px;
  font-weight: 700;
  padding: 8px 12px !important;
  height: 36px;
  line-height: 1.2;
  white-space: nowrap;
  border-bottom: 1px solid #f0f0f0;
  z-index: 1 !important;
}
.charges-table .ant-table-tbody > tr > td {
  padding: 4px 12px !important;
  height: 32px;
  font-size: 11px;
  white-space: nowrap;
}
.charges-table .ant-table-placeholder .ant-empty-description {
  color: #333;
  font-size: 13px;
  margin-top: 20px;
}
.charges-table .ant-table-body::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
.charges-table .ant-table-body::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 6px;
}
.capitalize {
  text-transform: capitalize;
}
  .charges-table .ant-table-sticky-holder {
  z-index: 1 !important;
}
`}
      </style>
    </div>
  );
};

export default Charges;
