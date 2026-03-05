import React, { useState, useEffect } from "react";
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
  message,
  Typography,
} from "antd";
import {
  EyeInvisibleOutlined,
  EyeTwoTone,
  SaveOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";

import {
  postGreeksoftApi,
  greeksoftSettingsByIdApi,
} from "../../services/SettingsService/greeksoftSettingsApi";

const { Title } = Typography;
const { Option } = Select;

const AddGreekSoft: React.FC = () => {
  const { id } = useParams();

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (!id) return;

    const fetchGreeksoftById = async () => {
      try {
        setLoading(true);

        const res = await greeksoftSettingsByIdApi(Number(id));

        const data = res?.data?.result?.[0];

        if (data) {
          form.setFieldsValue({
            user_name: data.user_name,
            user_password: data.user_password,
            session_id: data.session_id,
            session_password: data.session_password,
            session_link: data.session_link,
            order_link: data.order_link,
            base64: data.base64,
            pro: data.pro,
            is_enabled: data.is_enabled,
            type: data.type,
          });
        }
      } catch (error) {
        console.error("Failed to fetch Greeksoft by id", error);
        message.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchGreeksoftById();
  }, [id, form]);

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);

      const payload = {
        id: id ? Number(id) : 0,
        ...values,
      };

      await postGreeksoftApi(payload);

      message.success("Greeksoft added successfully");
      navigate("/greek-soft");
      form.resetFields();
    } catch (error) {
      console.error(error);
      message.error("Failed to submit data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <Title level={4} style={{ margin: 0 }}>
          Greek Soft
        </Title>

        <Button
          type="primary"
          icon={<UnorderedListOutlined />}
          className="bg-blue-600 font-semibold"
          onClick={() => navigate("/greek-soft")}
        >
          Greek Soft List
        </Button>
      </div>

      <Card size="small">
        <Form
          layout="vertical"
          form={form}
          onFinish={handleSubmit}
          initialValues={{
            base64: false,
            pro: false,
            is_enabled: false,
          }}
        >
          <Row gutter={12}>
            {/* User Name */}
            <Col span={12}>
              <Form.Item
                label="User Name"
                name="user_name"
                rules={[{ required: true, message: "User Name required" }]}
              >
                <Input placeholder="Enter username" size="middle" />
              </Form.Item>
            </Col>

            {/* User Password */}
            <Col span={12}>
              <Form.Item
                label="User Password"
                name="user_password"
                rules={[{ required: true, message: "Password required" }]}
              >
                <Input.Password
                  placeholder="Enter password"
                  iconRender={(visible) =>
                    visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                  }
                />
              </Form.Item>
            </Col>

            {/* Session ID */}
            <Col span={12}>
              <Form.Item
                label="Session ID"
                name="session_id"
                rules={[{ required: true, message: "Session ID required" }]}
              >
                <Input placeholder="Enter session id" />
              </Form.Item>
            </Col>

            {/* Session Password */}
            <Col span={12}>
              <Form.Item
                label="Session Password"
                name="session_password"
                rules={[
                  { required: true, message: "Session Password required" },
                ]}
              >
                <Input.Password
                  placeholder="Enter session password"
                  iconRender={(visible) =>
                    visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                  }
                />
              </Form.Item>
            </Col>

            {/* Session Link */}
            <Col span={12}>
              <Form.Item
                label="Session Link"
                name="session_link"
                rules={[
                  { required: true, message: "Session link required" },
                  { type: "url", message: "Enter valid URL" },
                ]}
              >
                <Input placeholder="http://localhost/session" />
              </Form.Item>
            </Col>

            {/* Order Link */}
            <Col span={12}>
              <Form.Item
                label="Order Link"
                name="order_link"
                rules={[
                  { required: true, message: "Order link required" },
                  { type: "url", message: "Enter valid URL" },
                ]}
              >
                <Input placeholder="http://localhost/order" />
              </Form.Item>
            </Col>

            {/* Type */}
            <Col span={12}>
              <Form.Item
                label="Type"
                name="type"
                rules={[{ required: true, message: "Select type" }]}
              >
                <Select placeholder="Select Type">
                  <Option value="both">Both</Option>
                  <Option value="data">Data</Option>
                  <Option value="order">Order</Option>
                </Select>
              </Form.Item>
            </Col>

            {/* Checkboxes - FIXED: Removed Checkbox.Group */}
            <Col span={12}>
              <Form.Item label="Options" style={{ marginBottom: 0 }}>
                <Row>
                  <Col span={8}>
                    <Form.Item name="base64" valuePropName="checked">
                      <Checkbox>Base64</Checkbox>
                    </Form.Item>
                  </Col>

                  <Col span={8}>
                    <Form.Item name="pro" valuePropName="checked">
                      <Checkbox>Pro</Checkbox>
                    </Form.Item>
                  </Col>

                  <Col span={8}>
                    <Form.Item name="is_enabled" valuePropName="checked">
                      <Checkbox>Enabled</Checkbox>
                    </Form.Item>
                  </Col>
                </Row>
              </Form.Item>
            </Col>
          </Row>

          {/* Submit */}
          <div className="flex justify-center mt-2">
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={loading}
            >
              Submit
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default AddGreekSoft;
