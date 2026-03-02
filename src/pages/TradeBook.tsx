import React, { useEffect, useMemo, useState } from "react";
import {
  Table,
  Typography,
  Card,
  Spin,
  DatePicker,
  Select,
  Button,
  Dropdown,
  Checkbox,
  Modal,
  Upload,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  fetchTradeBookApi,
  insertTradeBookCsvApi,
} from "../services/tradebookApi";
import { getEnabledClientList } from "../services/SettingsService/userSettingsApi";
import dayjs from "dayjs";

const { Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { Dragger } = Upload;
// ================================
// Types
// ================================
interface TradeBookRow {
  key: string;
  broker: string;
  instrument: string;
  side: "BUY" | "SELL";
  qty: number;
  price: number;
  pdtType: string;
  orderType: string;
  tradeId: string;
  orderStatus: string;
  orderId: string;
  exchOrderId: string;
  exchTs: string;
  tradeDate: string;
  portfolio: string;
  contractNoteId: string;
  nature: string;
  remarks: string;
}

export default function TradeBook() {
  const [data, setData] = useState<TradeBookRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    startDate: dayjs().format("YYYY-MM-DD"),
    endDate: dayjs().format("YYYY-MM-DD"),
    broker: "All",
    status: "All",
  });
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [mode, setMode] = useState("live");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadClient, setUploadClient] = useState(null);
  const [uploadBroker, setUploadBroker] = useState(null);
  const [clientOptions, setClientOptions] = useState<any[]>([]);
  const [fileList, setFileList] = useState<any[]>([]);
  const [csvData, setCsvData] = useState<string[][]>([]); // CSV parsed data
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  // ================================
  // Fetch Clients for Modal Dropdown
  // ================================
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await getEnabledClientList();
        if (res?.data.result) {
          const options = res.data.result.map((c: any) => ({
            label: c.name,
            value: c.id,
          }));
          setClientOptions(options);
        }
      } catch (error) {
        console.error("Failed to fetch clients:", error);
      }
    };
    fetchClients();
  }, []);
  // ================================
  // Fetch API
  // ================================
  const loadTradeBook = async () => {
    try {
      setLoading(true);

      const res = await fetchTradeBookApi(
        filters.startDate,
        filters.endDate,
        false,
        "live",
      );

      // ✅ adjust according backend response
      const apiData = res.data?.result || res.data?.data || [];

      const formatted: TradeBookRow[] = apiData.map(
        (item: any, index: number) => ({
          key: index.toString(),
          broker: item.broker ?? "-",
          instrument: item.instrument ?? "-",
          side: item.side ?? "BUY",
          qty: item.quantity ?? 0, // <-- corrected
          price: Number(item.price ?? 0),
          pdtType: item.product_type ?? "-", // <-- corrected
          orderType: item.order_type ?? "-",
          tradeId: item.trade_id ?? "-",
          orderStatus: item.order_status ?? "-",
          orderId: item.order_id ?? "-",
          exchOrderId: item.exchange_order_id ?? "-", // <-- corrected
          exchTs: item.exchange_timestamp
            ? new Date(item.exchange_timestamp)
                .toLocaleString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: true,
                })
                .replace(/\//g, " ")
                .replace(",", ",") // Adjusting separator to match your image
            : "-",

          tradeDate: item.trade_date
            ? new Intl.DateTimeFormat("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }).format(new Date(item.trade_date))
            : "-",
          portfolio: item.portfolio ?? "-",
          contractNoteId: item.contract_note_id ?? "-",
          nature: item.nature ?? "-",
          remarks: item.remarks ?? "-",
        }),
      );

      setData(formatted);
    } catch (error) {
      console.error("TradeBook API Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTradeBook();
  }, [filters]);

  // ================================
  // Filter Handlers
  // ================================
  const handleDateChange = (
    dates: (dayjs.Dayjs | null)[] | null,
    dateStrings: [string, string],
  ) => {
    if (dates && dates[0] && dates[1]) {
      setFilters({
        ...filters,
        startDate: dates[0].format("YYYY-MM-DD"),
        endDate: dates[1].format("YYYY-MM-DD"),
      });
    }
  };

  const handleBrokerChange = (value: string) => {
    setFilters({ ...filters, broker: value });
  };

  const handleDownload = () => {
    // Implement CSV download logic here
    const csvContent = generateCSV(data);
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tradebook_${filters.startDate}_to_${filters.endDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const generateCSV = (tradeData: TradeBookRow[]) => {
    const headers = [
      "Broker",
      "Instrument",
      "Side",
      "Qty",
      "Price",
      "Pdt",
      "Order Type",
      "Trade ID",
      "Status",
      "Order ID",
      "Exch Order ID",
      "Exch Ts",
      "Trade Date",
      "Portfolio",
      "Contract Note",
      "Nature",
      "Remarks",
    ];

    const csvRows = tradeData.map((row) => [
      row.broker,
      row.instrument,
      row.side,
      row.qty,
      row.price,
      row.pdtType,
      row.orderType,
      row.tradeId,
      row.orderStatus,
      row.orderId,
      row.exchOrderId,
      row.exchTs,
      row.tradeDate,
      row.portfolio,
      row.contractNoteId,
      row.nature,
      row.remarks,
    ]);

    return [headers, ...csvRows].map((row) => row.join(",")).join("\n");
  };

  // ================================
  // Columns (unchanged)
  // ================================
  const allColumns: ColumnsType<TradeBookRow> = useMemo(
    () => [
      {
        title: "Broker",
        dataIndex: "broker",
        key: "broker",
        width: 120,
        render: (v) => <Text strong>{v}</Text>,
      },
      {
        title: "Instrument",
        dataIndex: "instrument",
        key: "instrument",
        width: 170,
        ellipsis: true,
      },
      {
        title: "Side",
        dataIndex: "side",
        key: "side",
        width: 80,
        align: "center",
        render: (side) => (
          <span
            className={`px-2 py-[2px] rounded-md text-xs font-semibold ${
              side === "BUY"
                ? "bg-green-50 text-green-600"
                : "bg-red-50 text-red-600"
            }`}
          >
            {side}
          </span>
        ),
      },
      {
        title: "Qty",
        dataIndex: "qty",
        key: "qty",
        width: 80,
        align: "right",
      },
      {
        title: "Price",
        dataIndex: "price",
        key: "price",
        width: 110,
        align: "right",
        render: (v) => v.toLocaleString(),
      },
      {
        title: "Pdt",
        dataIndex: "pdtType",
        key: "pdtType",
        width: 90,
        align: "center",
      },
      {
        title: "Order Type",
        dataIndex: "orderType",
        key: "orderType",
        width: 120,
        align: "center",
      },
      {
        title: "Trade ID",
        dataIndex: "tradeId",
        key: "tradeId",
        width: 140,
      },
      {
        title: "Status",
        dataIndex: "orderStatus",
        key: "orderStatus",
        width: 140,
      },
      {
        title: "Order ID",
        dataIndex: "orderId",
        key: "orderId",
        width: 150,
      },
      {
        title: "Exch Order ID",
        dataIndex: "exchOrderId",
        key: "exchOrderId",
        width: 170,
      },
      {
        title: "Exch Ts",
        dataIndex: "exchTs",
        key: "exchTs",
        width: 160,
        align: "center",
      },
      {
        title: "Trade Date",
        dataIndex: "tradeDate",
        key: "tradeDate",
        width: 140,
      },
      {
        title: "Portfolio",
        dataIndex: "portfolio",
        key: "portfolio",
        width: 120,
      },
      {
        title: "Contract Note",
        dataIndex: "contractNoteId",
        key: "contractNoteId",
        width: 180,
      },
      {
        title: "Nature",
        dataIndex: "nature",
        key: "nature",
        width: 120,
      },
      {
        title: "Remarks",
        dataIndex: "remarks",
        key: "remarks",
        width: 200,
        ellipsis: true,
      },
    ],
    [],
  );

  // ================================
  // Visible Columns
  // ================================
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    allColumns.map((c) => c.key as string),
  );

  // ================================
  // Filter Visible Columns
  // ================================
  const columns = useMemo(() => {
    return allColumns.filter((col) =>
      visibleColumns.includes(col.key as string),
    );
  }, [visibleColumns]);

  // ================================
  // Column Menu
  // ================================
  const columnMenu = (
    <div className="bg-white shadow-lg rounded-lg p-3 max-h-[400px] overflow-auto">
      {allColumns.map((col) => (
        <div key={col.key} className="py-1">
          <Checkbox
            checked={visibleColumns.includes(col.key as string)}
            onChange={(e) => {
              const checked = e.target.checked;

              // prevent removing last column
              if (!checked && visibleColumns.length === 1) return;

              setVisibleColumns((prev) =>
                checked
                  ? [...prev, col.key as string]
                  : prev.filter((k) => k !== col.key),
              );
            }}
          >
            {col.title as string}
          </Checkbox>
        </div>
      ))}
    </div>
  );
  const uploadProps = {
    name: "file",
    multiple: false,
    accept: ".csv",
    fileList,
    beforeUpload: (file: File) => {
      if (file.size / 1024 / 1024 > 10) {
        message.error("File must be smaller than 10MB");
        return Upload.LIST_IGNORE;
      }
      return true;
    },
    onChange: (info: any) => setFileList(info.fileList.slice(-1)),
    onRemove: () => setFileList([]),
  };

  // ================== Next Button ==================
  const handleNext = () => {
    if (!uploadClient || !uploadBroker || fileList.length === 0) {
      message.error("Select client, broker, and upload file.");
      return;
    }

    const uploadedFile = fileList[0].originFileObj!;
    const brokerValue = String(uploadBroker).toLowerCase();
    const fileName = uploadedFile.name.toLowerCase();

    // Validate broker name in file
    if (!fileName.includes(brokerValue)) {
      message.error(
        `The uploaded file does not match the selected broker "${uploadBroker}".`,
      );
      return;
    }

    // Parse CSV and show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const rows = text.split("\n").map((row) => row.split(","));
      setCsvData(rows);
      setIsModalOpen(false);
      setIsPreviewOpen(true);
    };
    reader.readAsText(uploadedFile);
  };
  return (
    <div className="h-full flex flex-col bg-slate-100 p-2 sm:p-4 relative z-0">
      <Card
        style={{ flex: 1 }} // optional: replaces h-full
        className="flex flex-col rounded-2xl shadow-sm"
        variant="borderless" // ✅ replaces bordered={false}
        styles={{ body: { padding: 0 } }} // replaces bodyStyle
      >
        {/* ================= HEADER ================= */}
        {/* ================= HEADER ================= */}
        <div className="px-5 py-3 border-b bg-white rounded-t-2xl">
          {/* MOBILE DESIGN */}
          <div className="flex flex-col gap-3 lg:hidden">
            {/* Header Title + Mode */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Text strong className="text-[15px] text-gray-800">
                  Trade Book
                </Text>
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

              <Button
                size="small"
                icon={<i className="ri-download-line"></i>}
                onClick={handleDownload}
              >
                CSV
              </Button>
            </div>

            {/* Date Range */}
            <div className="space-y-1.5">
              {/* Start Date */}
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="w-4 text-green-500 font-semibold">→</span>
                <span>Start Date</span>
              </div>
              <DatePicker
                size="small"
                value={dayjs(filters.startDate)}
                onChange={(date) =>
                  setFilters({
                    ...filters,
                    startDate: date
                      ? date.format("YYYY-MM-DD")
                      : filters.startDate,
                  })
                }
                style={{ width: "100%" }}
                placeholder="Start Date"
                format="YYYY-MM-DD"
              />

              {/* End Date */}
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="w-4 text-red-500 font-semibold">←</span>
                <span>End Date</span>
              </div>
              <DatePicker
                size="small"
                value={dayjs(filters.endDate)}
                onChange={(date) =>
                  setFilters({
                    ...filters,
                    endDate: date ? date.format("YYYY-MM-DD") : filters.endDate,
                  })
                }
                style={{ width: "100%" }}
                placeholder="End Date"
                format="YYYY-MM-DD"
              />
            </div>

            {/* Broker */}
            <div className="flex flex-col">
              <span className="text-[11px] text-gray-500 mb-[2px]">Broker</span>
              <Select
                value={filters.broker}
                onChange={handleBrokerChange}
                size="small"
                allowClear
                className="w-full"
                placeholder="All Brokers"
              >
                <Option value="All">All Brokers</Option>
                <Option value="iifl">IIFL</Option>
                <Option value="mastertrust">MasterTrust</Option>
                <Option value="zerodha">ZERODHA</Option>
                <Option value="greeksoft">Greek Soft</Option>
              </Select>
            </div>
          </div>

          {/* DESKTOP DESIGN */}
          <div className="hidden lg:flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            {/* LEFT SECTION */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full">
              {/* TITLE */}
              <div className="flex items-center gap-3 shrink-0">
                <Text strong className="text-[16px] text-gray-800">
                  Trade Book
                </Text>
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

              {/* FILTERS */}
              <div className="flex flex-wrap items-center gap-2 w-full">
                {/* Date Range */}
                <div className="w-full sm:w-[240px]">
                  <RangePicker
                    size="small"
                    value={[dayjs(filters.startDate), dayjs(filters.endDate)]}
                    onChange={(dates) =>
                      setFilters({
                        ...filters,
                        startDate: dates?.[0]
                          ? dates[0].format("YYYY-MM-DD")
                          : filters.startDate,
                        endDate: dates?.[1]
                          ? dates[1].format("YYYY-MM-DD")
                          : filters.endDate,
                      })
                    }
                    style={{ width: "100%" }}
                    format="YYYY-MM-DD"
                  />
                </div>

                {/* Broker */}
                <div className="w-1/2 sm:w-[180px]">
                  <Select
                    size="small"
                    value={filters.broker}
                    style={{ width: "100%" }}
                    onChange={handleBrokerChange}
                    options={[
                      { label: "All Brokers", value: "All" },
                      { label: "IIFL", value: "iifl" },
                      { label: "MasterTrust", value: "mastertrust" },
                      { label: "ZERODHA", value: "zerodha" },
                      { label: "Greek Soft", value: "greeksoft" },
                    ]}
                  />
                </div>
              </div>
            </div>

            {/* RIGHT ACTIONS */}
            <div className="flex justify-end items-center w-full lg:w-auto gap-2">
              <Button
                icon={<i className="ri-download-line"></i>}
                onClick={handleDownload}
                size="middle"
                className="bg-emerald-600 text-white border-none hover:!bg-emerald-700 flex items-center gap-1 shadow-sm"
              >
                CSV
              </Button>

              <Button
                icon={<i className="ri-upload-2-line"></i>}
                className="bg-blue-600 text-white border-none"
                onClick={() => setIsModalOpen(true)}
              >
                Upload
              </Button>

              <Dropdown trigger={["click"]} popupRender={() => columnMenu}>
                <Button icon={<i className="ri-filter-3-line" />}>
                  Columns
                </Button>
              </Dropdown>
            </div>
          </div>
        </div>
        {/* Table */}
        {/* Table Wrapper - Ensure p-0 to remove external gaps */}
        <div className="flex-1 overflow-hidden rounded-b-xl border-t border-slate-200 p-0">
          <Table<TradeBookRow>
            columns={columns}
            dataSource={data}
            loading={loading}
            pagination={false}
            size="small"
            sticky
            rowKey="key"
            scroll={{
              x: "max-content",
              y: "calc(100vh - 180px)",
            }}
            className="tradebook-table-compact"
          />
        </div>

        <Modal
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          width={440}
          centered
          closable={false}
          mask={{ closable: false }}
          footer={[
            <Button
              key="cancel"
              onClick={() => setIsModalOpen(false)}
              className="px-4 h-9 font-medium border-gray-200 hover:border-gray-300"
            >
              Cancel
            </Button>,
            <Button
              key="next"
              type="primary"
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-6 h-9 font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ml-2"
              onClick={handleNext} // ✅ use the validated handler
              disabled={!uploadClient || !uploadBroker || fileList.length === 0}
            >
              Next
            </Button>,
          ]}
        >
          <div className="p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center text-white shadow-md">
                  <i className="ri-file-csv-2-line text-lg"></i>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Upload CSV
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Select client & broker then upload file
                  </p>
                </div>
              </div>
              <Button
                type="text"
                icon={<i className="ri-close-line text-gray-400 text-base"></i>}
                onClick={() => setIsModalOpen(false)}
                className="!p-1 hover:bg-gray-100 rounded-full"
              />
            </div>

            {/* Selection */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Client
                </label>
                <Select
                  placeholder="Client"
                  size="middle"
                  className="w-full"
                  onChange={setUploadClient}
                  status={!uploadClient ? "warning" : ""}
                  options={clientOptions}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Broker
                </label>
                <Select
                  placeholder="Broker"
                  size="middle"
                  className="w-full"
                  onChange={setUploadBroker}
                  status={!uploadBroker ? "warning" : ""}
                  options={[
                    { label: "All Brokers", value: "All" },
                    { label: "IIFL", value: "iifl" },
                    { label: "MasterTrust", value: "mastertrust" },
                    { label: "ZERODHA", value: "zerodha" },
                    { label: "Greek Soft", value: "greeksoft" },
                  ]}
                />
              </div>
            </div>

            {/* Upload Area */}
            <Dragger
              {...uploadProps}
              showUploadList={true}
              multiple={false}
              accept=".csv"
            >
              <p className="ant-upload-drag-icon">
                <i className="ri-upload-cloud-2-line text-2xl"></i>
              </p>
              <p className="ant-upload-text">
                Click or drag CSV file to this area to upload
              </p>
              <p className="ant-upload-hint">
                Only .csv files are supported. Max 10MB.
              </p>
            </Dragger>
          </div>
        </Modal>

        <Modal
          open={isPreviewOpen}
          onCancel={() => setIsPreviewOpen(false)}
          title={<span className="text-lg font-bold">Preview CSV Data</span>}
          width={1200}
          centered
          styles={{ body: { padding: 0 } }}
          footer={[
            <Button
              key="close"
              type="primary"
              onClick={() => setIsPreviewOpen(false)}
            >
              Close
            </Button>,
            <Button
              key="upload"
              type="default"
              onClick={async () => {
                if (!uploadClient || !uploadBroker) {
                  message.error(
                    "Please select client and broker before uploading.",
                  );
                  return;
                }

                try {
                  // Construct payload
                  const payload = {
                    broker: String(uploadBroker).toLowerCase(),
                    client: uploadClient,
                    acc_name:
                      clientOptions.find((c) => c.value === uploadClient)
                        ?.label || "",
                    data: csvData.slice(1).map((row) => {
                      const rowObj: any = {};
                      csvData[0].forEach((header, idx) => {
                        rowObj[header.replace(/"/g, "")] =
                          row[idx]?.replace(/"/g, "") ?? "";
                      });
                      return rowObj;
                    }),
                  };

                  // Call API
                  const res = await insertTradeBookCsvApi(payload);

                  if (res?.status === 200) {
                    message.success("CSV uploaded successfully!");
                    setIsPreviewOpen(false);
                    setCsvData([]);
                    setFileList([]);
                    setUploadBroker(null);
                    setUploadClient(null);
                  } else {
                    message.error("Upload failed. Please try again.");
                  }
                } catch (err) {
                  console.error("Upload Error:", err);
                  message.error(
                    "Upload failed. Please check console for details.",
                  );
                }
              }}
            >
              Upload
            </Button>,
          ]}
        >
          <div className="overflow-x-auto border-t border-gray-100">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                <tr>
                  {csvData[0]?.map((header, i) => (
                    <th
                      key={i}
                      className="px-4 py-3 font-semibold uppercase tracking-wider text-gray-500 whitespace-nowrap border-b border-gray-200"
                    >
                      {header.replace(/"/g, "")}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {csvData.slice(1).map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    {row.map((cell, j) => {
                      const cleanCell = cell.replace(/"/g, "");
                      let cellStyle =
                        "px-4 py-3 whitespace-nowrap text-gray-700 text-[11px]";

                      if (cleanCell.toLowerCase() === "buy")
                        cellStyle += " font-bold text-emerald-600";
                      if (cleanCell.toLowerCase() === "sell")
                        cellStyle += " font-bold text-rose-600";
                      if (cleanCell.toLowerCase() === "filled")
                        cellStyle += " text-blue-600 font-medium";

                      return (
                        <td key={j} className={cellStyle}>
                          {cleanCell}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Modal>
      </Card>
      {/* Updated Styling - No Hover Color */}
      <style>{`
  /* ============================================================
     ULTRA-COMPACT TRADING TERMINAL STYLE
     Eliminates gaps between header/rows and minimizes font size.
  ============================================================ */
  
  /* 1. ROOT TABLE & CONTAINER - Force Collapse to Remove Gaps */
  .tradebook-table-compact .ant-table {
    font-family: 'Inter', -apple-system, sans-serif;
    font-size: 11px;
    background: #ffffff;
    margin: 0 !important;
    border-spacing: 0 !important;
    border-collapse: collapse !important;
  }

  /* Fixes the white gap between header and body caused by 'sticky' prop */
  .tradebook-table-compact .ant-table-header,
  .tradebook-table-compact .ant-table-body {
    margin: 0 !important;
    padding: 0 !important;
  }

  .tradebook-table-compact .ant-table-header table,
  .tradebook-table-compact .ant-table-body table {
    border-collapse: collapse !important;
    margin-bottom: 0 !important;
  }

  .tradebook-table-compact .ant-table-container {
    border-radius: 0 !important; 
  }

  /* 2. HEADER - Flat & Dense */
  .tradebook-table-compact .ant-table-thead > tr > th {
    background: #f1f5f9 !important; 
    border-bottom: 1px solid #cbd5e1 !important;
    border-right: 1px solid #e2e8f0 !important;
    font-weight: 600;
    font-size: 10px;
    color: #475569;
    padding: 4px 8px !important;

    text-transform: uppercase;
    letter-spacing: 0.1px;
    white-space: nowrap;
  }

  /* Remove Ant Design default header dividers */
  .tradebook-table-compact .ant-table-thead > tr > th::before {
    display: none !important;
  }

  /* 3. BODY ROWS - High Density */
  .tradebook-table-compact .ant-table-tbody > tr > td {
    padding: 4px 8px !important;
    font-size: 11px;
   
    color: #0f172a;
    border-bottom: 1px solid #f1f5f9 !important;
    border-right: 1px solid #f8fafc !important;
    white-space: nowrap;
  }



  /* First row fix to ensure it touches the header */
  .tradebook-table-compact .ant-table-tbody > tr:first-child > td {
    border-top: none !important;
  }

  /* Zebra Striping */
  .tradebook-table-compact .ant-table-tbody > tr:nth-child(even) {
    background: #fafbfc;
  }

  .tradebook-table-compact .ant-table-tbody > tr:hover > td {
    background: #f1f5f9 !important;
  }

  /* 4. SIDE INDICATORS (BUY/SELL) */
  .tradebook-table-compact .side-buy {
    color: #10b981;
    font-weight: 700;
    background: #f0fdf4;
    padding: 1px 4px;
    border-radius: 4px;
    font-size: 10px;
  }

  .tradebook-table-compact .side-sell {
    color: #ef4444;
    font-weight: 700;
    background: #fef2f2;
    padding: 1px 4px;
    border-radius: 4px;
    font-size: 10px;
  }

  /* 5. SCROLLBAR - Minimalist */
  .tradebook-table-compact .ant-table-body::-webkit-scrollbar {
 
    width: 5px;
  }

  .tradebook-table-compact .ant-table-body::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 10px;
  }

  /* 6. ALIGNMENT */
  .tradebook-table-compact .ant-table-thead > tr > th:first-child,
  .tradebook-table-compact .ant-table-tbody > tr > td:first-child {
    padding-left: 12px !important;
  }
 
`}</style>
    </div>
  );
}
