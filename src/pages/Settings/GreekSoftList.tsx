import React, { useEffect, useState } from "react";
import { Table, Card, Typography, Button, Space, message, Modal } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  PlusOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";

import { FiEdit2 } from "react-icons/fi";
import { MdDeleteOutline } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import Loader from "../../components/Loader";
import {
  greeksoftSettingsApi,
  deleteGreeksoftApi,
} from "../../services/SettingsService/greeksoftSettingsApi";

const { Title } = Typography;

interface GreekSoftRow {
  key: number;
  id: number;
  username: string;
  session_id: string;
  session_link: string;
  order_link: string;
  base64: boolean;
  pro: boolean;
  type: string;
  is_enabled: boolean;
}

const GreekSoftList = () => {
  const navigate = useNavigate();

  const [data, setData] = useState<GreekSoftRow[]>([]);
  const [loading, setLoading] = useState(false);

  /* ================= FETCH API ================= */

  useEffect(() => {
    const fetchGreekSoftList = async () => {
      try {
        setLoading(true);

        const res = await greeksoftSettingsApi();

        const apiData = res?.data?.result ?? [];

        const mapped = apiData.map((item: any, index: number) => ({
          key: index,
          id: item.id,
          username: item.name,
          session_id: item.session_id,
          session_link: item.session_link,
          order_link: item.order_link,
          base64: item.base64,
          pro: item.pro,
          type: item.type,
          is_enabled: item.is_enabled,
        }));

        setData(mapped);
      } catch (error) {
        console.error("Failed to fetch GreekSoft list", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGreekSoftList();
  }, []);

  const confirmDelete = (id: number) => {
    Modal.confirm({
      title: "Delete Greeksoft",
      content: "Are you sure you want to delete this Greeksoft?",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      centered: true,

      onOk: async () => {
        try {
          await deleteGreeksoftApi(id);

          message.success("Greeksoft deleted successfully");

          setData((prev) => prev.filter((item) => item.id !== id));
        } catch (error) {
          message.error("Delete failed");
        }
      },
    });
  };
  /* ================= TABLE COLUMNS ================= */

  const columns: ColumnsType<GreekSoftRow> = [
    {
      title: "ID",
      dataIndex: "id",
      align: "center",
      width: 60,
    },
    {
      title: "User Name",
      dataIndex: "username",
      width: 140,
    },
    {
      title: "Session ID",
      dataIndex: "session_id",
      width: 140,
    },
    {
      title: "Session Link",
      dataIndex: "session_link",
      ellipsis: true,
    },
    {
      title: "Order Link",
      dataIndex: "order_link",
      ellipsis: true,
    },
    {
      title: "Base64",
      dataIndex: "base64",
      align: "center",
      render: (val: boolean) => (val ? "true" : "false"),
    },
    {
      title: "Pro",
      dataIndex: "pro",
      align: "center",
      render: (val: boolean) => (val ? "true" : "false"),
    },
    {
      title: "Type",
      dataIndex: "type",
      align: "center",
    },
    {
      title: "Enabled",
      dataIndex: "is_enabled",
      align: "center",
      render: (value: boolean) =>
        value ? (
          <span className="text-green-600">
            <CheckCircleOutlined style={{ fontSize: 18 }} />
          </span>
        ) : (
          <span className="text-red-600">
            <CloseCircleOutlined style={{ fontSize: 18 }} />
          </span>
        ),
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
            onClick={() => navigate(`/edit-greek-soft/${record.id}`)}
          />

          <Button
            size="small"
            danger
            type="text"
            icon={<MdDeleteOutline size={16} />}
            onClick={() => confirmDelete(record.id)}
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
              Greek Soft List
            </Title>

            <Button
              type="primary"
              icon={<PlusOutlined />}
              className="bg-blue-600 font-semibold"
              onClick={() => navigate("/add-greek-soft")}
            >
              Add New Greek Soft
            </Button>
          </div>
        </div>

        {/* TABLE */}
        <div className="flex-1 p-2 overflow-hidden bg-slate-50">
          <div className="h-full bg-white rounded-lg border overflow-hidden">
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
            />
          </div>
        </div>
      </Card>

      {/* TABLE STYLE */}
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
};

export default GreekSoftList;
