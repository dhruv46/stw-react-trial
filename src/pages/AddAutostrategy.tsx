import React, { useEffect, useState } from "react";
import {
  Card,
  Radio,
  Switch,
  TimePicker,
  Typography,
  Row,
  Col,
  Button,
  Divider,
  Select,
  Input,
  InputNumber,
} from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
// Adjust your imports as needed
import {
  searchInstrumentApi,
  fetchConditionMap,
} from "../services/autoStrategyApi";
import { useNavigate } from "react-router-dom";

const { Text, Title } = Typography;
const { Option } = Select;

export default function AddAutostrategy() {
  const navigate = useNavigate();
  const [options, setOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [underlying, setUnderlying] = useState("equity");
  const [multiLeg, setMultiLeg] = useState(false);

  // Holds the massive JSON response from API
  const [conditionMap, setConditionMap] = useState<any>(null);

  // Holds the dynamically added strategy blocks
  const [ruleBlocks, setRuleBlocks] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetchConditionMap();
        setConditionMap(res?.data?.result || null);
      } catch (error) {
        console.error("Error fetching condition map:", error);
      }
    };

    fetchData();
  }, []);

  // 🔎 Instrument Search
  const handleSearchInstrument = async (value: string) => {
    if (!value) return;
    try {
      setLoading(true);
      const res = await searchInstrumentApi(value, "EQ");
      const list = res?.data?.result || [];
      setOptions(list);
    } catch (err) {
      console.error("Instrument search error:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- Dynamic Block Handlers ---

  const addRuleBlock = () => {
    setRuleBlocks([
      ...ruleBlocks,
      {
        id: Date.now(),
        section: null,
        strategy: null,
        version: null,
        values: {},
      },
    ]);
  };

  const removeRuleBlock = (id: number) => {
    setRuleBlocks(ruleBlocks.filter((b) => b.id !== id));
  };

  const updateRuleBlock = (id: number, field: string, value: any) => {
    setRuleBlocks((prev) =>
      prev.map((block) => {
        if (block.id === id) {
          const newBlock = { ...block, [field]: value };
          // Reset dependent fields if parent changes
          if (field === "section") {
            newBlock.strategy = null;
            newBlock.version = null;
            newBlock.values = {};
          }
          if (field === "strategy") {
            newBlock.version = null;
            newBlock.values = {};
          }
          if (field === "version") {
            newBlock.values = {};
          }
          return newBlock;
        }
        return block;
      }),
    );
  };

  const updateRuleValue = (id: number, key: string, value: any) => {
    setRuleBlocks((prev) =>
      prev.map((block) =>
        block.id === id
          ? { ...block, values: { ...block.values, [key]: value } }
          : block,
      ),
    );
  };

  // --- Dynamic UI Renderers ---

  // Helper to extract nested indicators (e.g. "sma(atrv)" -> ["sma", "atrv"])
  const getExtractedIndicators = (indString: string) => {
    return indString.match(/[a-zA-Z0-9_]+/g) || [];
  };

  const renderField = (
    blockId: number,
    key: string,
    config: any,
    currentValue: any,
  ) => {
    const { label, type, multiple } = config;

    const customTypes = conditionMap?.custom_type || {};

    // 1. Time Picker
    if (type === "time") {
      return (
        <TimePicker
          className="w-full"
          format="hh:mm A"
          value={currentValue ? dayjs(currentValue, "HH:mm") : null}
          onChange={(time, timeString) =>
            updateRuleValue(blockId, key, timeString)
          }
        />
      );
    }

    // 2. Boolean (Switch)
    if (type === "bool") {
      return (
        <Select
          className="w-full"
          placeholder="Select"
          value={currentValue}
          onChange={(val) => updateRuleValue(blockId, key, val)}
        >
          <Option value={true}>Yes</Option>
          <Option value={false}>No</Option>
        </Select>
      );
    }

    // 3. Number (Float / Int)
    if (type === "int" || type === "float") {
      return (
        <InputNumber
          className="w-full"
          value={currentValue}
          onChange={(val) => updateRuleValue(blockId, key, val)}
        />
      );
    }

    // 4. Custom Dropdowns (trade_type, pivot_type, etc.)
    if (customTypes[type]) {
      return (
        <Select
          className="w-full"
          mode={multiple ? "multiple" : undefined}
          allowClear
          value={currentValue}
          onChange={(val) => updateRuleValue(blockId, key, val)}
          placeholder={`Select ${label}`}
        >
          {customTypes[type].map((opt: string) => (
            <Option key={opt} value={opt}>
              {opt.toUpperCase()}
            </Option>
          ))}
        </Select>
      );
    }

    // Default Fallback Text Input
    return (
      <Input
        value={currentValue}
        onChange={(e) => updateRuleValue(blockId, key, e.target.value)}
      />
    );
  };

  // Render a single rule block
  const renderRuleBlock = (block: any) => {
    const sections = conditionMap
      ? Object.keys(conditionMap).filter(
          (k) => k !== "indicator" && k !== "custom_type",
        )
      : [];
    const strategies = block.section
      ? Object.keys(conditionMap[block.section] || {})
      : [];
    const versions =
      block.section && block.strategy
        ? conditionMap[block.section][block.strategy]?.version || []
        : [];

    const activeConfig =
      block.section && block.strategy && block.version
        ? conditionMap[block.section][block.strategy][block.version]
        : null;

    // Separate arrays for Strategy Settings vs Indicator Settings
    const strategySettings: { key: string; config: any }[] = [];
    const indicatorList: { name: string; fields: any[] }[] = [];

    if (activeConfig) {
      // 1. Parse standard Strategy settings
      if (activeConfig.settings) {
        Object.entries(activeConfig.settings).forEach(([k, v]) => {
          strategySettings.push({ key: k, config: v });
        });
      }

      // 2. Parse Indicator settings
      if (activeConfig.indicator && conditionMap.indicator) {
        activeConfig.indicator.forEach((indString: string) => {
          const parsedInds = getExtractedIndicators(indString);
          parsedInds.forEach((indName) => {
            const indConfig = conditionMap.indicator[indName];
            if (indConfig) {
              const fields: any[] = [];
              Object.entries(indConfig).forEach(([ik, iv]: [string, any]) => {
                // Ignore purely backend fields like "instrument" if it's not needed in UI
                if (ik !== "instrument") {
                  fields.push({
                    key: `ind_${indName}_${ik}`,
                    // Format key name to a nice label (e.g. "timeframe" -> "Timeframe")
                    label:
                      ik.charAt(0).toUpperCase() +
                      ik.slice(1).replace("_", " "),
                    type: iv.type,
                    edit: iv.edit,
                    defaultValue: iv.default,
                  });
                }
              });
              indicatorList.push({ name: indName, fields });
            }
          });
        });
      }
    }

    return (
      <div
        key={block.id}
        className="mb-4 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
      >
        {/* Top Selectors Row */}
        <div className="p-4 flex flex-wrap gap-4 border-b border-gray-100 bg-gray-50/50">
          <Select
            className="w-32"
            placeholder="Section"
            value={block.section}
            onChange={(val) => updateRuleBlock(block.id, "section", val)}
          >
            {sections.map((s) => (
              <Option key={s} value={s}>
                {s}
              </Option>
            ))}
          </Select>

          <Select
            className="w-40"
            placeholder="Strategy"
            value={block.strategy}
            disabled={!block.section}
            onChange={(val) => updateRuleBlock(block.id, "strategy", val)}
          >
            {strategies.map((s) => (
              <Option key={s} value={s}>
                {s}
              </Option>
            ))}
          </Select>

          <Select
            className="w-32"
            placeholder="Version"
            value={block.version}
            disabled={!block.strategy}
            onChange={(val) => updateRuleBlock(block.id, "version", val)}
          >
            {versions.map((v: number) => (
              <Option key={v} value={v}>
                {v}
              </Option>
            ))}
          </Select>
        </div>

        {/* Dynamic Body */}
        {block.version && activeConfig && (
          <div>
            {/* Header Title Bar */}
            <div className="px-4 py-3 bg-gray-50 flex justify-between items-center border-b border-gray-200">
              <span className="text-gray-700 font-medium">
                {block.section} {block.strategy} 1.{block.version}
              </span>
              <Button
                type="text"
                danger
                icon={<DeleteOutlined className="text-lg" />}
                onClick={() => removeRuleBlock(block.id)}
              />
            </div>

            {/* Split UI: Settings on top, Indicators on bottom */}
            <div className="p-4 space-y-4">
              {/* === STRATEGY SETTINGS ROW === */}
              {strategySettings.length > 0 && (
                <div>
                  <div className="text-sm text-gray-800 font-medium mb-3">
                    Settings
                  </div>
                  <Row gutter={[16, 16]}>
                    {strategySettings.map((field) => (
                      <Col xs={24} sm={12} md={8} lg={4} key={field.key}>
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-600 mb-1 truncate">
                            {field.config.label}
                          </span>
                          {renderField(
                            block.id,
                            field.key,
                            field.config,
                            block.values[field.key],
                          )}
                        </div>
                      </Col>
                    ))}
                  </Row>
                </div>
              )}

              {/* DIVIDER BETWEEN SECTIONS */}
              {strategySettings.length > 0 && indicatorList.length > 0 && (
                <Divider className="my-2" />
              )}

              {/* === INDICATOR SETTINGS ROW === */}
              {indicatorList.length > 0 && (
                <div className="space-y-4">
                  {indicatorList.map((ind, idx) => (
                    <Row gutter={[16, 16]} key={idx} className="items-end">
                      {/* Read-only Indicator Name Box */}
                      <Col xs={24} sm={12} md={8} lg={4}>
                        <div className="flex flex-col">
                          <span className="text-sm text-gray-800 font-medium mb-3">
                            Indicator
                          </span>
                          <Input
                            disabled
                            value={ind.name}
                            className="bg-gray-100 text-gray-700 cursor-not-allowed border-gray-200"
                          />
                        </div>
                      </Col>

                      {/* Indicator Sub-Fields */}
                      {ind.fields.map((f) => {
                        const val =
                          block.values[f.key] !== undefined
                            ? block.values[f.key]
                            : f.defaultValue;

                        return (
                          <Col xs={24} sm={12} md={8} lg={4} key={f.key}>
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-600 mb-1">
                                {f.label}
                              </span>
                              {f.edit ? (
                                // Render normal input for editable fields
                                renderField(
                                  block.id,
                                  f.key,
                                  { label: f.label, type: f.type },
                                  val,
                                )
                              ) : (
                                // Render disabled gray box for non-editable fields (like "field: close")
                                <Input
                                  disabled
                                  value={val}
                                  className="bg-gray-100 text-gray-700 cursor-not-allowed border-gray-200"
                                />
                              )}
                            </div>
                          </Col>
                        );
                      })}
                    </Row>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <Input placeholder="Strategy Name" size="large" className="max-w-md" />
        <Button type="primary" onClick={() => navigate("/auto-strategy")}>
          Strategy List
        </Button>
      </div>

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
              {/* 🔎 Instrument Search */}
              <div>
                <Text className="text-xs text-gray-500">Index</Text>
                <Select
                  showSearch
                  placeholder="Search instrument..."
                  className="w-full mt-1"
                  filterOption={false}
                  onSearch={handleSearchInstrument}
                  loading={loading}
                  allowClear
                >
                  {options.map((item: any) => (
                    <Select.Option
                      key={item.instrument_id}
                      value={item.instrument_id}
                    >
                      {item.DisplayName}
                    </Select.Option>
                  ))}
                </Select>
              </div>

              <Divider className="my-2" />

              {/* Underlying */}
              <div>
                <Text className="text-xs text-gray-500 block mb-2">
                  Underlying From
                </Text>

                <Radio.Group
                  value={underlying}
                  onChange={(e) => {
                    const value = e.target.value;
                    setUnderlying(value);

                    // Reset toggle when switching to equity/future
                    if (value === "equity" || value === "future") {
                      setMultiLeg(false);
                    }
                  }}
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
                  <Switch
                    size="small"
                    checked={multiLeg}
                    onChange={(val) => setMultiLeg(val)}
                    disabled={underlying !== "index"} // disable for equity & future
                  />
                  <Text className="text-gray-600 text-sm">
                    {multiLeg ? "Multi Leg" : "Single Leg"}
                  </Text>
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

      {/* ========================================== */}
      {/* DYNAMIC STRATEGY CONFIGURATION SECTION   */}
      {/* ========================================== */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <Title level={5} className="!mb-0 text-gray-700">
            Strategy Conditions
          </Title>
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={addRuleBlock}
            disabled={!conditionMap} // Disable if API failed to load
          >
            Add Condition
          </Button>
        </div>

        {/* Render all dynamically added blocks */}
        <div className="space-y-4">
          {ruleBlocks.map((block) => renderRuleBlock(block))}

          {ruleBlocks.length === 0 && (
            <div className="text-center p-8 bg-white border border-dashed border-gray-300 rounded-lg text-gray-400">
              No conditions added yet. Click "Add Condition" to start building
              your strategy.
            </div>
          )}
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex justify-end gap-3 mt-6 border-t pt-4">
        <Button>Cancel</Button>
        <Button
          type="primary"
          onClick={() => {
            // Logs out all the data when you click save!
            console.log("Saving Blocks Data:", ruleBlocks);
          }}
        >
          Save Strategy
        </Button>
      </div>
    </div>
  );
}
