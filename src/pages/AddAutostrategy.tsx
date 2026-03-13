import React from "react";
import {
  Card,
  Input,
  Radio,
  Switch,
  TimePicker,
  Typography,
  Row,
  Col,
  Button,
  Divider,
} from "antd";
import dayjs from "dayjs";

const { Text } = Typography;

export default function AddAutostrategy() {
  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <Input placeholder="Strategy Name" size="large" className="max-w-md" />

        <Button type="primary">Strategy List</Button>
      </div>

      {/* MAIN GRID */}
      <Row gutter={[16, 16]}>
        {/* Instrument Settings */}
        <Col xs={24} xl={12}>
          <Card
            size="small"
            title={
              <span className="font-semibold text-gray-700">
                Instrument Settings
              </span>
            }
            className="shadow-sm"
          >
            <div className="space-y-4">
              {/* Index */}
              <div>
                <Text className="text-xs text-gray-500">Index</Text>
                <Input placeholder="Search instrument..." className="mt-1" />
                <Text className="text-red-500 text-xs">
                  Please select a stock
                </Text>
              </div>

              <Divider className="my-2" />

              {/* Underlying */}
              <div>
                <Text className="text-xs text-gray-500 block mb-2">
                  Underlying From
                </Text>

                <Radio.Group
                  defaultValue="equity"
                  className="flex flex-wrap gap-4"
                >
                  <Radio value="equity">Equity</Radio>
                  <Radio value="future">Future</Radio>
                  <Radio value="index">Index</Radio>
                </Radio.Group>
              </div>

              <Divider className="my-2" />

              {/* Toggles */}
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <Switch size="small" />
                  <Text className="text-gray-600 text-sm">Single Leg</Text>
                </div>

                <div className="flex items-center gap-2">
                  <Switch size="small" />
                  <Text className="text-gray-600 text-sm">Automated</Text>
                </div>
              </div>
            </div>
          </Card>
        </Col>

        {/* General Settings */}
        <Col xs={24} xl={12}>
          <Card
            size="small"
            title={
              <span className="font-semibold text-gray-700">
                General Settings
              </span>
            }
            className="shadow-sm"
          >
            <div className="space-y-4">
              {/* Strategy Type */}
              <div>
                <Text className="text-xs text-gray-500 block mb-2">
                  Strategy Type
                </Text>

                <Radio.Group defaultValue="intraday" buttonStyle="solid">
                  <Radio.Button value="intraday">Intraday</Radio.Button>

                  <Radio.Button value="positional">Positional</Radio.Button>
                </Radio.Group>
              </div>

              <Divider className="my-2" />

              {/* Entry Exit Time */}
              <Row gutter={12}>
                <Col xs={24} sm={12}>
                  <Text className="text-xs text-gray-500 block mb-1">
                    Entry Time
                  </Text>

                  <TimePicker
                    defaultValue={dayjs("09:35", "HH:mm")}
                    format="hh:mm A"
                    className="w-full"
                  />
                </Col>

                <Col xs={24} sm={12}>
                  <Text className="text-xs text-gray-500 block mb-1">
                    Exit Time
                  </Text>

                  <TimePicker
                    defaultValue={dayjs("15:15", "HH:mm")}
                    format="hh:mm A"
                    className="w-full"
                  />
                </Col>
              </Row>
            </div>
          </Card>
        </Col>

        {/* NOTE */}
        <Col span={24}>
          <Card
            size="small"
            title={<span className="font-semibold text-gray-700">Note</span>}
            className="shadow-sm"
          >
            <Input.TextArea rows={4} placeholder="Enter note here..." />
          </Card>
        </Col>
      </Row>

      {/* ACTION BUTTONS */}
      <div className="flex justify-end gap-3 mt-5">
        <Button>Cancel</Button>

        <Button type="primary">Save Strategy</Button>
      </div>
    </div>
  );
}
