import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  Row,
  Col,
  Typography,
  DatePicker,
  message,
} from "antd";
import dayjs from "dayjs";
import { getClientMasterListApi } from "../../services/SettingsService/clientSettingApi";
import {
  getBrokerListApi,
  postBrokerageChargesApi,
} from "../../services/SettingsService/brokerageSettingAPi";

const { Title } = Typography;

export default function AddBrokerage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const brokerageData = location.state?.brokerageData;
  const navigate = useNavigate();
  const [form] = Form.useForm();

  // State for clients and brokers
  const [clients, setClients] = useState<{ id: number; name: string }[]>([]);
  const [brokers, setBrokers] = useState<{ name: string; full_name: string }[]>(
    [],
  );

  console.log("ID:", id);
  console.log("Brokerage Data:", brokerageData);

  // Fetch clients
  const loadClients = async () => {
    try {
      const res = await getClientMasterListApi();
      const clientData = res?.data?.result || [];
      setClients(clientData);
    } catch (err) {
      console.error("Client API Error:", err);
      message.error("Failed to load clients");
    }
  };

  // Fetch brokers
  const loadBrokers = async () => {
    try {
      const res = await getBrokerListApi();
      const brokerData = res?.data?.result || [];
      setBrokers(brokerData);
    } catch (err) {
      console.error("Broker API Error:", err);
      message.error("Failed to load brokers");
    }
  };

  useEffect(() => {
    loadClients();
    loadBrokers();
  }, []);

  useEffect(() => {
    if (brokerageData) {
      // Convert timestamp to dayjs for DatePicker
      const start_date = brokerageData.start_date
        ? dayjs(brokerageData.start_date)
        : null;
      const end_date = brokerageData.end_date
        ? dayjs(brokerageData.end_date)
        : null;

      // Prepare initial form values
      const initialValues: any = {
        start_date,
        end_date,
        type: brokerageData.type,
        broker: brokerageData.broker,
        client_id: brokerageData.client_id,
      };

      // Set buy_ and sell_ fields dynamically
      chargeFields.forEach((field) => {
        initialValues[`buy_${field.key}`] = brokerageData[`buy_${field.key}`];
        initialValues[`sell_${field.key}`] = brokerageData[`sell_${field.key}`];
      });

      form.setFieldsValue(initialValues);
    }
  }, [brokerageData, form]);

  const onFinish = async (values: any) => {
    try {
      const client = clients.find((c) => c.id === values.client_id);
      const broker = brokers.find((b) => b.name === values.broker);

      const payload: any = {
        id: brokerageData?.id || 0, // Use existing id in edit mode
        charges_type: values.type,
        client_id: String(values.client_id),
        broker: broker?.name || "",
        start_date: dayjs(values.start_date).format("YYYY/MM/DD"),
        end_date: dayjs(values.end_date).format("YYYY/MM/DD"),
      };

      chargeFields.forEach((field) => {
        payload[`buy_${field.key}`] = values[`buy_${field.key}`];
        payload[`sell_${field.key}`] = values[`sell_${field.key}`];
      });

      console.log("Submitting Payload:", payload);

      await postBrokerageChargesApi(payload);

      message.success(
        brokerageData
          ? "Brokerage charges updated successfully"
          : "Brokerage charges added successfully",
      );
      form.resetFields();
      navigate("/brokerage-list");
    } catch (error) {
      message.error("Failed to save Brokerage charges");
    }
  };
  // Charge fields
  const chargeFields = [
    { label: "Brokerage per order", key: "brokerage_order" },
    { label: "Brokerage in percentage", key: "brokerage_percentage" },
    { label: "Brokerage per lot", key: "brokerage_lot_size" },
    { label: "STT CTT", key: "stt_ctt" },
    { label: "Transaction Charges NSE (%)", key: "transaction_charges_nse" },
    { label: "Transaction Charges BSE (%)", key: "transaction_charges_bse" },
    { label: "GST (%)", key: "gst" },
    { label: "Stamp Charges Percentage (%)", key: "stamp_charges_percentage" },
    { label: "Stamp Charges Flat (%)", key: "stamp_charges_flat" },
    { label: "Investor Protection Charges (%)", key: "inv_protection_charges" },
    { label: "Clearing Charges (%)", key: "clearing_charges" },
    { label: "SEBI Charges", key: "sebi_charges" },
  ];

  return (
    <div className="min-h-[calc(100vh-65px)] bg-slate-50 p-2 md:p-4 flex justify-center">
      <Card
        className="w-full max-w-[1400px] shadow-sm rounded-lg"
        style={{ padding: 0 }}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-3 border-b bg-white rounded-t-lg">
          <Title level={4} className="!m-0 text-slate-700 font-medium">
            Brokerage Charges
          </Title>
          <Button
            type="default"
            className="text-blue-600 border-blue-200 bg-blue-50/30 font-semibold h-[30px]"
            onClick={() => navigate("/brokerage-list")}
          >
            Brokerage List
          </Button>
        </div>

        {/* Form Container */}
        <div className="p-4 bg-white rounded-b-lg">
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            className="compact-form"
            initialValues={{
              start_date: dayjs("2025-04-01"),
              end_date: dayjs("2026-03-31"),
            }}
          >
            {/* Top Filter Row */}
            <Row gutter={12} className="mb-4 pb-4 border-b border-gray-100">
              <Col xs={12} sm={8} md={4}>
                <Form.Item name="start_date" label="Start Date">
                  <DatePicker
                    format="DD-MM-YYYY"
                    className="w-full compact-input"
                  />
                </Form.Item>
              </Col>
              <Col xs={12} sm={8} md={4}>
                <Form.Item name="end_date" label="End Date">
                  <DatePicker
                    format="DD-MM-YYYY"
                    className="w-full compact-input"
                  />
                </Form.Item>
              </Col>
              <Col xs={12} sm={8} md={4}>
                <Form.Item name="client_id" label="Client">
                  <Select
                    placeholder="Select Client"
                    className="compact-select"
                    options={clients.map((client) => ({
                      value: client.id,
                      label: client.name,
                    }))}
                  />
                </Form.Item>
              </Col>
              <Col xs={12} sm={12} md={4}>
                <Form.Item
                  name="type"
                  label="Charges Type"
                  rules={[
                    { required: true, message: "Charges type is required" },
                  ]}
                >
                  <Select
                    placeholder="Select Charges Type"
                    className="compact-select"
                  >
                    <Select.Option value="FUTURE">Future</Select.Option>
                    <Select.Option value="OPTION">Option</Select.Option>
                    <Select.Option value="EQ_DELIVERY">
                      EQ Delivery
                    </Select.Option>
                    <Select.Option value="EQ_INTRADAY">
                      EQ Intraday
                    </Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={12} sm={12} md={4}>
                <Form.Item
                  name="broker"
                  label="Broker"
                  rules={[{ required: true, message: "Broker is required" }]}
                >
                  <Select
                    placeholder="Select Broker"
                    className="compact-select"
                    options={brokers.map((broker) => ({
                      value: broker.name,
                      label: broker.full_name,
                    }))}
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* Split Section for Buy and Sell */}
            <Row gutter={32}>
              <Col
                xs={24}
                lg={12}
                className="mb-6 lg:mb-0 border-r border-transparent lg:border-gray-100 pr-0 lg:pr-6"
              >
                <Title
                  level={5}
                  className="!text-emerald-500 !mb-3 !font-medium"
                >
                  Buy Charges
                </Title>
                <Row gutter={12}>
                  {chargeFields.map((field) => (
                    <Col span={8} key={`buy_${field.key}`}>
                      <Form.Item
                        name={`buy_${field.key}`}
                        label={field.label}
                        rules={[{ required: true, message: "Required" }]}
                      >
                        <Input
                          type="number"
                          step="0.00001"
                          className="compact-input"
                        />
                      </Form.Item>
                    </Col>
                  ))}
                </Row>
              </Col>

              <Col xs={24} lg={12} className="pl-0 lg:pl-4">
                <Title level={5} className="!text-red-500 !mb-3 !font-medium">
                  Sell Charges
                </Title>
                <Row gutter={12}>
                  {chargeFields.map((field) => (
                    <Col span={8} key={`sell_${field.key}`}>
                      <Form.Item
                        name={`sell_${field.key}`}
                        label={field.label}
                        rules={[
                          {
                            required: true,
                            message: `${field.label} is required`,
                          },
                        ]}
                      >
                        <Input
                          type="number"
                          step="0.00001"
                          className="compact-input"
                        />
                      </Form.Item>
                    </Col>
                  ))}
                </Row>
              </Col>
            </Row>

            {/* Submit Button */}
            <div className="mt-4 pt-4">
              <Button
                type="default"
                htmlType="submit"
                className="rounded-full px-8 font-medium text-blue-600 border-blue-600 hover:bg-blue-50"
              >
                Submit
              </Button>
            </div>
          </Form>
        </div>
      </Card>

      {/* ULTRA COMPACT STYLES */}
      <style>{`
.compact-form .ant-form-item { margin-bottom: 12px !important; }
.compact-form .ant-form-item-label > label { font-size: 10px !important; line-height: 1 !important; color: #4b5563 !important; }
.compact-input { height: 26px !important; font-size: 11px !important; padding: 0 8px !important; border-radius: 4px !important; }
.compact-select .ant-select-selector { height: 26px !important; min-height: 26px !important; font-size: 11px !important; border-radius: 4px !important; padding: 0 8px !important; align-items: center; }
.compact-select .ant-select-selection-item { line-height: 24px !important; }
.compact-form .ant-picker { height: 26px !important; padding: 0 8px !important; }
.compact-form .ant-form-item-explain-error { font-size: 9px !important; margin-top: 2px !important; line-height: 1.1 !important; }
input[type="number"]::-webkit-inner-spin-button, input[type="number"]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
input[type="number"] { -moz-appearance: textfield; }
`}</style>
    </div>
  );
}
