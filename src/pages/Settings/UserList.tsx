import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Tag,
  Typography,
  Card,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { FaLock } from "react-icons/fa";
import { FaPen, FaPlus } from "react-icons/fa6";

import {
  getUserList,
  getEnabledClientList,
  addUpdateUser,
  resetUserPasswordApi,
  getStrategyByClientId,
  FetchStrategyList,
  getUserById,
} from "../../services/SettingsService/userSettingsApi";

const { Text } = Typography;

interface UserRow {
  id: number;
  username: string;
  full_name: string;
  email: string;
  enabled: boolean;
  user_role: string;
}

export default function UserList() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [enabledClients, setEnabledClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetLoadingId, setResetLoadingId] = useState<number | null>(null);
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);
  const [clientStrategies, setClientStrategies] = useState<number[]>([]);
  const [strategyList, setStrategyList] = useState<any[]>([]);
  const [selectedStrategies, setSelectedStrategies] = useState<number[]>([]);
  const [strategyLoading, setStrategyLoading] = useState(false);

  /* ✅ Modal State */
  const [openModal, setOpenModal] = useState(false);

  const [form] = Form.useForm();

  /* ================= Fetch Users ================= */

  useEffect(() => {
    getUserList()
      .then((response) => {
        setUsers(response.data?.result || []);
      })
      .catch((error) => {
        console.error("Error fetching user list:", error);
      })
      .finally(() => setLoading(false));
  }, []);

  /* ================= Fetch Users ================= */

  useEffect(() => {
    getEnabledClientList()
      .then((response) => {
        setEnabledClients(response.data?.result || []);
      })
      .catch((error) => {
        console.error("Error fetching enabled client list:", error);
      })
      .finally(() => setLoading(false));
  }, []);

  /* ================= Reset password ================= */

  const handleResetPassword = async (record: UserRow) => {
    try {
      setResetLoadingId(record.id);

      await resetUserPasswordApi({
        id: record.id,
        email: record.email,
      });

      message.success("Password reset successfully ✅");
    } catch (error) {
      console.error(error);
      message.error("Failed to reset password");
    } finally {
      setResetLoadingId(null);
    }
  };

  const handleClientChange = async (clientId: number) => {
    try {
      setSelectedStrategies([]);
      setStrategyLoading(true);

      // ✅ get strategy ids of client
      const res1 = await getStrategyByClientId(clientId);

      const strategyIds = res1?.data?.result?.[0]?.strategy_id || [];

      setClientStrategies(strategyIds);

      // ✅ fetch all strategies
      const res2 = await FetchStrategyList();

      setStrategyList(res2?.data?.result || []);
    } catch (error) {
      console.error(error);
    } finally {
      setStrategyLoading(false);
    }
  };

  const mappedStrategies = strategyList.filter((strategy) =>
    clientStrategies.includes(strategy.id),
  );

  /* ================= Columns ================= */

  const columns: ColumnsType<UserRow> = [
    {
      title: "ID",
      dataIndex: "id",
      width: 70,
      render: (v) => <Text className="text-xs">{v}</Text>,
    },
    {
      title: "Username",
      dataIndex: "username",
      render: (v) => (
        <Text strong className="text-xs">
          {v}
        </Text>
      ),
    },
    {
      title: "Full Name",
      dataIndex: "full_name",
      render: (v) => <span className="text-xs">{v}</span>,
    },
    {
      title: "Email",
      dataIndex: "email",
      render: (v) => <span className="text-xs text-gray-600">{v}</span>,
    },
    {
      title: "Status",
      dataIndex: "enabled",
      width: 120,
      render: (enabled) => (
        <Tag
          color={enabled ? "success" : "default"}
          className="text-[11px] px-2 py-0"
        >
          {enabled ? "Enabled" : "Disabled"}
        </Tag>
      ),
    },
    {
      title: "Role",
      dataIndex: "user_role",
      align: "center",
      width: 130,
      render: (role) => (
        <Tag color="blue" className="text-[11px]">
          {role?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Reset",
      align: "center",
      width: 90,
      render: (_, record) => (
        <Button
          type="text"
          size="small"
          loading={resetLoadingId === record.id}
          icon={<FaLock style={{ color: "#2563eb" }} />}
          onClick={() => handleResetPassword(record)}
        />
      ),
    },
    // {
    //   title: "Action",
    //   align: "center",
    //   width: 90,
    //   render: () => (
    //     <Button
    //       type="text"
    //       size="small"
    //       icon={<FaPen style={{ color: "#facc15" }} />}
    //     />
    //   ),
    // },
    {
      title: "Action",
      align: "center",
      width: 90,
      render: (_, record) => (
        <Button
          type="text"
          size="small"
          icon={<FaPen style={{ color: "#facc15" }} />}
          onClick={async () => {
            try {
              setOpenModal(true);
              setStrategyLoading(true);

              // ✅ fetch full user data
              const res = await getUserById(record.id);

              const user = res?.data?.result?.[0];

              if (!user) return;

              setEditingUser(user);

              const clientId = user.user_clients?.[0];

              // ✅ set form values
              form.setFieldsValue({
                username: user.username,
                full_name: user.full_name,
                email: user.email,
                enabled: user.enabled,
                user_role: user.user_role,
                client: clientId,
              });

              // ==========================
              // Load Client Strategies
              // ==========================

              if (clientId) {
                const res1 = await getStrategyByClientId(clientId);

                const strategyIds = res1?.data?.result?.[0]?.strategy_id || [];

                setClientStrategies(strategyIds);

                const res2 = await FetchStrategyList();

                const allStrategies = res2?.data?.result || [];

                setStrategyList(allStrategies);

                // ✅ already selected strategies
                const selected =
                  user.user_client_strategy?.[clientId]?.[0] || [];

                setSelectedStrategies(selected);
              }
            } catch (error) {
              console.error(error);
              message.error("Failed to load user");
            } finally {
              setStrategyLoading(false);
            }
          }}
        />
      ),
    },
  ];

  /* ================= Submit ================= */

  const handleSubmit = async (values: any) => {
    try {
      setSaving(true);

      const clientId = values.client;
      const payload = {
        id: editingUser ? editingUser.id : 0,
        username: values.username,
        full_name: values.full_name || "",
        email: values.email || "",
        enabled: values.enabled ?? true,
        user_role: values.user_role,
        user_clients: values.client ? [values.client] : [],
        // ✅ build payload correctly
        user_client_strategy: clientId
          ? {
              [clientId]: [selectedStrategies],
            }
          : {},
        hashed_password: values.password,
      };

      await addUpdateUser(payload);

      const response = await getUserList();
      setUsers(response.data?.result || []);

      setOpenModal(false);
      form.resetFields();
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  /* ================= UI ================= */

  return (
    <div className="bg-gray-100 min-h-screen p-3">
      <Card size="small" className="shadow-sm rounded-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 border-b pb-2">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-5 bg-blue-600 rounded-sm" />
            <Text strong className="text-[15px] text-gray-800">
              User List
            </Text>
          </div>

          {/* ✅ Open Modal */}
          <Button
            type="primary"
            size="small"
            icon={<FaPlus size={12} />}
            className="flex items-center !px-3 !h-7 shadow-sm"
            onClick={() => {
              setEditingUser(null);
              setSelectedStrategies([]);
              setClientStrategies([]);
              form.resetFields();
              setOpenModal(true);
            }}
          >
            Add User
          </Button>
        </div>

        {/* Table */}
        <Table
          rowKey="id"
          columns={columns}
          dataSource={users}
          loading={loading}
          size="small"
          bordered
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            size: "small",
          }}
          scroll={{ x: "max-content", y: 520 }}
          className="compact-user-table"
        />
      </Card>

      {/* ================= COMPACT MODAL ================= */}

      <Modal
        centered
        title={
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
            <span className="text-sm font-semibold text-gray-800">
              {editingUser ? "Edit User" : "Add User"}
            </span>
          </div>
        }
        open={openModal}
        onCancel={() => setOpenModal(false)}
        footer={null}
        width={420}
        destroyOnHidden
        className="compact-user-modal"
        styles={{
          header: { padding: "14px 16px" },
          body: { padding: "14px 16px 16px" },
        }}
      >
        <Form
          layout="vertical"
          form={form}
          size="small"
          onFinish={handleSubmit}
          initialValues={{ enabled: false }}
          className="space-y-2"
        >
          {/* Username */}
          <Form.Item
            label={<span className="text-xs font-medium">Username</span>}
            name="username"
            className="mb-1"
            rules={[{ required: true, message: "Username is required" }]}
          >
            <Input placeholder="Enter username" className="h-8 rounded" />
          </Form.Item>

          {/* Password */}
          {/* Password (Only Add Mode) */}
          {!editingUser && (
            <Form.Item
              label={<span className="text-xs font-medium">Password</span>}
              name="password"
              className="mb-1"
              rules={[
                { required: true, message: "Password is required" },
                { min: 6, message: "Password must be at least 6 characters" },
              ]}
            >
              <Input.Password
                placeholder="Enter password"
                className="h-8 rounded"
              />
            </Form.Item>
          )}

          {/* Full Name */}
          <Form.Item
            label={<span className="text-xs font-medium">Full Name</span>}
            name="full_name"
            className="mb-1"
            rules={[{ required: true, message: "Full name is required" }]}
          >
            <Input placeholder="Full name" className="h-8 rounded" />
          </Form.Item>

          {/* Email */}
          <Form.Item
            label={<span className="text-xs font-medium">Email</span>}
            name="email"
            className="mb-1"
            rules={[
              { required: true, message: "Email is required" },
              { type: "email", message: "Enter valid email address" },
            ]}
          >
            <Input placeholder="email@example.com" className="h-8 rounded" />
          </Form.Item>

          {/* Role */}
          <Form.Item
            label={<span className="text-xs font-medium">User Role</span>}
            name="user_role"
            className="mb-1"
            rules={[{ required: true, message: "Please select role" }]}
          >
            <Select placeholder="Select role" className="rounded">
              <Select.Option value="Admin">Admin</Select.Option>
              <Select.Option value="Client">Client</Select.Option>
              <Select.Option value="Dealer">Dealer</Select.Option>
            </Select>
          </Form.Item>

          {/* Client */}

          <Form.Item
            label={<span className="text-xs font-medium">Client</span>}
            name="client"
            rules={[{ required: true, message: "Please select client" }]}
          >
            <Select
              placeholder="Select client"
              allowClear
              showSearch
              optionFilterProp="label"
              className="rounded"
              options={enabledClients.map((client) => ({
                label: `${client.id} - ${client.name}`,
                value: client.id,
              }))}
              onChange={handleClientChange}
            />
          </Form.Item>

          {mappedStrategies.length > 0 && (
            <div className="mt-1">
              {/* Header */}
              <div className="text-[11px] font-semibold text-gray-700 mb-1 border-b pb-[2px]">
                Strategy{" "}
                {
                  enabledClients.find(
                    (client) => client.id === form.getFieldValue("client"),
                  )?.name
                }
              </div>

              {/* Strategy List */}
              <div className="max-h-36 overflow-y-auto border rounded-md px-2 py-2 bg-gray-50 space-y-[2px]">
                {mappedStrategies.map((strategy) => (
                  <label
                    key={strategy.id}
                    className="flex items-center gap-1.5 text-[11px] cursor-pointer hover:bg-gray-100 rounded px-1 py-[5px]"
                  >
                    {/* Small Checkbox */}
                    <input
                      type="checkbox"
                      className="w-2.3 h-2.3 cursor-pointer accent-blue-600"
                      checked={selectedStrategies.includes(strategy.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedStrategies((prev) => [
                            ...prev,
                            strategy.id,
                          ]);
                        } else {
                          setSelectedStrategies((prev) =>
                            prev.filter((id) => id !== strategy.id),
                          );
                        }
                      }}
                    />

                    {/* Text */}
                    <span className="leading-none text-gray-700">
                      {strategy.id}_{strategy.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Enabled */}
          <div className="flex items-center justify-between bg-gray-50 border rounded px-3 py-2 mt-1">
            <span className="text-xs font-medium text-gray-700">Enabled</span>

            <Form.Item name="enabled" valuePropName="checked" className="mb-0">
              <Switch size="small" />
            </Form.Item>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              size="small"
              onClick={() => {
                form.resetFields();
                setOpenModal(false);
              }}
              className="h-8 px-4 text-xs"
            >
              Cancel
            </Button>

            <Button
              type="primary"
              size="small"
              htmlType="submit"
              loading={saving}
              className="h-8 px-5 text-xs font-medium"
            >
              {editingUser ? "Update" : "Create"}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
