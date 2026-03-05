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

// IMPORTANT: Adjust this import path to point to your actual Zerodha API service file
import {
  postZerodhaApi,
  getZerodhaSettingsApiById,
} from "../../services/SettingsService/zerodhaSettingsApi";

const { Title } = Typography;

export default function AddZerodha() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  /* ================= FETCH DATA BY ID (For Edit Mode) ================= */

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        // Uncomment and use your actual API call here:
        const res = await getZerodhaSettingsApiById(Number(id));
        const data = res?.data?.result?.[0];
        if (!data) return;

        // Mock data representing what you would get from the API when editing
        // const data = {
        //   user_id: "new ", // Maps to Name in UI
        //   key: "1234",
        //   secret: "dhruvb",
        //   password: "secret",
        //   totp: "1242",
        //   url: "http://localhost",
        //   type: "data",
        //   is_enabled: false,
        // };

        form.setFieldsValue({
          user_id: data.user_id,
          key: data.key,
          secret: data.secret,
          password: data.password,
          totp: data.totp,
          url: data.url,
          type: data.type,
          is_enabled: data.is_enabled,
        });
      } catch (error) {
        message.error("Failed to fetch Zerodha data");
      }
    };

    fetchData();
  }, [id, form]);

  /* ================= SUBMIT ================= */

  const onFinish = async (values: any) => {
    try {
      // Constructing the exact payload you requested
      const payload = {
        id: id ? Number(id) : 0,
        user_id: values.user_id, // "Name" field in UI
        key: values.key,
        secret: values.secret,
        password: values.password,
        totp: values.totp,
        url: values.url,
        type: values.type,
        is_enabled: values.is_enabled || false,
      };

      console.log("Submitting Payload:", payload);

      // Uncomment and use your actual API call here:
      await postZerodhaApi(payload);

      message.success(
        id ? "Zerodha updated successfully" : "Zerodha added successfully",
      );

      form.resetFields();
      navigate("/zerodha"); // Adjust to your actual list route
    } catch (error) {
      message.error("Failed to save Zerodha");
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
            {id ? "Edit Zerodha" : "Zerodha"}
          </Title>

          <Button
            type="primary"
            className="bg-blue-600 font-semibold"
            onClick={() => navigate("/zerodha")}
          >
            Zerodha List
          </Button>
        </div>

        {/* Form */}
        <div className="p-6 flex justify-center bg-slate-50">
          <Card
            className="w-[650px] border rounded-lg shadow-sm"
            bodyStyle={{ padding: "20px 24px" }}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              initialValues={{ is_enabled: false }}
            >
              {/* Row 1: Name & Key */}
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="user_id"
                    label="Name"
                    rules={[{ required: true, message: "Name is required" }]}
                  >
                    <Input placeholder="Enter name" />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    name="key"
                    label="Key"
                    rules={[{ required: true, message: "Key is required" }]}
                  >
                    <Input placeholder="Enter key" />
                  </Form.Item>
                </Col>
              </Row>

              {/* Row 2: Secret & Password */}
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="secret"
                    label="Secret"
                    rules={[{ required: true, message: "Secret is required" }]}
                  >
                    <Input placeholder="Enter secret" />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    name="password"
                    label="Password"
                    rules={[
                      { required: true, message: "Password is required" },
                    ]}
                  >
                    <Input.Password
                      placeholder="Enter password"
                      iconRender={(visible) =>
                        visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                      }
                    />
                  </Form.Item>
                </Col>
              </Row>

              {/* Row 3: Totp & URL */}
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="totp"
                    label="Totp"
                    rules={[{ required: true, message: "Totp is required" }]}
                  >
                    <Input placeholder="Enter totp" />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    name="url"
                    label="URL"
                    rules={[
                      { required: true, message: "URL is required" },
                      { type: "url", message: "Enter a valid URL" }, // Added URL pattern validation
                    ]}
                  >
                    <Input placeholder="Enter URL" />
                  </Form.Item>
                </Col>
              </Row>

              {/* Row 4: Type & Is Enabled */}
              <Row gutter={16} align="middle">
                <Col span={12}>
                  <Form.Item
                    name="type"
                    label="Type"
                    rules={[{ required: true, message: "Type is required" }]}
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

                <Col span={12}>
                  <Form.Item
                    name="is_enabled"
                    valuePropName="checked"
                    className="mb-0 mt-2" // Aligns checkbox nicely with the select input
                  >
                    <Checkbox>Is Enabled</Checkbox>
                  </Form.Item>
                </Col>
              </Row>

              {/* Submit */}
              <Row justify="center" className="mt-4">
                <Button
                  type="primary"
                  htmlType="submit"
                  className="px-10 font-semibold bg-blue-600"
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
