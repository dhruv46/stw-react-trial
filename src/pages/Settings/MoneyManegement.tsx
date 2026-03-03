// src/pages/MoneyManegement.tsx

import React, { useEffect, useState } from "react";
import {
  Table,
  Card,
  Spin,
  Typography,
  Button,
  Space,
  Select,
  message,
  Modal,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import Loader from "../../components/Loader";

import {
  fetchMoneyManagementList,
  fetchClientNameList,
  deleteMoneyManagementApi,
} from "../../services/SettingsService/moneyManegementSettingApi";
import { MdDeleteOutline } from "react-icons/md";
import { FiEdit2 } from "react-icons/fi";

const { Title } = Typography;

interface MoneyRow {
  key: number;
  id: number;
  client_id: number;
  strategy_id: number;
  capital_balance: number;
  account_balance: number;
}

interface ClientOption {
  id: number;
  name: string;
}

const MoneyManegement = () => {
  const navigate = useNavigate();

  const [moneyList, setMoneyList] = useState<MoneyRow[]>([]);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedClient, setSelectedClient] = useState<number | "all">("all");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  /* ================= FETCH CLIENT LIST ================= */

  useEffect(() => {
    const loadClients = async () => {
      try {
        const res = await fetchClientNameList();
        setClients(res?.data?.result ?? []);
      } catch (error) {
        console.error(error);
      }
    };

    loadClients();
  }, []);

  /* ================= FETCH TABLE DATA ================= */

  useEffect(() => {
    const loadMoneyList = async () => {
      try {
        setLoading(true);

        const res = await fetchMoneyManagementList();
        let apiData = res?.data?.result ?? [];

        // Filter by client if selected
        if (selectedClient !== "all") {
          apiData = apiData.filter(
            (item: any) => item.client_id === selectedClient,
          );
        }

        const mapped = apiData.map((item: any, index: number) => ({
          key: index,
          ...item,
        }));

        setMoneyList(mapped);
      } catch (error) {
        console.error(error);
        setMoneyList([]);
      } finally {
        setLoading(false);
      }
    };

    loadMoneyList();
  }, [selectedClient]);

  /* ================= DELETE ================= */

  const handleDelete = (record: MoneyRow) => {
    setSelectedId(record.id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedId) return;

    try {
      setDeleteLoading(true);

      const res = await deleteMoneyManagementApi(selectedId);

      if (res?.data?.result) {
        message.success("Money Management deleted successfully");

        // Refresh list
        const listRes = await fetchMoneyManagementList();
        let apiData = listRes?.data?.result ?? [];

        if (selectedClient !== "all") {
          apiData = apiData.filter(
            (item: any) => item.client_id === selectedClient,
          );
        }

        const mapped = apiData.map((item: any, index: number) => ({
          key: index,
          ...item,
        }));

        setMoneyList(mapped);

        setDeleteModalOpen(false);
        setSelectedId(null);
      } else {
        message.error("Failed to delete");
      }
    } catch (error: any) {
      message.error(error?.response?.data?.message || "Failed to delete");
    } finally {
      setDeleteLoading(false);
    }
  };

  /* ================= TABLE COLUMNS ================= */

  const columns: ColumnsType<MoneyRow> = [
    {
      title: "ID",
      dataIndex: "id",
      align: "center",
    },
    {
      title: "Client ID",
      dataIndex: "client_id",
      align: "center",
    },
    {
      title: "Strategy ID",
      dataIndex: "strategy_id",
      align: "center",
    },
    {
      title: "Capital Balance",
      dataIndex: "capital_balance",
      align: "right",
      render: (value: number) =>
        value
          ? value.toLocaleString("en-IN", { minimumFractionDigits: 2 })
          : "0.00",
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
            onClick={() => navigate(`/edit-money-management/${record.id}`)}
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
              Money Management List
            </Title>

            <div className="flex items-center gap-3">
              {/* Client Filter */}
              <div className="custom-field-group w-[200px]">
                <label>Client</label>
                <Select
                  value={selectedClient}
                  onChange={(val) => setSelectedClient(val)}
                  className="w-full custom-select"
                >
                  <Select.Option value="all">All Client</Select.Option>
                  {clients.map((client) => (
                    <Select.Option key={client.id} value={client.id}>
                      {client.name}
                    </Select.Option>
                  ))}
                </Select>
              </div>

              <Button
                type="primary"
                icon={<PlusOutlined />}
                className="bg-blue-600 font-semibold"
                onClick={() => navigate("/add-money-management")}
              >
                Add Money Management
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
                dataSource={moneyList}
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
              Are you sure you want to delete this Money Management record?
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
`}
      </style>
    </div>
  );
};

export default MoneyManegement;
