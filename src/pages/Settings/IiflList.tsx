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
import { CONSTANTS } from "../../mock/Constant";

import {
  iiflSettingsApi,
  deleteIiflApi,
} from "../../services/SettingsService/iiflSettingsApi";

const { Title } = Typography;

interface IiflRow {
  key: number;
  id: number;
  name: string;
  api_key: string;
  secret: string;
  url: string;
  broadcast_mode: string;
  source: string;
  type: string;
  message_code: number[];
  timeframe: number[];
  disable_ssl: boolean;
  is_enabled: boolean;
}

const IiflList = () => {
  const navigate = useNavigate();
  const { MESSAGE_CODE } = CONSTANTS;

  const messageCodeOptions = MESSAGE_CODE.message_code.map((item) => ({
    value: item.id,
    label: item.name,
  }));

  const [data, setData] = useState<IiflRow[]>([]);
  const [loading, setLoading] = useState(false);

  /* ================= FETCH API ================= */

  useEffect(() => {
    const fetchIiflList = async () => {
      try {
        setLoading(true);

        const res = await iiflSettingsApi();

        const apiData = res?.data?.result ?? [];

        const mapped = apiData.map((item: any, index: number) => ({
          key: index,
          id: item.id,
          name: item.name,
          api_key: item.key,
          secret: item.secret,
          url: item.url,
          broadcast_mode: item.broadcast_mode,
          source: item.source,
          type: item.type,
          message_code: item.message_code || [],
          timeframe: item.timeframe || [],
          disable_ssl: item.disable_ssl,
          is_enabled: item.is_enabled,
        }));

        setData(mapped);
      } catch (error) {
        console.error("Failed to fetch IIFL list", error);
        message.error("Failed to fetch data");
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchIiflList();
  }, []);

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: "Delete IIFL",
      content: "Are you sure you want to delete this IIFL API?",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      centered: true,

      async onOk() {
        try {
          await deleteIiflApi(id);

          message.success("IIFL deleted successfully");

          setData((prev) => prev.filter((item) => item.id !== id));
        } catch (error) {
          message.error("Delete failed");
        }
      },
    });
  };

  /* ================= TABLE COLUMNS ================= */

  const columns: ColumnsType<IiflRow> = [
    {
      title: "ID",
      dataIndex: "id",
      //   width: 10,
      align: "center",
    },
    {
      title: "User Name",
      dataIndex: "name",
      width: 80,
    },
    {
      title: "Key",
      dataIndex: "api_key",
      width: 120,
      ellipsis: true,
    },
    {
      title: "Secret",
      dataIndex: "secret",
      width: 80,
    },
    {
      title: "Url",
      dataIndex: "url",
      width: 140,
      ellipsis: true,
    },
    {
      title: "Broadcast Mode",
      dataIndex: "broadcast_mode",
      width: 100,
    },
    {
      title: "Source",
      dataIndex: "source",
      width: 60,
      align: "center",
    },
    {
      title: "Type",
      dataIndex: "type",
      width: 40,
      align: "center",
    },
    {
      title: "Message Code",
      dataIndex: "message_code",
      align: "center",
      render: (codes: number[]) =>
        codes?.length ? `{${codes.join(", ")}}` : "",
    },
    {
      title: "Time Frame",
      dataIndex: "timeframe",
      align: "center",
      render: (time: number[]) => (time?.length ? `{${time.join(", ")}}` : ""),
    },
    {
      title: "Disable SSL",
      dataIndex: "disable_ssl",
      align: "center",
      render: (val: boolean) => (val ? "true" : "false"),
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
            onClick={() => navigate(`/edit-iifl/${record.id}`)}
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
              IIFL List
            </Title>

            <Button
              type="primary"
              icon={<PlusOutlined />}
              className="bg-blue-600 font-semibold"
              onClick={() => navigate("/add-iifl")}
            >
              Add New IIFL
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

export default IiflList;
