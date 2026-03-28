import React from "react";
import {
  Card,
  DatePicker,
  Select,
  Input,
  Checkbox,
  Button,
  Typography,
  Row,
  Col,
} from "antd";
import { SearchOutlined, DownloadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const DownloadReport = () => {
  // Reusable label styling for consistency
  const labelClass =
    "block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5";

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gray-50 flex flex-col gap-6">
      {/* --- First Card: OHLC --- */}
      <Card
        className="w-full rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 bg-white"
        styles={{ body: { padding: "24px" } }}
      >
        <Row gutter={[20, 20]} align="bottom">
          {/* Title */}
          <Col xs={24} lg={3} className="flex h-full items-center pb-2">
            <Title level={4} className="!m-0 !font-medium !text-gray-700">
              OHLC
            </Title>
          </Col>

          {/* Date Range */}
          <Col xs={24} sm={12} md={8} lg={6}>
            <div className="flex flex-col">
              <Text className={labelClass}>Date Range</Text>
              <RangePicker
                size="large"
                className="w-full"
                defaultValue={[dayjs("2026-03-28"), dayjs("2026-03-28")]}
                format="DD/MM/YYYY"
              />
            </div>
          </Col>

          {/* Segment Select */}
          <Col xs={24} sm={12} md={6} lg={4}>
            <div className="flex flex-col">
              <Text className={labelClass}>Segment</Text>
              <Select
                size="large"
                className="w-full"
                defaultValue="Equity"
                options={[{ value: "Equity", label: "Equity" }]}
              />
            </div>
          </Col>

          {/* Search Input */}
          <Col xs={24} sm={12} md={6} lg={5}>
            <div className="flex flex-col">
              <Text className={labelClass}>Search</Text>
              <Input
                size="large"
                placeholder="Search Stocks"
                suffix={<SearchOutlined className="text-gray-400" />}
                className="w-full"
              />
            </div>
          </Col>

          {/* Checkbox */}
          <Col xs={24} sm={12} md={4} lg={3}>
            <div className="flex items-center h-full pb-2">
              <Checkbox className="text-gray-600 font-medium">
                All Strategy
              </Checkbox>
            </div>
          </Col>

          {/* Download Button */}
          <Col xs={24} lg={3} className="text-right">
            <Button
              size="large"
              disabled
              className="w-full font-medium border-none bg-gray-100 !text-gray-400 rounded-lg"
            >
              Download
            </Button>
          </Col>
        </Row>
      </Card>

      {/* --- Second Card: GreekSoft OHLC --- */}
      <Card
        className="w-full rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 bg-white"
        styles={{ body: { padding: "24px" } }}
      >
        <Row gutter={[20, 20]} align="bottom">
          {/* Title */}
          <Col xs={24} lg={4} className="flex h-full items-center pb-2">
            <Title level={4} className="!m-0 !font-semibold !text-gray-800">
              GreekSoft OHLC
            </Title>
          </Col>

          {/* Start Date */}
          <Col xs={12} sm={8} md={5} lg={3}>
            <div className="flex flex-col">
              <Text className={labelClass}>Start Date</Text>
              <DatePicker
                size="large"
                className="w-full"
                defaultValue={dayjs("2026-03-28")}
                format="DD-MM-YYYY"
              />
            </div>
          </Col>

          {/* End Date */}
          <Col xs={12} sm={8} md={5} lg={3}>
            <div className="flex flex-col">
              <Text className={labelClass}>End Date</Text>
              <DatePicker
                size="large"
                className="w-full"
                defaultValue={dayjs("2026-03-28")}
                format="DD-MM-YYYY"
              />
            </div>
          </Col>

          {/* OHLC Type Select */}
          <Col xs={24} sm={8} md={5} lg={4}>
            <div className="flex flex-col">
              <Text className={labelClass}>OHLC Type</Text>
              <Select
                size="large"
                className="w-full"
                placeholder="Select Type"
                options={[
                  { value: "daily", label: "Daily" },
                  { value: "weekly", label: "Weekly" },
                ]}
              />
            </div>
          </Col>

          {/* OHLC Instrument Select */}
          <Col xs={24} sm={12} md={5} lg={6}>
            <div className="flex flex-col">
              <Text className={labelClass}>Instrument</Text>
              <Select
                size="large"
                className="w-full"
                placeholder="Select Instrument"
                options={[
                  { value: "inst1", label: "Instrument 1" },
                  { value: "inst2", label: "Instrument 2" },
                ]}
              />
            </div>
          </Col>

          {/* Download Button */}
          <Col xs={24} sm={12} md={4} lg={4} className="text-right">
            <Button
              size="large"
              type="primary"
              icon={<DownloadOutlined />}
              className="w-full font-medium border-none bg-[#4f9c73] hover:!bg-[#3d7d5b] shadow-sm rounded-lg transition-colors"
            >
              Download CSV
            </Button>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default DownloadReport;
