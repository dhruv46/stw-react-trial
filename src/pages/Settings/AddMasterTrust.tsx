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
  postMasterTrustApi,
  getMasterTrustApiById,
} from "../../services/SettingsService/masterTrustSettingsApi";

// Assuming you have an API file for Master Trust. Adjust the import path as needed!
// import {
//   postMasterTrustApi,
//   getMasterTrustApiById,
// } from "../../services/SettingsService/masterTrustApi";

const { Title } = Typography;

export default function AddMasterTrust() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  /* ================= FETCH DATA BY ID (For Edit Mode) ================= */

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        // Uncomment and use your actual API call here
        const res = await getMasterTrustApiById(Number(id));
        const data = res?.data?.result?.[0];
        if (!data) return;

        // Mock data for demonstration purposes
        // const data = {
        //   user: "dhruvb",
        //   password: "secret",
        //   factor2: "new123",
        //   vendor_code: "12345",
        //   app_key: "1234",
        //   imei: "1234",
        //   type: "both",
        //   host_url: "http://localhost",
        //   websocket_url: "wss://localhost",
        //   is_enabled: false,
        // };

        form.setFieldsValue({
          user: data.user,
          password: data.password,
          factor2: data.factor2,
          vendor_code: data.vendor_code,
          app_key: data.app_key,
          imei: data.imei,
          type: data.type,
          host_url: data.host_url,
          websocket_url: data.websocket_url,
          is_enabled: data.is_enabled,
        });
      } catch (error) {
        message.error("Failed to fetch Master Trust data");
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
        user: values.user,
        password: values.password,
        factor2: values.factor2,
        vendor_code: values.vendor_code,
        app_key: values.app_key,
        imei: values.imei,
        type: values.type,
        host_url: values.host_url,
        websocket_url: values.websocket_url,
        is_enabled: values.is_enabled || false,
      };

      console.log("Submitting Payload:", payload);

      // Uncomment and use your actual API call here
      await postMasterTrustApi(payload);

      message.success(
        id
          ? "Master Trust updated successfully"
          : "Master Trust added successfully",
      );

      form.resetFields();
      navigate("/master-trust"); // Adjust route as needed
    } catch (error) {
      message.error("Failed to save Master Trust");
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
            {id ? "Edit Master Trust" : "Master Trust"}
          </Title>

          <Button
            type="primary"
            className="bg-blue-600 font-semibold"
            onClick={() => navigate("/master-trust")}
          >
            Master Trust List
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
              <Row gutter={16}>
                {/* Name -> Maps to "user" in payload */}
                <Col span={12}>
                  <Form.Item
                    name="user"
                    label="Name"
                    rules={[{ required: true, message: "User is required" }]}
                  >
                    <Input placeholder="Enter name" />
                  </Form.Item>
                </Col>

                {/* Password */}
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

              <Row gutter={16}>
                {/* Factor2 */}
                <Col span={12}>
                  <Form.Item
                    name="factor2"
                    label="Factor2"
                    rules={[{ required: true, message: "Factor2 is required" }]}
                  >
                    <Input placeholder="Enter factor2" />
                  </Form.Item>
                </Col>

                {/* Vendor Code */}
                <Col span={12}>
                  <Form.Item
                    name="vendor_code"
                    label="Vendor Code"
                    rules={[
                      { required: true, message: "Vendor Code is required" },
                    ]}
                  >
                    <Input placeholder="Enter vendor code" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                {/* App Key */}
                <Col span={12}>
                  <Form.Item
                    name="app_key"
                    label="App Key"
                    rules={[{ required: true, message: "App Key is required" }]}
                  >
                    <Input placeholder="Enter app key" />
                  </Form.Item>
                </Col>

                {/* IMEI */}
                <Col span={12}>
                  <Form.Item
                    name="imei"
                    label="IMEI"
                    // Adding required rule assuming it is needed based on the pattern
                    rules={[{ required: true, message: "IMEI is required" }]}
                  >
                    <Input placeholder="Enter IMEI" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                {/* Host Url */}
                <Col span={12}>
                  <Form.Item
                    name="host_url"
                    label="Host Url"
                    rules={[
                      { required: true, message: "Host Url is required" },
                    ]}
                  >
                    <Input placeholder="Enter host url" />
                  </Form.Item>
                </Col>

                {/* Websocket Url */}
                <Col span={12}>
                  <Form.Item
                    name="websocket_url"
                    label="Websocket Url"
                    rules={[
                      { required: true, message: "Websocket Url is required" },
                    ]}
                  >
                    <Input placeholder="Enter websocket url" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16} align="middle">
                {/* Type */}
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

                {/* Is Enabled Checkbox */}
                <Col span={12}>
                  <Form.Item
                    name="is_enabled"
                    valuePropName="checked"
                    className="mb-0 mt-2" // Adjusting margins so it sits nicely next to the Type dropdown
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
