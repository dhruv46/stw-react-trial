import React, { useEffect, useState } from "react";
import { Table, Card, Typography, Button, Space, Modal, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  PlusOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";

import { useNavigate } from "react-router-dom";
import { FiEdit2 } from "react-icons/fi";
import { MdDeleteOutline } from "react-icons/md";

import Loader from "../../components/Loader";

import {
  getMasterTrustSettingsApi,
  deleteMasterTrustApi,
} from "../../services/SettingsService/masterTrustSettingsApi";

const { Title } = Typography;

interface MasterTrustRow {
  key: number;
  id: number;
  name: string;
  factor2: string;
  vendor_code: string;
  app_key: string;
  imei: string;
  type: string;
  host_url: string;
  websocket_url: string;
  is_enabled: boolean;
}

const MasterTrustList = () => {
  const navigate = useNavigate();

  const [data, setData] = useState<MasterTrustRow[]>([]);
  const [loading, setLoading] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  /* ================= FETCH DATA ================= */

  const fetchMasterTrust = async () => {
    try {
      setLoading(true);

      const res = await getMasterTrustSettingsApi();

      const apiData = res?.data?.result ?? [];

      const mapped = apiData.map((item: any) => ({
        key: item.id,
        ...item,
      }));

      setData(mapped);
    } catch (error) {
      console.error(error);
      message.error("Failed to fetch Master Trust list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMasterTrust();
  }, []);

  /* ================= ACTIONS ================= */

  const handleEdit = (record: MasterTrustRow) => {
    navigate(`/edit-master-trust/${record.id}`);
  };

  const handleDelete = (record: MasterTrustRow) => {
    setSelectedId(record.id);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setSelectedId(null);
  };

  const confirmDelete = async () => {
    if (!selectedId) return;

    try {
      setDeleteLoading(true);

      await deleteMasterTrustApi(selectedId);

      message.success("Master Trust deleted successfully");

      // remove row instantly without refetch
      setData((prev) => prev.filter((item) => item.id !== selectedId));

      closeDeleteModal();
    } catch (error: any) {
      message.error(
        error?.response?.data?.message || "Failed to delete Master Trust",
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  /* ================= TABLE COLUMNS ================= */

  const columns: ColumnsType<MasterTrustRow> = [
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
      title: "Factor2",
      dataIndex: "factor2",
    },
    {
      title: "Vendor Code",
      dataIndex: "vendor_code",
    },
    {
      title: "App Key",
      dataIndex: "app_key",
      ellipsis: true,
    },
    {
      title: "IMEI",
      dataIndex: "imei",
      align: "center",
    },
    {
      title: "Type",
      dataIndex: "type",
      align: "center",
    },
    {
      title: "Host Url",
      dataIndex: "host_url",
      ellipsis: true,
    },
    {
      title: "Websocket Url",
      dataIndex: "websocket_url",
      ellipsis: true,
    },
    {
      title: "Is Enabled",
      dataIndex: "is_enabled",
      align: "center",
      render: (val: boolean) =>
        val ? (
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

        <div className="px-4 py-2 border-b bg-white rounded-t-xl">
          <div className="flex items-center justify-between">
            <Title level={4} className="!m-0 !font-bold">
              Master Trust List
            </Title>

            <Button
              type="primary"
              icon={<PlusOutlined />}
              className="bg-blue-600 font-semibold"
              onClick={() => navigate("/add-master-trust")}
            >
              Add New Master Trust
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
                x: 1200,
                y: "calc(100vh - 220px)",
              }}
              className="holiday-table"
            />
          </div>
        </div>

        {/* DELETE MODAL */}

        <Modal
          open={deleteModalOpen}
          onCancel={closeDeleteModal}
          footer={null}
          centered
          width={360}
        >
          <div className="py-2">
            <Typography.Text className="text-sm">
              Are you sure you want to delete this <b>Master Trust</b>?
            </Typography.Text>

            <div className="flex justify-end gap-3 mt-6">
              <Button onClick={closeDeleteModal}>Cancel</Button>

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

      {/* SAME TABLE STYLE */}

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

export default MasterTrustList;
