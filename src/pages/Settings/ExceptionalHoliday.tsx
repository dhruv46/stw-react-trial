import React, { useEffect, useState } from "react";
import {
  Table,
  Card,
  Typography,
  Button,
  Space,
  Select,
  Spin,
  Modal,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { FiEdit2 } from "react-icons/fi";
import { MdDeleteOutline } from "react-icons/md";
import {
  fetchExceptionalWorkingDaysList,
  deleteExceptionalWorkingDay,
} from "../../services/SettingsService/ExceptionalSettingsApi";

const { Title } = Typography;

interface ExceptionalHolidayRow {
  key: number;
  id: number;
  name: string;
  date: number;
  morning_session: string;
  evening_session: string;
}

export default function ExceptionalHoliday() {
  const navigate = useNavigate();

  const [selectedYear, setSelectedYear] = useState<number>(dayjs().year());
  const [data, setData] = useState<ExceptionalHolidayRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

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
    const getExceptionalHolidayData = async () => {
      try {
        setLoading(true);

        const res = await fetchExceptionalWorkingDaysList(selectedYear);

        const apiData = res?.data?.result ?? [];

        const mapped = apiData.map((item: any, index: number) => ({
          key: item.id ?? index,
          id: item.id,
          name: item.name,
          date: item.date,
          morning_session: item.morning_session,
          evening_session: item.evening_session,
        }));

        setData(mapped);
      } catch (error) {
        console.error(error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    getExceptionalHolidayData();
  }, [selectedYear]);

  const handleDelete = async () => {
    if (!selectedId) return;

    try {
      setDeleteLoading(true);

      await deleteExceptionalWorkingDay(selectedId);

      message.success("Exceptional working day deleted successfully!");

      // Refresh list
      const res = await fetchExceptionalWorkingDaysList(selectedYear);
      const apiData = res?.data?.result ?? [];

      const mapped = apiData.map((item: any, index: number) => ({
        key: item.id ?? index,
        id: item.id,
        name: item.name,
        date: item.date,
        morning_session: item.morning_session,
        evening_session: item.evening_session,
      }));

      setData(mapped);

      setDeleteModalOpen(false);
      setSelectedId(null);
    } catch (error: any) {
      message.error(
        error?.response?.data?.message ||
          "Failed to delete exceptional working day",
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  /* ================= COLUMNS ================= */

  const columns: ColumnsType<ExceptionalHolidayRow> = [
    {
      title: "ID",
      dataIndex: "id",
      align: "center",
    },
    {
      title: "Name",
      dataIndex: "name",
    },
    {
      title: "Date",
      dataIndex: "date",
      render: (value: number) =>
        value ? dayjs(value).format("DD MMM YYYY") : "-",
    },
    {
      title: "Morning Session",
      dataIndex: "morning_session",
      align: "center",
    },
    {
      title: "Evening Session",
      dataIndex: "evening_session",
      align: "center",
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
            onClick={() => navigate(`/edit-exceptional-holiday/${record.id}`)}
          />
          <Button
            size="small"
            danger
            type="text"
            icon={<MdDeleteOutline size={16} />}
            onClick={() => {
              setSelectedId(record.id);
              setDeleteModalOpen(true);
            }}
          />
        </Space>
      ),
    },
  ];

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
              Exceptional Holiday List
            </Title>

            <div className="flex items-center gap-3">
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
                onClick={() => navigate("/add-exceptional-holiday")}
              >
                Add New Exceptional Holiday
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
                dataSource={data}
                pagination={false}
                sticky
                tableLayout="auto"
                scroll={{
                  x: 1000,
                  y: "calc(100vh - 220px)",
                }}
                className="holiday-table"
                locale={{
                  emptyText: "No records found",
                }}
              />
            </Spin>
          </div>
        </div>

        <Modal
          open={deleteModalOpen}
          centered
          footer={null}
          onCancel={() => {
            setDeleteModalOpen(false);
            setSelectedId(null);
          }}
        >
          <div className="text-center py-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Delete Exceptional Working Day
            </h3>

            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete this record?
              <br />
              This action cannot be undone.
            </p>

            <div className="flex justify-center gap-4">
              <Button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setSelectedId(null);
                }}
              >
                Cancel
              </Button>

              <Button
                danger
                type="primary"
                loading={deleteLoading}
                onClick={handleDelete}
              >
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      </Card>

      {/* SAME STYLES */}
      <style>{`
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

.custom-select .ant-select-selector {
  height: 32px !important;
  min-height: 32px !important;
  border-radius: 6px !important;
  display: flex;
  align-items: center;
  font-size: 12px;
}

.holiday-table .ant-table {
  font-size: 11px;
}

.holiday-table .ant-table-thead > tr > th {
  background: #f8fafc !important;
  font-size: 11px;
  font-weight: 600;
  padding: 5px 8px !important;
  height: 32px;
  white-space: nowrap;
}

.holiday-table .ant-table-tbody > tr > td {
  padding: 2px 8px !important;
  height: 28px;
  font-size: 11px;
  white-space: nowrap;
}

.holiday-table .ant-table-tbody > tr:nth-child(even) {
  background: #fcfdff;
}

.holiday-table .ant-table-tbody > tr:hover > td {
  background: #eef6ff !important;
  transition: 0.15s;
}

.holiday-table .ant-btn {
  height: 22px;
  width: 22px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.holiday-table .ant-space {
  gap: 4px !important;
}
`}</style>
    </div>
  );
}
