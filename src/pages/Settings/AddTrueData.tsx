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
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";

import {
  postTrueDataApi,
  getTrueDataApiById,
} from "../../services/SettingsService/trueDataApi";

const { Title } = Typography;

export default function AddTrueData() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  /* ================= FETCH DATA BY ID ================= */

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const res = await getTrueDataApiById(Number(id));

        const data = res?.data?.result?.[0];

        if (!data) return;

        form.setFieldsValue({
          user: data.user,
          user_id: data.user_id,
          password: data.password,
          type: data.type,
          url: data.url,
          port: data.port,
          tick: data.tick,
          minute: data.minute,
          is_enabled: data.is_enabled,
        });
      } catch (error) {
        message.error("Failed to fetch TrueData");
      }
    };

    fetchData();
  }, [id, form]);

  /* ================= SUBMIT ================= */

  const onFinish = async (values: any) => {
    try {
      const payload = {
        id: id ? Number(id) : 0,
        user: values.user,
        user_id: values.user_id,
        password: values.password,
        type: values.type,
        minute: values.minute || false,
        tick: values.tick || false,
        url: values.url,
        port: Number(values.port),
        is_enabled: values.is_enabled || false,
      };

      await postTrueDataApi(payload);

      message.success(
        id ? "TrueData updated successfully" : "TrueData added successfully",
      );

      form.resetFields();
      navigate("/true-data");
    } catch (error) {
      message.error("Failed to save TrueData");
    }
  };

  return (
    <div className="bg-slate-100 h-[calc(100vh-65px)] p-4 flex justify-center">
      <Card
        className="w-[900px] shadow-sm rounded-xl"
        bodyStyle={{ padding: 0 }}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-3 border-b bg-white rounded-t-xl">
          <Title level={4} className="!m-0 font-semibold">
            {id ? "Edit True Data" : "Add True Data"}
          </Title>

          <Button type="primary" onClick={() => navigate("/true-data")}>
            True Data List
          </Button>
        </div>

        {/* Form */}
        <div className="p-6 flex justify-center bg-slate-50">
          <Card
            className="w-[650px] border rounded-lg shadow-sm"
            bodyStyle={{ padding: "20px 24px" }}
          >
            <Form form={form} layout="vertical" onFinish={onFinish}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="user"
                    label="User"
                    rules={[{ required: true, message: "Enter user" }]}
                  >
                    <Input placeholder="Enter user" />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    name="user_id"
                    label="User ID"
                    rules={[{ required: true, message: "Enter user id" }]}
                  >
                    <Input placeholder="Enter user id" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="password"
                    label="Password"
                    rules={[{ required: true, message: "Enter password" }]}
                  >
                    <Input.Password
                      placeholder="Enter password"
                      iconRender={(visible) =>
                        visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                      }
                    />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    name="type"
                    label="Type"
                    rules={[{ required: true, message: "Select type" }]}
                  >
                    <Select
                      placeholder="Select Type"
                      options={[
                        { label: "Both", value: "both" },
                        { label: "Data", value: "data" },
                        { label: "Order", value: "order" },
                      ]}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="url"
                    label="URL"
                    rules={[{ required: true, message: "Enter URL" }]}
                  >
                    <Input placeholder="Enter URL" />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    name="port"
                    label="Port"
                    rules={[{ required: true, message: "Enter Port" }]}
                  >
                    <Input placeholder="Enter Port" />
                  </Form.Item>
                </Col>
              </Row>

              {/* Checkboxes */}
              <Row className="mt-1 mb-4">
                <Col span={24}>
                  <div className="flex gap-6">
                    <Form.Item name="tick" valuePropName="checked" noStyle>
                      <Checkbox>Tick</Checkbox>
                    </Form.Item>

                    <Form.Item name="minute" valuePropName="checked" noStyle>
                      <Checkbox>Minute</Checkbox>
                    </Form.Item>

                    <Form.Item
                      name="is_enabled"
                      valuePropName="checked"
                      noStyle
                    >
                      <Checkbox>Is Enabled</Checkbox>
                    </Form.Item>
                  </div>
                </Col>
              </Row>

              {/* Submit */}
              <Row justify="center">
                <Button
                  type="primary"
                  htmlType="submit"
                  className="px-10 font-semibold"
                >
                  {id ? "Update" : "Submit"}
                </Button>
              </Row>
            </Form>
          </Card>
        </div>
      </Card>
    </div>
  );
}
