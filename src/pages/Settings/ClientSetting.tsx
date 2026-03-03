import React, { useEffect, useState } from "react";
import {
  Table,
  Card,
  Spin,
  Typography,
  Button,
  Space,
  Modal,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { FiEdit2 } from "react-icons/fi";
import { MdDeleteOutline } from "react-icons/md";
import Loader from "../../components/Loader";

// 👉 Replace with your actual APIs
import {
  getClientMasterListApi,
  deleteClientDataApi,
} from "../../services/SettingsService/clientSettingApi";

const { Title } = Typography;

interface ClientRow {
  key: number;
  id: number;
  name: string;
  broker: string;
  api: number;
  strategy: number[];
  mode: string;
  is_enabled: boolean;
}

const ClientSetting = () => {
  const navigate = useNavigate();

  const [clients, setClients] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  /* ================= FETCH DATA ================= */

  useEffect(() => {
    const getClientList = async () => {
      try {
        setLoading(true);

        const res = await getClientMasterListApi();
        const apiData = res?.data?.result ?? [];

        const mapped = apiData.map((item: any, index: number) => ({
          key: index,
          id: item.id,
          name: item.name,
          broker: item.broker?.toUpperCase(), // ✅ uppercase
          api: item.api,
          strategy: item.strategy || [], // ✅ keep as array
          mode: item.mode,
          is_enabled: item.is_enabled,
        }));

        setClients(mapped);
      } catch (error) {
        console.error(error);
        setClients([]);
      } finally {
        setLoading(false);
      }
    };

    getClientList();
  }, []);

  /* ================= DELETE ================= */

  const confirmDelete = async () => {
    if (!selectedId) return;

    try {
      setDeleteLoading(true);

      const res = await deleteClientDataApi(selectedId);

      // ✅ Check response like your backend format
      if (res?.data?.result) {
        message.success("Client account deleted successfully");

        // Refresh list after delete
        const listRes = await getClientMasterListApi();
        const apiData = listRes?.data?.result ?? [];

        const mapped = apiData.map((item: any, index: number) => ({
          key: index,
          id: item.id,
          name: item.name,
          broker: item.broker?.toUpperCase(),
          api: item.api,
          strategy: item.strategy || [],
          mode: item.mode,
          is_enabled: item.is_enabled,
        }));

        setClients(mapped);

        setDeleteModalOpen(false);
        setSelectedId(null);
      } else {
        message.error("Failed to delete client account");
      }
    } catch (error: any) {
      message.error(
        error?.response?.data?.message || "Failed to delete client account",
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  /* ================= COLUMNS ================= */

  const columns: ColumnsType<ClientRow> = [
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
      title: "Broker",
      dataIndex: "broker",
    },
    {
      title: "API",
      dataIndex: "api",
      align: "center",
    },
    {
      title: "Strategy",
      dataIndex: "strategy",
      render: (value: number[]) =>
        value && value.length > 0 ? `{${value.join(", ")}}` : "-",
    },
    {
      title: "Mode",
      dataIndex: "mode",
      align: "center",
    },
    {
      title: "Enabled",
      dataIndex: "is_enabled",
      align: "center",
      render: (value: boolean) =>
        value ? (
          <span className="text-green-600 font-semibold">
            <CheckCircleOutlined style={{ fontSize: 20 }} />
          </span>
        ) : (
          <span className="text-red-600 font-semibold">
            <CloseCircleOutlined style={{ fontSize: 20 }} />
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
            onClick={() => navigate(`/client-data/${record.id}`)}
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
              Client Account
            </Title>

            <Button
              type="primary"
              icon={<PlusOutlined />}
              className="bg-blue-600 font-semibold"
              onClick={() => navigate("/add-client-data")}
            >
              Add New Client Account
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
                dataSource={clients}
                pagination={false}
                sticky
                tableLayout="auto"
                scroll={{
                  x: 1000,
                  y: "calc(100vh - 220px)",
                }}
                className="holiday-table"
              />
            </Spin>
          </div>
        </div>

        {/* DELETE MODAL */}
        <Modal
          open={deleteModalOpen}
          onCancel={() => {
            setDeleteModalOpen(false);
            setSelectedId(null);
          }}
          footer={null}
          centered
        >
          <div className="py-4">
            <Typography.Text>
              Are you sure you want to delete this client account?
            </Typography.Text>

            <div className="flex justify-end gap-3 mt-6">
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
                onClick={confirmDelete}
              >
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      </Card>

      {/* SAME EXACT STYLES */}
      <style>
        {`
.custom-field-group {
  position: relative;
  padding-top: 5px;
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
`}
      </style>
    </div>
  );
};

export default ClientSetting;
