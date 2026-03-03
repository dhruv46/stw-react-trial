// src/pages/MoneyManagement/AddMoneyManagement.tsx

import React, { useEffect, useState } from "react";
import {
  Card,
  Form,
  Select,
  Input,
  Button,
  Row,
  Col,
  message,
  Spin,
  Typography,
} from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { FetchStrategyList } from "../../services/SettingsService/userSettingsApi";
import { getClientMasterListApi } from "../../services/SettingsService/clientSettingApi";
import {
  postMoneyManagementApi,
  fetchMoneyManagementById,
} from "../../services/SettingsService/moneyManegementSettingApi";

const { Title } = Typography;
const { Option } = Select;

interface Client {
  id: number;
  name: string;
}

interface Strategy {
  id: number;
  name: string;
}

const AddMoneyManagement = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form] = Form.useForm();

  const [clients, setClients] = useState<Client[]>([]);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(false);

  /* ================= FETCH BY ID (EDIT MODE) ================= */

  useEffect(() => {
    const loadById = async () => {
      if (!id) return;

      try {
        setLoading(true);

        const res = await fetchMoneyManagementById(Number(id));
        const data = res?.data?.result?.[0];

        if (!data) return;

        form.setFieldsValue({
          client_id: data.client_id,
          strategy_id: data.strategy_id,
          capital_balance: data.capital_balance,
        });
      } catch (error) {
        message.error("Failed to load money management data");
      } finally {
        setLoading(false);
      }
    };

    loadById();
  }, [id]);

  /* ================= FETCH CLIENT LIST ================= */

  useEffect(() => {
    const loadClients = async () => {
      try {
        const res = await getClientMasterListApi();
        setClients(res?.data?.result ?? []);
      } catch (error) {
        message.error("Failed to load clients");
      }
    };

    loadClients();
  }, []);

  /* ================= FETCH STRATEGY LIST ================= */

  useEffect(() => {
    const loadStrategies = async () => {
      try {
        const res = await FetchStrategyList();
        setStrategies(res?.data?.result ?? []);
      } catch (error) {
        message.error("Failed to load strategies");
      }
    };

    loadStrategies();
  }, []);

  /* ================= SUBMIT ================= */

  const onFinish = async (values: any) => {
    try {
      setLoading(true);

      const payload = {
        id: id ? Number(id) : 0,
        capital_balance: values.capital_balance,
        account_balance: values.capital_balance, // same as capital
        strategy_id: String(values.strategy_id),
        client_id: String(values.client_id),
      };

      const res = await postMoneyManagementApi(payload);

      if (res?.data?.result) {
        message.success(
          id
            ? "Money Management Updated Successfully"
            : "Money Management Added Successfully",
        );
        navigate("/money-management");
      } else {
        message.error("Failed to add money management");
      }
    } catch (error: any) {
      message.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-65px)] bg-slate-100 p-4">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <Title level={4} className="!m-0 !font-bold">
          Money Management
        </Title>

        <Button
          type="primary"
          className="bg-blue-600 font-semibold"
          onClick={() => navigate("/money-management")}
        >
          Money Management List
        </Button>
      </div>

      {/* FORM CARD */}
      <div className="flex justify-center">
        <Card
          className="w-full max-w-2xl rounded-xl shadow-md border"
          style={{ padding: "24px" }}
        >
          <Spin spinning={loading}>
            <Form
              form={form}
              layout="vertical"
              size="middle"
              onFinish={onFinish}
            >
              <Row gutter={20}>
                {/* Client Dropdown */}
                <Col span={12}>
                  <Form.Item
                    label="Client"
                    name="client_id"
                    rules={[{ required: true, message: "Select Client" }]}
                  >
                    <Select
                      placeholder="Select Client"
                      showSearch
                      optionFilterProp="children"
                    >
                      {clients.map((client) => (
                        <Option key={client.id} value={client.id}>
                          {client.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                {/* Strategy Dropdown */}
                <Col span={12}>
                  <Form.Item
                    label="Strategy"
                    name="strategy_id"
                    rules={[{ required: true, message: "Select Strategy" }]}
                  >
                    <Select
                      placeholder="Select Strategy"
                      showSearch
                      optionFilterProp="children"
                    >
                      {strategies.map((strategy) => (
                        <Option key={strategy.id} value={strategy.id}>
                          {strategy.id} : {strategy.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              {/* Capital Balance */}
              <Row>
                <Col span={12}>
                  <Form.Item
                    label="Capital Balance"
                    name="capital_balance"
                    rules={[
                      { required: true, message: "Enter Capital Balance" },
                    ]}
                  >
                    <Input placeholder="Enter Amount" type="number" min={0} />
                  </Form.Item>
                </Col>
              </Row>

              {/* Submit Button */}
              <div className="flex justify-center mt-6">
                <Button
                  type="primary"
                  htmlType="submit"
                  className="bg-blue-600 px-8"
                  loading={loading}
                >
                  Submit
                </Button>
              </div>
            </Form>
          </Spin>
        </Card>
      </div>
    </div>
  );
};

export default AddMoneyManagement;
