// src/pages/Client/addClient.tsx

import React, { useEffect, useState } from "react";
import {
  Card,
  Form,
  Input,
  Select,
  Checkbox,
  Button,
  Row,
  Col,
  Spin,
  message,
} from "antd";
import { FetchStrategyList } from "../../services/SettingsService/userSettingsApi";
import {
  fetchIIFLlistApi,
  fetchGreeksoftApiListApi,
  fetchTruedataApiList,
  fetchZerodhaApiList,
  fetchMastertrustApiList,
  addClientDataApi,
} from "../../services/SettingsService/clientSettingApi";
import { useNavigate } from "react-router-dom";

const { Option } = Select;

interface Strategy {
  id: number;
  name: string;
  strategy_enabled: boolean;
}

interface StrategyResponse {
  data: {
    result: Strategy[];
  };
}

const AddClient: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiList, setApiList] = useState<{ id: number; name: string }[]>([]);
  const [apiLoading, setApiLoading] = useState(false);

  // ===============================
  // Fetch Strategy List
  // ===============================
  const loadStrategies = async () => {
    try {
      setLoading(true);
      const res = await FetchStrategyList();

      if (res?.data?.result) {
        setStrategies(res.data.result);
      }
    } catch (error) {
      message.error("Failed to load strategies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStrategies();
  }, []);

  const loadBrokerApis = async (broker: string) => {
    try {
      setApiLoading(true);
      setApiList([]);
      form.setFieldsValue({ api: undefined }); // reset api select

      let res;

      switch (broker) {
        case "zerodha":
          res = await fetchZerodhaApiList();
          break;
        case "angel": // greeksoft
          res = await fetchGreeksoftApiListApi();
          break;
        case "iifl":
          res = await fetchIIFLlistApi();
          break;
        case "truedata":
          res = await fetchTruedataApiList();
          break;
        case "mastertrust":
          res = await fetchMastertrustApiList();
          break;
        default:
          return;
      }

      if (res?.data?.result) {
        setApiList(res.data.result);
      }
    } catch (error) {
      message.error("Failed to load API list");
    } finally {
      setApiLoading(false);
    }
  };


  // ===============================
  // Submit
  // ===============================
  const onFinish = async (values: any) => {
    try {
      setLoading(true);

      const payload = {
        id: 0,
        name: values.name,
        broker: values.broker === "angel" ? "greeksoft" : values.broker, // fix mapping
        api: values.api,
        strategy: Array.isArray(values.strategies)
          ? values.strategies
          : [values.strategies],
        mode: values.mode,
        is_enabled: values.is_enabled,
      };

      console.log("Payload:", payload);

      const res = await addClientDataApi(payload);

      console.log("Response:", res);

      if (res?.data?.result?.[0] === "Request Received") {
        message.success("Client Created Successfully");
        form.resetFields();
        navigate("/client-data");
      } else {
        message.error("Failed to create client");
      }
    } catch (error: any) {
      message.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center py-4">
      <Card
        title={<span style={{ fontSize: 14 }}>Add Client Account</span>}
        className="w-full max-w-2xl"
        style={{ padding: "14px 16px" }}
      >
        <Form
          form={form}
          layout="vertical"
          size="small"
          onFinish={onFinish}
          initialValues={{
            is_enabled: true,
          }}
        >
          <Row gutter={12}>
            {/* Name */}
            <Col span={12}>
              <Form.Item
                label={<span style={{ fontSize: 12 }}>Name</span>}
                name="name"
                rules={[{ required: true, message: "Enter name" }]}
              >
                <Input placeholder="Client name" size="small" />
              </Form.Item>
            </Col>

            {/* Broker */}
            <Col span={12}>
              <Form.Item
                label={<span style={{ fontSize: 12 }}>Broker</span>}
                name="broker"
                rules={[{ required: true, message: "Select broker" }]}
              >
                <Select
                  placeholder="Select"
                  size="small"
                  onChange={(value) => loadBrokerApis(value)}
                >
                  <Option value="zerodha">Zerodha</Option>
                  <Option value="angel">Greeksoft</Option>
                  <Option value="iifl">IIFL</Option>
                  <Option value="truedata">True Data</Option>
                  <Option value="mastertrust">Master Trust</Option>
                </Select>
              </Form.Item>
            </Col>

            {/* API */}
            <Col span={12}>
              <Form.Item
                label={<span style={{ fontSize: 12 }}>API</span>}
                name="api"
                rules={[{ required: true, message: "Select API" }]}
              >
                <Select
                  placeholder="Select API"
                  size="small"
                  loading={apiLoading}
                  disabled={!apiList.length}
                >
                  {apiList.map((api) => (
                    <Option key={api.id} value={api.id}>
                      {api.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            {/* Mode */}
            <Col span={12}>
              <Form.Item
                label={<span style={{ fontSize: 12 }}>Mode</span>}
                name="mode"
                rules={[{ required: true, message: "Select mode" }]}
              >
                <Select placeholder="Select" size="small">
                  <Option value="live">Live</Option>
                  <Option value="sim">Sim</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* Strategy */}
          {/* <Form.Item
            label={<span style={{ fontSize: 12 }}>Strategy</span>}
            name="strategies"
            style={{ marginBottom: 12 }}
          >
            <Spin spinning={loading}>
              <div
                style={{
                  maxHeight: 160,
                  overflowY: "auto",
                  border: "1px solid #e5e7eb",
                  padding: 6,
                  borderRadius: 4,
                }}
              >
                <Checkbox.Group style={{ width: "100%" }}>
                  <Row gutter={[4, 4]}>
                    {strategies.map((strategy) => (
                      <Col span={12} key={strategy.id}>
                        <Checkbox
                          value={strategy.id}
                          style={{
                            fontSize: 11,
                            lineHeight: "16px",
                          }}
                        >
                          {strategy.id} : {strategy.name}
                        </Checkbox>
                      </Col>
                    ))}
                  </Row>
                </Checkbox.Group>
              </div>
            </Spin>
          </Form.Item> */}
          {/* Strategy */}
          <Spin spinning={loading}>
            <div
              style={{
                maxHeight: 160,
                overflowY: "auto",
                border: "1px solid #e5e7eb",
                padding: 6,
                borderRadius: 4,
                marginBottom: 12,
              }}
            >
              <Form.Item
                label={<span style={{ fontSize: 12 }}>Strategy</span>}
                name="strategies"
                style={{ marginBottom: 0 }}
              >
                <Checkbox.Group style={{ width: "100%" }}>
                  <Row gutter={[4, 4]}>
                    {strategies.map((strategy) => (
                      <Col span={12} key={strategy.id}>
                        <Checkbox
                          value={strategy.id}
                          style={{
                            fontSize: 11,
                            lineHeight: "16px",
                          }}
                        >
                          {strategy.id} : {strategy.name}
                        </Checkbox>
                      </Col>
                    ))}
                  </Row>
                </Checkbox.Group>
              </Form.Item>
            </div>
          </Spin>

          {/* Enabled + Submit */}
          <div className="flex justify-between items-center mt-2">
            <Form.Item
              name="is_enabled"
              valuePropName="checked"
              style={{ marginBottom: 0 }}
            >
              <Checkbox style={{ fontSize: 12 }}>Is Enabled</Checkbox>
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              size="small"
              loading={loading}
            >
              Submit
            </Button>
          </div>
        </Form>
      </Card>
      <style>
        {`
  .ant-checkbox-wrapper {
    font-size: 11px !important;
    margin-bottom: 2px !important;
  }
`}
      </style>
    </div>
  );
};

export default AddClient;
