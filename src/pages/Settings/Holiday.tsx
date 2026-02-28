import React, { useEffect, useState } from "react";
import { Table, Card, Spin, Typography, Button, Space, Select } from "antd";
import type { ColumnsType } from "antd/es/table";
import { PlusOutlined } from "@ant-design/icons";
import { fetchHolidayList } from "../../services/SettingsService/holidaySettingsApi";
import dayjs from "dayjs";

import { FiEdit2 } from "react-icons/fi";
import { MdDeleteOutline } from "react-icons/md";
import Loader from "../../components/Loader";

const { Title } = Typography;

interface HolidayRow {
  key: number;
  id: number;
  name: string;
  date: number;
  morning_session: string;
  evening_session: string;
}

const Holiday = () => {
  const [holidays, setHolidays] = useState<HolidayRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number>(dayjs().year());

  /* ================= YEAR OPTIONS ================= */

  const currentYear = dayjs().year();

  const yearOptions = Array.from({ length: 7 }, (_, i) => {
    const year = currentYear - 3 + i;
    return {
      label: year.toString(),
      value: year,
    };
  });

  /* ================= FETCH DATA ================= */

  useEffect(() => {
    const getHolidayData = async () => {
      try {
        setLoading(true);

        const res = await fetchHolidayList(selectedYear);

        const apiData = res?.data?.result ?? [];

        const mapped = apiData.map((item: any, index: number) => ({
          key: index,
          ...item,
        }));

        setHolidays(mapped);
      } catch (error) {
        console.error(error);
        setHolidays([]);
      } finally {
        setLoading(false);
      }
    };

    getHolidayData();
  }, [selectedYear]);

  /* ================= ACTIONS ================= */

  const handleEdit = (record: HolidayRow) => {
    console.log("Edit:", record);
  };

  const handleDelete = (record: HolidayRow) => {
    console.log("Delete:", record);
  };

  /* ================= COLUMNS ================= */

  const columns: ColumnsType<HolidayRow> = [
    {
      title: "ID",
      dataIndex: "id",
      //   width: 80,
      align: "center",
    },
    {
      title: "Name",
      dataIndex: "name",
      //   width: 160,
    },
    {
      title: "Date",
      dataIndex: "date",
      //   width: 160,
      render: (value: number) =>
        value ? dayjs(value).format("DD MMM YYYY") : "-",
    },
    {
      title: "Morning Session",
      dataIndex: "morning_session",
      //   width: 180,
      align: "center",
    },
    {
      title: "Evening Session",
      dataIndex: "evening_session",
      //   width: 180,
      align: "center",
    },
    {
      title: "Action",
      //   width: 120,
      align: "center",
      render: (_, record) => (
        <Space size={6}>
          <Button
            size="small"
            type="text"
            icon={<FiEdit2 size={14} />}
            onClick={() => handleEdit(record)}
          />
          <Button
            size="small"
            danger
            type="text"
            icon={<MdDeleteOutline size={16} />}
            onClick={() => handleDelete(record)}
          />
        </Space>
      ),
    },
  ];

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="h-[calc(100vh-65px)] bg-slate-100 p-3 overflow-hidden">
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <Title level={4} className="!m-0 !font-bold">
              Holiday List
            </Title>

            <div className="flex items-center gap-3">
              {/* Year Select */}
              <div className="custom-field-group w-[120px]">
                <label>Year</label>

                <Select
                  value={selectedYear}
                  onChange={(val) => setSelectedYear(val)}
                  className="w-full custom-select"
                  options={yearOptions}
                />
              </div>

              <Button
                type="primary"
                icon={<PlusOutlined />}
                className="bg-blue-600 font-semibold"
              >
                Add New Holiday
              </Button>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="flex-1 p-2 overflow-hidden bg-slate-50">
          <div className="h-full bg-white rounded-lg border overflow-hidden">
            <Spin spinning={loading} className="h-full">
              <Table
                size="small"
                columns={columns}
                dataSource={holidays}
                pagination={false}
                sticky
                tableLayout="auto"
                scroll={{
                  x: 1000,
                  y: "calc(100vh - 220px)",
                }}
                className="holiday-table"
                // locale={{
                //   emptyText: "No Holiday Available",
                // }}
              />
            </Spin>
          </div>
        </div>
      </Card>

      {/* STYLE */}
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

/* Select Compact */
.custom-select .ant-select-selector {
  height: 32px !important;
  min-height: 32px !important;
  border-radius: 6px !important;
  display: flex;
  align-items: center;
  font-size: 12px;
}

/* ================= TABLE ================= */

.holiday-table .ant-table {
  font-size: 11px;
}

/* HEADER */
.holiday-table .ant-table-thead > tr > th {
  background: #f8fafc !important;
  font-size: 11px;
  font-weight: 600;
  padding: 5px 8px !important;
  height: 32px;
  line-height: 1;
  white-space: nowrap;
}

/* BODY */
.holiday-table .ant-table-tbody > tr > td {
  padding: 2px 8px !important;
  height: 28px;
  font-size: 11px;
  white-space: nowrap;
}

/* Zebra */
.holiday-table .ant-table-tbody > tr:nth-child(even) {
  background: #fcfdff;
}

/* Hover */
.holiday-table .ant-table-tbody > tr:hover > td {
  background: #eef6ff !important;
  transition: 0.15s;
}

/* Empty */
.holiday-table .ant-table-placeholder td {
  border-bottom: none !important;
}

/* ================= ACTION BUTTON ================= */

.holiday-table .ant-btn {
  height: 22px;
  width: 22px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* Reduce space */
.holiday-table .ant-space {
  gap: 4px !important;
}

/* Sticky header fix */
.holiday-table .ant-table-header {
  overflow: hidden !important;
}

/* Scrollbar clean */
.holiday-table .ant-table-body::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.holiday-table .ant-table-body::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 6px;
}

`}
      </style>
    </div>
  );
};

export default Holiday;
