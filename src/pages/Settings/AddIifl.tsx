import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  Checkbox,
  Row,
  Col,
  Typography,
  message,
} from "antd";
import { SaveOutlined, UnorderedListOutlined } from "@ant-design/icons";
import {
  postIiflApi,
  getIiflApi,
} from "../../services/SettingsService/iiflSettingsApi";
import { CONSTANTS } from "../../mock/Constant";

const { Title } = Typography;
const { Option } = Select;

const AddIifl = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  console.log("id", id);
  const { MESSAGE_CODE } = CONSTANTS;

  const messageCodeOptions = MESSAGE_CODE.message_code.map((item) => ({
    value: item.id,
    label: item.name,
  }));

  useEffect(() => {
    if (id) {
      fetchIiflData(id);
    }
  }, [id]);

  const fetchIiflData = async (id: any) => {
    try {
      const res = await getIiflApi(id);

      const data = res?.data?.result?.[0];

      if (!data) return;

      form.setFieldsValue({
        name: data.user,
        key: data.key,
        secret: data.secret,
        url: data.url,
        broadcast_mode: data.broadcast_mode,
        source: data.source,
        type: data.type,
        message_code: data.message_code,
        timeframe: data.timeframe?.join(","), // convert array → string
        disable_ssl: data.disable_ssl,
        is_enabled: data.is_enabled,
      });
    } catch (error) {
      message.error("Failed to load IIFL data");
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const payload = {
        id: id ? Number(id) : 0,
        user: values.name, // rename
        key: values.key,
        secret: values.secret,
        url: values.url,
        broadcast_mode: values.broadcast_mode,
        source: values.source,
        type: values.type,
        message_code: values.message_code,
        timeframe: values.timeframe
          .split(",")
          .map((t: string) => Number(t.trim())), // convert to number array
        disable_ssl: values.disable_ssl,
        is_enabled: values.is_enabled,
      };

      console.log("Payload:", payload);

      await postIiflApi(payload);

      message.success("IIFL added successfully");

      form.resetFields();
      navigate("/iifl");
    } catch (error) {
      message.error("Submission failed");
    }
  };

  return (
    <div className="p-4 max-w-5xl mx-auto">
      {/* HEADER */}

      <div className="flex justify-between items-center mb-4">
        <Title level={4} style={{ margin: 0 }}>
          IIFL
        </Title>

        <Button
          type="primary"
          icon={<UnorderedListOutlined />}
          className="bg-blue-600 font-semibold"
          onClick={() => navigate("/iifl")}
        >
          IIFL List
        </Button>
      </div>

      <Card size="small">
        <Form
          layout="vertical"
          form={form}
          onFinish={handleSubmit}
          initialValues={{
            disable_ssl: false,
            is_enabled: false,
            message_code: [],
            timeframe: [],
          }}
        >
          <Row gutter={14}>
            {/* USER */}

            <Col span={12}>
              <Form.Item
                label="User"
                name="name"
                rules={[{ required: true, message: "User is required" }]}
              >
                <Input placeholder="Enter user name" />
              </Form.Item>
            </Col>

            {/* KEY */}

            <Col span={12}>
              <Form.Item
                label="Key"
                name="key"
                rules={[{ required: true, message: "Key is required" }]}
              >
                <Input placeholder="Enter key" />
              </Form.Item>
            </Col>

            {/* SECRET */}

            <Col span={12}>
              <Form.Item
                label="Secret"
                name="secret"
                rules={[{ required: true, message: "Secret is required" }]}
              >
                <Input placeholder="Enter secret" />
              </Form.Item>
            </Col>

            {/* URL */}

            <Col span={12}>
              <Form.Item
                label="URL"
                name="url"
                rules={[
                  { required: true, message: "URL is required" },
                  { type: "url", message: "Enter valid URL" },
                ]}
              >
                <Input placeholder="https://example.com" />
              </Form.Item>
            </Col>

            {/* BROADCAST MODE */}

            <Col span={12}>
              <Form.Item
                label="Broadcast Mode"
                name="broadcast_mode"
                rules={[{ required: true, message: "Broadcast Mode required" }]}
              >
                <Input placeholder="Enter broadcast mode" />
              </Form.Item>
            </Col>

            {/* SOURCE */}

            <Col span={12}>
              <Form.Item
                label="Source"
                name="source"
                rules={[{ required: true, message: "Source required" }]}
              >
                <Input placeholder="Enter source" />
              </Form.Item>
            </Col>

            {/* TYPE */}

            <Col span={12}>
              <Form.Item
                label="Type"
                name="type"
                rules={[{ required: true, message: "Type is required" }]}
              >
                <Select placeholder="Select Type">
                  <Option value="both">Both</Option>
                  <Option value="data">Data</Option>
                  <Option value="order">Order</Option>
                </Select>
              </Form.Item>
            </Col>

            {/* TIMEFRAME */}

            <Col span={12}>
              <Form.Item
                label="Timeframe"
                name="timeframe"
                rules={[{ required: true, message: "Timeframe is required" }]}
              >
                <Input placeholder="Example: 1,5,15" />
              </Form.Item>
            </Col>

            {/* MESSAGE CODE */}

            <Col span={12}>
              <Form.Item
                label="Message Code"
                name="message_code"
                rules={[{ required: true, message: "Select message code" }]}
              >
                <Checkbox.Group style={{ width: "100%" }}>
                  <div className="border rounded-md p-2 h-[130px] overflow-y-auto">
                    {messageCodeOptions.map((item) => (
                      <div key={item.value}>
                        <Checkbox value={item.value}>
                          {item.value} : {item.label}
                        </Checkbox>
                      </div>
                    ))}
                  </div>
                </Checkbox.Group>
              </Form.Item>
            </Col>

            {/* OPTIONS */}

            <Col span={12}>
              <Form.Item label="Options">
                <Row>
                  <Col span={12}>
                    <Form.Item
                      name="disable_ssl"
                      valuePropName="checked"
                      style={{ marginBottom: 0 }}
                    >
                      <Checkbox>Disable SSL</Checkbox>
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item
                      name="is_enabled"
                      valuePropName="checked"
                      style={{ marginBottom: 0 }}
                    >
                      <Checkbox>Is Enabled</Checkbox>
                    </Form.Item>
                  </Col>
                </Row>
              </Form.Item>
            </Col>
          </Row>

          {/* SUBMIT */}

          <div className="flex justify-center mt-2">
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              className="px-6"
            >
              Submit
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default AddIifl;
