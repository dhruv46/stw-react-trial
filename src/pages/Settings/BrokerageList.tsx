import React, { useState, useEffect } from "react";
import {
  Table,
  Card,
  Spin,
  Typography,
  Button,
  DatePicker,
  Select,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { FiEdit2 } from "react-icons/fi";
import {
  fetchBrokerCharges,
  getClientListApi,
  getBrokerListApi,
} from "../../services/SettingsService/brokerageSettingAPi";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

// Mapped exactly to your JSON response
interface BrokerageRow {
  key: number;
  id: number;
  client_id: number;
  client_name: string;
  broker: string;
  type: string;
  start_date: number;
  end_date: number;
  buy_brokerage_order: number;
  sell_brokerage_order: number;
  buy_brokerage_lot_size: number;
  sell_brokerage_lot_size: number;
  buy_brokerage_percentage: number;
  sell_brokerage_percentage: number;
  buy_stt_ctt: number;
  sell_stt_ctt: number;
  buy_transaction_charges_nse: number;
  sell_transaction_charges_nse: number;
  buy_transaction_charges_bse: number;
  sell_transaction_charges_bse: number;
  buy_gst: number;
  sell_gst: number;
  buy_stamp_charges_percentage: number;
  sell_stamp_charges_percentage: number;
  buy_stamp_charges_flat: number;
  sell_stamp_charges_flat: number;
  buy_inv_protection_charges: number;
  sell_inv_protection_charges: number;
  buy_clearing_charges: number;
  sell_clearing_charges: number;
  buy_sebi_charges: number;
  sell_sebi_charges: number;
}

interface ClientOption {
  id: number;
  name: string;
}

interface BrokerOption {
  name: string;
  full_name: string;
  type: string;
}

const BrokerageList = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<BrokerageRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageSize, setPageSize] = useState(50);
  const [pageNum, setPageNum] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const getFinancialYearDates = () => {
    const today = dayjs();

    const year = today.month() >= 3 ? today.year() : today.year() - 1;
    // month >= 3 means April (0=Jan)

    const start = dayjs(`${year}-04-01`);
    const end = dayjs(`${year + 1}-03-31`);

    return { start, end };
  };
  const fy = getFinancialYearDates();

  const [startDate, setStartDate] = useState<dayjs.Dayjs | null>(fy.start);
  const [endDate, setEndDate] = useState<dayjs.Dayjs | null>(fy.end);
  const [selectedBroker, setSelectedBroker] = useState("all");
  const [selectedClient, setSelectedClient] = useState<string | number>("all");
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [brokers, setBrokers] = useState<BrokerOption[]>([]);

  const loadData = async () => {
    setLoading(true);

    try {
      const start_date = startDate ? dayjs(startDate).format("YYYY-MM-DD") : "";

      const end_date = endDate ? dayjs(endDate).format("YYYY-MM-DD") : "";

      const res = await fetchBrokerCharges({
        charges_type: "",
        broker: selectedBroker === "all" ? "" : selectedBroker,
        client_id: selectedClient === "all" ? "" : selectedClient,
        start_date,
        end_date,
      });

      const apiData = res?.result || res || [];

      const rows = apiData.map((item: any, index: number) => ({
        key: item.id || index,
        ...item,
      }));

      setData(rows);

      if (res?.pageable) {
        setTotalRows(res.pageable.total_page * res.pageable.page_size);
      } else {
        setTotalRows(rows.length);
      }
    } catch (err) {
      console.error("Brokerage API Error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedClient, selectedBroker]);

  const loadClients = async () => {
    try {
      const res = await getClientListApi();

      const clientData = res?.data.result || [];

      setClients(clientData);
    } catch (err) {
      console.error("Client List API Error", err);
    }
  };

  const loadBrokers = async () => {
    try {
      const res = await getBrokerListApi();

      const brokerData = res?.data.result || [];

      setBrokers(brokerData);
    } catch (err) {
      console.error("Broker List API Error", err);
    }
  };

  useEffect(() => {
    loadClients();
    loadBrokers();
  }, []);

  /* ================= RENDER HELPERS ================= */

  // Renders the inline BUY/SELL format perfectly matching your screenshot
  const renderBuySell = (buyVal: number, sellVal: number) => {
    const buyText =
      buyVal !== undefined && buyVal !== null ? buyVal.toFixed(2) : "0.00";
    const sellText =
      sellVal !== undefined && sellVal !== null ? sellVal.toFixed(2) : "0.00";

    return (
      <div className="whitespace-nowrap font-medium text-[10.5px]">
        <span className="text-emerald-500">BUY: {buyText}</span>
        <span className="text-gray-300 mx-2">|</span>
        <span className="text-red-500">SELL: {sellText}</span>
      </div>
    );
  };

  const formatDate = (val: number) =>
    val ? dayjs(val).format("DD MMM YYYY") : "-";

  /* ================= COLUMNS ================= */
  const columns: ColumnsType<BrokerageRow> = [
    { title: "ID", dataIndex: "id", width: 60, align: "center", fixed: "left" },
    {
      title: "Brokerage Order",
      width: 170,
      align: "center",
      render: (_, r) =>
        renderBuySell(r.buy_brokerage_order, r.sell_brokerage_order),
    },
    {
      title: "Brokerage Lot Size",
      width: 170,
      align: "center",
      render: (_, r) =>
        renderBuySell(r.buy_brokerage_lot_size, r.sell_brokerage_lot_size),
    },
    {
      title: "Brokerage %",
      width: 170,
      align: "center",
      render: (_, r) =>
        renderBuySell(r.buy_brokerage_percentage, r.sell_brokerage_percentage),
    },
    { title: "Client Name", dataIndex: "client_name", width: 150 },
    {
      title: "Clearing Charges",
      width: 170,
      align: "center",
      render: (_, r) =>
        renderBuySell(r.buy_clearing_charges, r.sell_clearing_charges),
    },
    {
      title: "Start Date",
      dataIndex: "start_date",
      width: 110,
      align: "center",
      render: formatDate,
    },
    {
      title: "End Date",
      dataIndex: "end_date",
      width: 110,
      align: "center",
      render: formatDate,
    },
    {
      title: "GST (%)",
      width: 170,
      align: "center",
      render: (_, r) => renderBuySell(r.buy_gst, r.sell_gst),
    },
    {
      title: "Inv Protection (%)",
      width: 170,
      align: "center",
      render: (_, r) =>
        renderBuySell(
          r.buy_inv_protection_charges,
          r.sell_inv_protection_charges,
        ),
    },
    {
      title: "Stamp Chg %",
      width: 170,
      align: "center",
      render: (_, r) =>
        renderBuySell(
          r.buy_stamp_charges_percentage,
          r.sell_stamp_charges_percentage,
        ),
    },
    {
      title: "Stamp Flat",
      width: 170,
      align: "center",
      render: (_, r) =>
        renderBuySell(r.buy_stamp_charges_flat, r.sell_stamp_charges_flat),
    },
    {
      title: "STT / CTT (%)",
      width: 170,
      align: "center",
      render: (_, r) => renderBuySell(r.buy_stt_ctt, r.sell_stt_ctt),
    },
    {
      title: "Txn. BSE (%)",
      width: 170,
      align: "center",
      render: (_, r) =>
        renderBuySell(
          r.buy_transaction_charges_bse,
          r.sell_transaction_charges_bse,
        ),
    },
    {
      title: "Txn. NSE (%)",
      width: 170,
      align: "center",
      render: (_, r) =>
        renderBuySell(
          r.buy_transaction_charges_nse,
          r.sell_transaction_charges_nse,
        ),
    },
    {
      title: "Broker",
      dataIndex: "broker",
      width: 100,
      align: "center",
      className: "uppercase",
    },
    { title: "Type", dataIndex: "type", width: 120, align: "center" },
    {
      title: "Sebi Charges",
      width: 170,
      align: "center",
      render: (_, r) => renderBuySell(r.buy_sebi_charges, r.sell_sebi_charges),
    },
    {
      title: "Action",
      width: 80,
      align: "center",
      fixed: "right",
      render: (_, record) => (
        <Button
          size="small"
          type="text"
          icon={<FiEdit2 size={14} className="text-yellow-500" />}
          onClick={() =>
            navigate(`/edit-brokerage/${record.id}`, {
              state: { brokerageData: record },
            })
          }
        />
      ),
    },
  ];

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
          <div className="flex flex-col lg:flex-row justify-between gap-4">
            {/* TITLE */}
            <div className="flex items-center justify-between">
              <Title
                level={3}
                className="!m-0 text-gray-800 font-medium text-lg sm:text-xl"
              >
                Brokerage List
              </Title>
            </div>

            {/* ===== LARGE SCREEN (ALL IN ONE ROW) ===== */}
            <div className="hidden lg:flex items-end gap-3">
              <div className="custom-field-group">
                <label>Start Date</label>
                <DatePicker
                  value={startDate}
                  format="DD-MM-YYYY"
                  className="custom-range-picker w-[140px]"
                  onChange={(date) => setStartDate(date)}
                />
              </div>

              <div className="custom-field-group">
                <label>End Date</label>
                <DatePicker
                  value={endDate}
                  format="DD-MM-YYYY"
                  className="custom-range-picker w-[140px]"
                  onChange={(date) => setEndDate(date)}
                />
              </div>

              <Button
                type="primary"
                className="bg-blue-600 h-[32px] font-medium"
                onClick={loadData}
              >
                Apply
              </Button>

              <div className="custom-field-group">
                <label>Broker</label>
                <Select
                  value={selectedBroker}
                  onChange={(val) => setSelectedBroker(val)}
                  className="custom-select w-[150px]"
                  options={[
                    { value: "all", label: "All Brokers" },
                    ...brokers.map((broker) => ({
                      value: broker.name,
                      label: broker.full_name,
                    })),
                  ]}
                />
              </div>

              <div className="custom-field-group">
                <label>Client</label>
                <Select
                  value={selectedClient}
                  onChange={(val) => setSelectedClient(val)}
                  className="custom-select w-[180px]"
                  options={[
                    { value: "all", label: "All Client" },
                    ...clients.map((client) => ({
                      value: client.id,
                      label: client.name,
                    })),
                  ]}
                />
              </div>

              <Button
                className="text-blue-600 border-blue-200 font-medium h-[32px] ml-auto"
                onClick={() => navigate("/add-brokerage")}
              >
                Add Brokerage
              </Button>
            </div>

            {/* ===== MEDIUM SCREEN (2 ROW LAYOUT) ===== */}
            <div className="hidden md:flex lg:hidden flex-col gap-3">
              {/* ROW 1 */}
              <div className="flex gap-3">
                <div className="custom-field-group flex-1">
                  <label>Start Date</label>
                  <DatePicker
                    value={startDate}
                    format="DD-MM-YYYY"
                    className="custom-range-picker w-full"
                    onChange={(date) => setStartDate(date)}
                  />
                </div>

                <div className="custom-field-group flex-1">
                  <label>End Date</label>
                  <DatePicker
                    value={endDate}
                    format="DD-MM-YYYY"
                    className="custom-range-picker w-full"
                    onChange={(date) => setEndDate(date)}
                  />
                </div>

                <Button
                  type="primary"
                  className="bg-blue-600 h-[32px] font-medium"
                  onClick={loadData}
                >
                  Apply
                </Button>
              </div>

              {/* ROW 2 */}
              <div className="flex gap-3">
                <div className="custom-field-group flex-1">
                  <label>Broker</label>
                  <Select
                    value={selectedBroker}
                    onChange={(val) => setSelectedBroker(val)}
                    className="custom-select w-full"
                    options={[
                      { value: "all", label: "All Brokers" },
                      ...brokers.map((broker) => ({
                        value: broker.name,
                        label: broker.full_name,
                      })),
                    ]}
                  />
                </div>

                <div className="custom-field-group flex-1">
                  <label>Client</label>
                  <Select
                    value={selectedClient}
                    onChange={(val) => setSelectedClient(val)}
                    className="custom-select w-full"
                    options={[
                      { value: "all", label: "All Client" },
                      ...clients.map((client) => ({
                        value: client.id,
                        label: client.name,
                      })),
                    ]}
                  />
                </div>

                <Button className="text-blue-600 border-blue-200 font-medium h-[32px]">
                  Add Brokerage
                </Button>
              </div>
            </div>

            {/* ===== MOBILE SCREEN (YOUR ORIGINAL GOOD LAYOUT) ===== */}
            <div className="flex md:hidden flex-wrap items-end gap-3">
              <div className="custom-field-group w-[48%]">
                <label>Start Date</label>
                <DatePicker
                  value={startDate}
                  format="DD-MM-YYYY"
                  className="custom-range-picker w-full"
                  onChange={(date) => setStartDate(date)}
                />
              </div>

              <div className="custom-field-group w-[48%]">
                <label>End Date</label>
                <DatePicker
                  value={endDate}
                  format="DD-MM-YYYY"
                  className="custom-range-picker w-full"
                  onChange={(date) => setEndDate(date)}
                />
              </div>

              <Button
                type="primary"
                className="bg-blue-600 h-[32px] font-medium w-full"
                onClick={loadData}
              >
                Apply
              </Button>

              <div className="custom-field-group w-[48%]">
                <label>Broker</label>
                <Select
                  value={selectedBroker}
                  onChange={(val) => setSelectedBroker(val)}
                  className="custom-select w-full"
                  options={[
                    { value: "all", label: "All Brokers" },
                    ...brokers.map((broker) => ({
                      value: broker.name,
                      label: broker.full_name,
                    })),
                  ]}
                />
              </div>

              <div className="custom-field-group w-[48%]">
                <label>Client</label>
                <Select
                  value={selectedClient}
                  onChange={(val) => setSelectedClient(val)}
                  className="custom-select w-full"
                  options={[
                    { value: "all", label: "All Client" },
                    ...clients.map((client) => ({
                      value: client.id,
                      label: client.name,
                    })),
                  ]}
                />
              </div>

              <Button className="text-blue-600 border-blue-200 font-medium h-[32px] w-full">
                Add Brokerage
              </Button>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="flex-1 overflow-hidden bg-white">
          <div className="h-full w-full">
            <Spin spinning={loading} className="h-full">
              <Table
                size="small"
                columns={columns}
                dataSource={data}
                pagination={{
                  pageSize: pageSize,
                  current: pageNum,
                  total: totalRows,
                  showSizeChanger: true,
                  pageSizeOptions: ["50", "100", "200"],
                  onChange: (page, size) => {
                    setPageNum(page);
                    setPageSize(size);
                    loadData();
                  },
                  showTotal: (total, range) =>
                    `${range[0]} to ${range[1]} of ${total}`,
                  className: "px-4",
                }}
                sticky
                tableLayout="auto"
                scroll={{
                  x: "max-content", // Permits wide scrolling for all combined columns
                  y: "calc(100vh - 220px)",
                }}
                className="charges-table"
                locale={{ emptyText: "No Rows To Show" }}
              />
            </Spin>
          </div>
        </div>
      </Card>

      {/* COMPACT STYLES (Identical to reference code) */}
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
  z-index: 10;
}
.custom-range-picker {
  height: 32px !important;
  border-radius: 6px !important;
}
.custom-select .ant-select-selector {
  height: 32px !important;
  min-height: 32px !important;
  border-radius: 6px !important;
  align-items: center;
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
.uppercase {
  text-transform: uppercase;
}
    .charges-table .ant-table-sticky-holder {
  z-index: 1 !important;
}
`}
      </style>
    </div>
  );
};

export default BrokerageList;
