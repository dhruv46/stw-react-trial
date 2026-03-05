import React, { useEffect, useState } from "react";
import { Table, Card, Typography, Button, Space, message, Modal } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  PlusOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { FiEdit2 } from "react-icons/fi";
import { MdDeleteOutline } from "react-icons/md";
import Loader from "../../components/Loader";

import {
  getZerodhaSettingsApi,
  deleteZerodhaSettingsApiById,
} from "../../services/SettingsService/zerodhaSettingsApi";

const { Title } = Typography;
const { confirm } = Modal;

const deleteZerodhaSettingsApi = async (id: number) => {
  return new Promise((resolve) => setTimeout(resolve, 500));
};

interface ZerodhaRow {
  id: number;
  name: string;
  key: string;
  secret: string;
  password?: string; // Exists in payload but hidden in table
  totp: string;
  url: string;
  type: string;
  is_enabled: boolean;
}

export default function ZerodhaList() {
  const navigate = useNavigate();

  const [data, setData] = useState<ZerodhaRow[]>([]);
  const [loading, setLoading] = useState(false);

  /* ================= FETCH DATA ================= */

  const fetchZerodhaData = async () => {
    try {
      setLoading(true);

      const res = await getZerodhaSettingsApi();

      // Adapted to handle your specific JSON response structure
      const apiData = res?.data?.result ?? [];

      setData(apiData);
    } catch (error) {
      console.error("Failed to fetch Zerodha list", error);
      message.error("Failed to fetch data");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchZerodhaData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ================= DELETE ================= */

  const handleDelete = (id: number) => {
    confirm({
      title: "Delete Zerodha Data",
      icon: <ExclamationCircleOutlined />,
      content: "Are you sure you want to delete this Zerodha configuration?",
      okText: "Yes",
      okType: "danger",
      cancelText: "Cancel",

      async onOk() {
        try {
          await deleteZerodhaSettingsApiById(id);
          message.success("Zerodha deleted successfully");
          fetchZerodhaData();
        } catch (error) {
          message.error("Failed to delete Zerodha Data");
        }
      },
    });
  };

  /* ================= TABLE COLUMNS ================= */

  const columns: ColumnsType<ZerodhaRow> = [
    {
      title: "ID",
      dataIndex: "id",
      align: "center",
      width: 60,
    },
    {
      title: "Name",
      dataIndex: "name",
      width: 100,
    },
    {
      title: "Key",
      dataIndex: "key",
    },
    {
      title: "Secret",
      dataIndex: "secret",
    },
    {
      title: "Totp",
      dataIndex: "totp",
    },
    {
      title: "URL",
      dataIndex: "url",
      ellipsis: true,
    },
    {
      title: "Type",
      dataIndex: "type",
      align: "center",
      width: 80,
    },
    {
      title: "Enabled",
      dataIndex: "is_enabled",
      align: "center",
      width: 90,
      render: (value: boolean) =>
        value ? (
          <span className="text-green-600 flex justify-center">
            {/* Swapped to Filled icons to exactly match your image */}
            <CheckCircleFilled style={{ fontSize: 20 }} />
          </span>
        ) : (
          <span className="text-red-600 flex justify-center">
            <CloseCircleFilled style={{ fontSize: 20 }} />
          </span>
        ),
    },
    {
      title: "Action",
      align: "center",
      width: 100,
      render: (_, record) => (
        <Space size={6}>
          <Button
            size="small"
            type="text"
            icon={<FiEdit2 size={14} className="text-yellow-500" />}
            onClick={() => navigate(`/edit-zerodha/${record.id}`)}
          />

          <Button
            size="small"
            danger
            type="text"
            icon={<MdDeleteOutline size={16} />}
            onClick={() => handleDelete(record.id)}
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
          <div className="flex items-center justify-between">
            <Title level={4} className="!m-0 !font-bold">
              Zerodha List
            </Title>

            <Button
              icon={<PlusOutlined />}
              className="font-semibold bg-blue-600 text-white"
              onClick={() => navigate("/add-zerodha")}
            >
              Add New Zerodha
            </Button>
          </div>
        </div>

        {/* TABLE */}
        <div className="flex-1 p-2 overflow-hidden bg-slate-50">
          <div className="h-full bg-white rounded-lg border overflow-hidden">
            <Table
              size="small"
              rowKey="id" // Highly recommended to set rowKey to id to prevent react key warnings
              columns={columns}
              dataSource={data}
              pagination={false}
              sticky
              tableLayout="auto"
              scroll={{
                x: 1100,
                y: "calc(100vh - 220px)",
              }}
              className="holiday-table"
            />
          </div>
        </div>
      </Card>

      {/* COMPACT TABLE STYLE FROM YOUR REFERENCE */}
      <style>
        {`
.holiday-table .ant-table {
  font-size: 11px;
}

.holiday-table .ant-table-thead > tr > th {
  background: #f8fafc !important;
  font-size: 11px;
  font-weight: 600;
  padding: 5px 8px !important;
  height: 32px;
}

.holiday-table .ant-table-tbody > tr > td {
  padding: 2px 8px !important;
  height: 28px;
  font-size: 11px;
}

.holiday-table .ant-table-tbody > tr:nth-child(even) {
  background: #fcfdff;
}

.holiday-table .ant-table-tbody > tr:hover > td {
  background: #eef6ff !important;
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
`}
      </style>
    </div>
  );
}
