// import { useEffect, useMemo, useState } from "react";
// import {
//   Card,
//   Radio,
//   Switch,
//   TimePicker,
//   Typography,
//   Row,
//   Col,
//   Button,
//   Divider,
//   Select,
//   Input,
//   InputNumber,
//   message,
// } from "antd";
// import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
// import dayjs from "dayjs";
// import {
//   searchInstrumentApi,
//   fetchConditionMap,
//   insertUpdateStrategyApi,
// } from "../services/autoStrategyApi";
// import { useNavigate } from "react-router-dom";

// const { Text, Title } = Typography;
// const { Option } = Select;

// const getUnderlyingCode = (type: string) => {
//   switch (type) {
//     case "equity":
//       return "EQ";
//     case "future":
//       return "FUT";
//     case "index":
//       return "INDEX";
//     default:
//       return "EQ";
//   }
// };

// const formatSectionName = (section: string) => section?.toLowerCase() || "";
// const formatStrategyName = (strategy: string) => strategy?.toLowerCase() || "";

// export default function AddAutostrategy() {
//   const navigate = useNavigate();

//   const [options, setOptions] = useState<any[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [underlying, setUnderlying] = useState("equity");
//   const [multiLeg, setMultiLeg] = useState(false);
//   const [automated, setAutomated] = useState(false);
//   const [selectedInstrument, setSelectedInstrument] = useState<any>("");

//   const [conditionMap, setConditionMap] = useState<any>(null);
//   const [ruleBlocks, setRuleBlocks] = useState<any[]>([]);

//   const [strategyName, setStrategyName] = useState("");
//   const [note, setNote] = useState("");
//   const [strategyType, setStrategyType] = useState("intraday");

//   const [entryTime, setEntryTime] = useState<any>(dayjs("09:35", "HH:mm"));
//   const [exitTime, setExitTime] = useState<any>(dayjs("15:15", "HH:mm"));

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const res = await fetchConditionMap();
//         setConditionMap(res?.data?.result || null);
//       } catch (error) {
//         console.error("Error fetching condition map:", error);
//       }
//     };

//     fetchData();
//   }, []);

//   const handleSearchInstrument = async (value: string) => {
//     if (!value) return;
//     try {
//       setLoading(true);
//       const underlyingCode = getUnderlyingCode(underlying);
//       const res = await searchInstrumentApi(value, underlyingCode);
//       const list = res?.data?.result || [];
//       setOptions(list);
//     } catch (err) {
//       console.error("Instrument search error:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const selectedInstrumentMeta = useMemo(() => {
//     return (
//       options.find((item) => item.instrument_id === selectedInstrument) || null
//     );
//   }, [options, selectedInstrument]);

//   const addRuleBlock = () => {
//     setRuleBlocks([
//       ...ruleBlocks,
//       {
//         id: Date.now(),
//         section: null,
//         strategy: null,
//         version: null,
//         values: {},
//       },
//     ]);
//   };

//   const removeRuleBlock = (id: number) => {
//     setRuleBlocks(ruleBlocks.filter((b) => b.id !== id));
//   };

//   const updateRuleBlock = (id: number, field: string, value: any) => {
//     setRuleBlocks((prev) =>
//       prev.map((block) => {
//         if (block.id === id) {
//           const newBlock = { ...block, [field]: value };
//           if (field === "section") {
//             newBlock.strategy = null;
//             newBlock.version = null;
//             newBlock.values = {};
//           }
//           if (field === "strategy") {
//             newBlock.version = null;
//             newBlock.values = {};
//           }
//           if (field === "version") {
//             newBlock.values = {};
//           }
//           return newBlock;
//         }
//         return block;
//       }),
//     );
//   };

//   const updateRuleValue = (id: number, key: string, value: any) => {
//     setRuleBlocks((prev) =>
//       prev.map((block) =>
//         block.id === id
//           ? { ...block, values: { ...block.values, [key]: value } }
//           : block,
//       ),
//     );
//   };

//   // ----------------------------
//   // INDICATOR STRING BUILDERS
//   // ----------------------------

//   const buildIndicatorString = (
//     indicatorName: string,
//     block: any,
//     occurrenceIndex = 0,
//   ): string => {
//     const instrument = selectedInstrument || "";
//     const indicatorConfig = conditionMap?.indicator?.[indicatorName];

//     if (!indicatorConfig) return "";

//     const getValue = (fieldKey: string, fallback: any) => {
//       const blockValue =
//         block.values?.[`ind_${indicatorName}_${fieldKey}_${occurrenceIndex}`];
//       const oldKeyValue = block.values?.[`ind_${indicatorName}_${fieldKey}`];
//       return blockValue !== undefined
//         ? blockValue
//         : oldKeyValue !== undefined
//           ? oldKeyValue
//           : fallback;
//     };

//     if (indicatorName === "ema") {
//       const timeframe = getValue(
//         "timeframe",
//         indicatorConfig.timeframe?.default ?? 1,
//       );
//       const period = getValue("period", indicatorConfig.period?.default ?? 20);
//       const field = getValue(
//         "field",
//         indicatorConfig.field?.default ?? "close",
//       );
//       return `ema(instrument=${instrument},timeframe=${timeframe},period=${period},field=${field})`;
//     }

//     if (indicatorName === "pivot") {
//       const timeframe = getValue(
//         "timeframe",
//         indicatorConfig.timeframe?.default ?? 1,
//       );
//       const mode =
//         getValue("type", indicatorConfig.type?.default ?? "large") || "large";
//       return `pivot(instrument=${instrument},timeframe=${timeframe},mode=${mode})`;
//     }

//     if (indicatorName === "atr") {
//       const timeframe = getValue(
//         "timeframe",
//         indicatorConfig.timeframe?.default ?? 1,
//       );
//       const period = getValue("period", indicatorConfig.period?.default ?? 20);
//       return `atr(instrument=${instrument},timeframe=${timeframe},period=${period})`;
//     }

//     if (indicatorName === "atrv") {
//       const timeframe = getValue(
//         "timeframe",
//         indicatorConfig.timeframe?.default ?? 1,
//       );
//       const period = getValue("period", indicatorConfig.period?.default ?? 20);
//       return `atrv(instrument=${instrument},timeframe=${timeframe},period=${period})`;
//     }

//     if (indicatorName === "sma") {
//       const timeframe = getValue(
//         "timeframe",
//         indicatorConfig.timeframe?.default ?? 1,
//       );
//       const period = getValue("period", indicatorConfig.period?.default ?? 20);
//       const field = getValue(
//         "field",
//         indicatorConfig.field?.default ?? "close",
//       );
//       return `sma(instrument=${instrument},timeframe=${timeframe},period=${period},field=${field})`;
//     }

//     return "";
//   };

//   const buildNestedIndicatorString = (
//     rawIndicator: string,
//     block: any,
//     occurrenceIndex = 0,
//   ) => {
//     const instrument = selectedInstrument || "";

//     if (rawIndicator === "sma(atrv)") {
//       const smaCfg = conditionMap?.indicator?.sma;
//       const atrvCfg = conditionMap?.indicator?.atrv;

//       const smaPeriod =
//         block.values?.[`ind_sma_period_${occurrenceIndex}`] ??
//         smaCfg?.period?.default ??
//         20;
//       const smaTimeframe =
//         block.values?.[`ind_sma_timeframe_${occurrenceIndex}`] ??
//         smaCfg?.timeframe?.default ??
//         1;
//       const atrvPeriod =
//         block.values?.[`ind_atrv_period_${occurrenceIndex}`] ??
//         atrvCfg?.period?.default ??
//         20;
//       const atrvTimeframe =
//         block.values?.[`ind_atrv_timeframe_${occurrenceIndex}`] ??
//         atrvCfg?.timeframe?.default ??
//         1;

//       return `sma(instrument=${instrument},timeframe=${smaTimeframe},period=${smaPeriod},field=atrv(instrument=${instrument},timeframe=${atrvTimeframe},period=${atrvPeriod}))`;
//     }

//     if (rawIndicator === "sma(atr)") {
//       const smaCfg = conditionMap?.indicator?.sma;
//       const atrCfg = conditionMap?.indicator?.atr;

//       const smaPeriod =
//         block.values?.[`ind_sma_period_${occurrenceIndex}`] ??
//         smaCfg?.period?.default ??
//         20;
//       const smaTimeframe =
//         block.values?.[`ind_sma_timeframe_${occurrenceIndex}`] ??
//         smaCfg?.timeframe?.default ??
//         1;
//       const atrPeriod =
//         block.values?.[`ind_atr_period_${occurrenceIndex}`] ??
//         atrCfg?.period?.default ??
//         20;
//       const atrTimeframe =
//         block.values?.[`ind_atr_timeframe_${occurrenceIndex}`] ??
//         atrCfg?.timeframe?.default ??
//         1;

//       return `sma(instrument=${instrument},timeframe=${smaTimeframe},period=${smaPeriod},field=atr(instrument=${instrument},timeframe=${atrTimeframe},period=${atrPeriod}))`;
//     }

//     return buildIndicatorString(rawIndicator, block, occurrenceIndex);
//   };

//   const getBlockIndicators = (block: any) => {
//     if (!block.section || !block.strategy || !block.version) return [];

//     const activeConfig =
//       conditionMap?.[block.section]?.[block.strategy]?.[block.version];

//     if (!activeConfig?.indicator) return [];

//     return activeConfig.indicator
//       .map((rawInd: string, index: number) =>
//         buildNestedIndicatorString(rawInd, block, index),
//       )
//       .filter(Boolean);
//   };

//   const getAllIndicators = () => {
//     // Keep duplicates natively to exactly match payload expectation
//     return ruleBlocks.flatMap((block) => getBlockIndicators(block));
//   };

//   const buildSettingsPayload = (block: any) => {
//     const activeConfig =
//       conditionMap?.[block.section]?.[block.strategy]?.[block.version];

//     if (!activeConfig?.settings) return JSON.stringify({ "": null });

//     const settingKeys = Object.keys(activeConfig.settings);
//     // Render blank configs EXACTLY as requested {"":null}
//     if (settingKeys.length === 0) return JSON.stringify({ "": null });

//     const settingsPayload: Record<string, any> = {};
//     let hasValues = false;

//     settingKeys.forEach((settingKey) => {
//       let value = block.values?.[settingKey];

//       if (value === undefined || value === null || value === "") {
//         return;
//       }

//       const settingDef = activeConfig.settings[settingKey];
//       const isCustomArrayType =
//         settingDef &&
//         settingDef.type &&
//         conditionMap?.custom_type?.[settingDef.type] &&
//         Array.isArray(conditionMap.custom_type[settingDef.type]);

//       // JSON mapping rule: numeric outputs need to be cast to string representations ("1", "11", etc)
//       if (typeof value === "number") {
//         value = String(value);
//       }

//       // JSON mapping rule: Types defined natively as arrays in Condition Map must always output as arrays
//       // even if standard selection yields a single value (e.g., {"condition":["below"]})
//       if (isCustomArrayType && !Array.isArray(value)) {
//         value = [value];
//       }

//       settingsPayload[settingKey] = value;
//       hasValues = true;
//     });

//     if (!hasValues) {
//       return JSON.stringify({ "": null });
//     }

//     return JSON.stringify(settingsPayload);
//   };

//   const buildStrategyChecks = () => {
//     return ruleBlocks
//       .filter((block) => block.section && block.strategy && block.version)
//       .map((block) => {
//         const section = formatSectionName(block.section);
//         const strategy = formatStrategyName(block.strategy);
//         const version = block.version;

//         return {
//           id: 0,
//           name: `0.${section}.${strategy}.${version}.1`,
//           settings: buildSettingsPayload(block),
//           indicator: getBlockIndicators(block),
//           strategy_id: 0,
//         };
//       });
//   };

//   const buildFinalPayload = () => {
//     const instrumentId = selectedInstrument ? [String(selectedInstrument)] : [];

//     const payload = {
//       id: 0,
//       name: strategyName || "New Strategy",
//       instrument: instrumentId,
//       pivot_timeframes: ["1"],
//       strategy_timeframes: ["1"],
//       strike_buffer: 1000,
//       timeframe: 1,
//       manual_execution: [1, 4],
//       note: note || "",
//       indicators: getAllIndicators(),
//       multileg: multiLeg,
//       automated: automated,
//       underlying_from: underlying.toUpperCase(),
//       strategy_type: strategyType === "intraday" ? "Intraday" : "Positional",
//       strategy_checks: buildStrategyChecks(),
//     };

//     return payload;
//   };

//   const getExtractedIndicators = (indString: string) => {
//     return indString.match(/[a-zA-Z0-9_]+/g) || [];
//   };

//   const renderField = (
//     blockId: number,
//     key: string,
//     config: any,
//     currentValue: any,
//   ) => {
//     const { label, type, multiple } = config;
//     const customTypes = conditionMap?.custom_type || {};

//     if (type === "time") {
//       return (
//         <TimePicker
//           className="w-full"
//           format="HH:mm"
//           value={currentValue ? dayjs(currentValue, "HH:mm") : null}
//           onChange={(time, timeString) =>
//             updateRuleValue(blockId, key, timeString)
//           }
//         />
//       );
//     }

//     if (type === "bool") {
//       return (
//         <Select
//           className="w-full"
//           placeholder="Select"
//           value={currentValue}
//           onChange={(val) => updateRuleValue(blockId, key, val)}
//         >
//           <Option value={true}>Yes</Option>
//           <Option value={false}>No</Option>
//         </Select>
//       );
//     }

//     if (type === "int" || type === "float") {
//       return (
//         <InputNumber
//           className="w-full"
//           value={currentValue}
//           onChange={(val) => updateRuleValue(blockId, key, val)}
//         />
//       );
//     }

//     if (customTypes[type] && Array.isArray(customTypes[type])) {
//       return (
//         <Select
//           className="w-full"
//           mode={multiple ? "multiple" : undefined}
//           allowClear
//           value={currentValue}
//           onChange={(val) => updateRuleValue(blockId, key, val)}
//           placeholder={`Select ${label}`}
//         >
//           {customTypes[type].map((opt: string) => (
//             <Option key={opt} value={opt}>
//               {opt.toUpperCase()}
//             </Option>
//           ))}
//         </Select>
//       );
//     }

//     return (
//       <Input
//         value={currentValue}
//         onChange={(e) => updateRuleValue(blockId, key, e.target.value)}
//       />
//     );
//   };

//   const renderRuleBlock = (block: any) => {
//     const sections = conditionMap
//       ? Object.keys(conditionMap).filter(
//           (k) => k !== "indicator" && k !== "custom_type",
//         )
//       : [];

//     const strategies = block.section
//       ? Object.keys(conditionMap[block.section] || {})
//       : [];

//     const versions =
//       block.section && block.strategy
//         ? conditionMap[block.section][block.strategy]?.version || []
//         : [];

//     const activeConfig =
//       block.section && block.strategy && block.version
//         ? conditionMap[block.section][block.strategy][block.version]
//         : null;

//     const strategySettings: { key: string; config: any }[] = [];
//     const indicatorList: {
//       name: string;
//       raw: string;
//       fields: any[];
//       index: number;
//     }[] = [];

//     if (activeConfig) {
//       if (activeConfig.settings) {
//         Object.entries(activeConfig.settings).forEach(([k, v]) => {
//           strategySettings.push({ key: k, config: v });
//         });
//       }

//       if (activeConfig.indicator && conditionMap.indicator) {
//         activeConfig.indicator.forEach(
//           (indString: string, indIndex: number) => {
//             const parsedInds = getExtractedIndicators(indString);
//             parsedInds.forEach((indName) => {
//               const indConfig = conditionMap.indicator[indName];
//               if (indConfig) {
//                 const fields: any[] = [];
//                 Object.entries(indConfig).forEach(([ik, iv]: [string, any]) => {
//                   if (ik !== "instrument") {
//                     fields.push({
//                       key: `ind_${indName}_${ik}_${indIndex}`,
//                       label:
//                         ik.charAt(0).toUpperCase() +
//                         ik.slice(1).replace("_", " "),
//                       type: iv.type,
//                       edit: iv.edit,
//                       defaultValue: iv.default,
//                     });
//                   }
//                 });

//                 indicatorList.push({
//                   name: indName,
//                   raw: indString,
//                   fields,
//                   index: indIndex,
//                 });
//               }
//             });
//           },
//         );
//       }
//     }

//     return (
//       <div
//         key={block.id}
//         className="mb-4 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
//       >
//         <div className="p-4 flex flex-wrap gap-4 border-b border-gray-100 bg-gray-50/50">
//           <Select
//             className="w-32"
//             placeholder="Section"
//             value={block.section}
//             onChange={(val) => updateRuleBlock(block.id, "section", val)}
//           >
//             {sections.map((s) => (
//               <Option key={s} value={s}>
//                 {s}
//               </Option>
//             ))}
//           </Select>

//           <Select
//             className="w-40"
//             placeholder="Strategy"
//             value={block.strategy}
//             disabled={!block.section}
//             onChange={(val) => updateRuleBlock(block.id, "strategy", val)}
//           >
//             {strategies.map((s) => (
//               <Option key={s} value={s}>
//                 {s}
//               </Option>
//             ))}
//           </Select>

//           <Select
//             className="w-32"
//             placeholder="Version"
//             value={block.version}
//             disabled={!block.strategy}
//             onChange={(val) => updateRuleBlock(block.id, "version", val)}
//           >
//             {versions.map((v: number) => (
//               <Option key={v} value={v}>
//                 {v}
//               </Option>
//             ))}
//           </Select>
//         </div>

//         {block.version && activeConfig && (
//           <div>
//             <div className="px-4 py-3 bg-gray-50 flex justify-between items-center border-b border-gray-200">
//               <span className="text-gray-700 font-medium">
//                 {block.section} {block.strategy} 1.{block.version}
//               </span>
//               <Button
//                 type="text"
//                 danger
//                 icon={<DeleteOutlined className="text-lg" />}
//                 onClick={() => removeRuleBlock(block.id)}
//               />
//             </div>

//             <div className="p-4 space-y-4">
//               {strategySettings.length > 0 && (
//                 <div>
//                   <div className="text-sm text-gray-800 font-medium mb-3">
//                     Settings
//                   </div>
//                   <Row gutter={[16, 16]}>
//                     {strategySettings.map((field) => (
//                       <Col xs={24} sm={12} md={8} lg={4} key={field.key}>
//                         <div className="flex flex-col">
//                           <span className="text-xs text-gray-600 mb-1 truncate">
//                             {field.config.label}
//                           </span>
//                           {renderField(
//                             block.id,
//                             field.key,
//                             field.config,
//                             block.values[field.key],
//                           )}
//                         </div>
//                       </Col>
//                     ))}
//                   </Row>
//                 </div>
//               )}

//               {strategySettings.length > 0 && indicatorList.length > 0 && (
//                 <Divider className="my-2" />
//               )}

//               {indicatorList.length > 0 && (
//                 <div className="space-y-4">
//                   {indicatorList.map((ind, idx) => (
//                     <Row gutter={[16, 16]} key={idx} className="items-end">
//                       <Col xs={24} sm={12} md={8} lg={4}>
//                         <div className="flex flex-col">
//                           <span className="text-sm text-gray-800 font-medium mb-3">
//                             Indicator
//                           </span>
//                           <Input
//                             disabled
//                             value={ind.name}
//                             className="bg-gray-100 text-gray-700 cursor-not-allowed border-gray-200"
//                           />
//                         </div>
//                       </Col>

//                       {ind.fields.map((f) => {
//                         const val =
//                           block.values[f.key] !== undefined
//                             ? block.values[f.key]
//                             : f.defaultValue;

//                         return (
//                           <Col xs={24} sm={12} md={8} lg={4} key={f.key}>
//                             <div className="flex flex-col">
//                               <span className="text-xs text-gray-600 mb-1">
//                                 {f.label}
//                               </span>
//                               {f.edit ? (
//                                 renderField(
//                                   block.id,
//                                   f.key,
//                                   { label: f.label, type: f.type },
//                                   val,
//                                 )
//                               ) : (
//                                 <Input
//                                   disabled
//                                   value={val}
//                                   className="bg-gray-100 text-gray-700 cursor-not-allowed border-gray-200"
//                                 />
//                               )}
//                             </div>
//                           </Col>
//                         );
//                       })}
//                     </Row>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>
//         )}
//       </div>
//     );
//   };

//   return (
//     <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
//       <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
//         <Input
//           placeholder="Strategy Name"
//           size="large"
//           className="max-w-md"
//           value={strategyName}
//           onChange={(e) => setStrategyName(e.target.value)}
//         />
//         <Button type="primary" onClick={() => navigate("/auto-strategy")}>
//           Strategy List
//         </Button>
//       </div>

//       <Row gutter={[16, 16]}>
//         <Col xs={24} xl={12}>
//           <Card
//             size="small"
//             title={
//               <span className="font-semibold text-gray-700">
//                 Instrument Settings
//               </span>
//             }
//             className="shadow-sm"
//           >
//             <div className="space-y-4">
//               <div>
//                 <Text className="text-xs text-gray-500">Index</Text>
//                 <Select
//                   showSearch
//                   placeholder="Search instrument..."
//                   className="w-full mt-1"
//                   filterOption={false}
//                   onSearch={handleSearchInstrument}
//                   loading={loading}
//                   allowClear
//                   value={selectedInstrument}
//                   onChange={(value) => setSelectedInstrument(value)}
//                 >
//                   {options.map((item: any) => (
//                     <Select.Option
//                       key={item.instrument_id}
//                       value={item.instrument_id}
//                     >
//                       {item.DisplayName}
//                     </Select.Option>
//                   ))}
//                 </Select>
//               </div>

//               <Divider className="my-2" />

//               <div>
//                 <Text className="text-xs text-gray-500 block mb-2">
//                   Underlying From
//                 </Text>

//                 <Radio.Group
//                   value={underlying}
//                   onChange={(e) => {
//                     const value = e.target.value;
//                     setUnderlying(value);
//                     setSelectedInstrument(null);
//                     setOptions([]);

//                     if (value === "equity" || value === "future") {
//                       setMultiLeg(false);
//                     }
//                   }}
//                   className="flex flex-wrap gap-4"
//                 >
//                   <Radio value="equity">Equity</Radio>
//                   <Radio value="future">Future</Radio>
//                   <Radio value="index">Index</Radio>
//                 </Radio.Group>
//               </div>

//               <Divider className="my-2" />

//               <div className="flex flex-wrap gap-6">
//                 <div className="flex items-center gap-2">
//                   <Switch
//                     size="small"
//                     checked={multiLeg}
//                     onChange={(val) => setMultiLeg(val)}
//                     disabled={underlying !== "index"}
//                   />
//                   <Text className="text-gray-600 text-sm">
//                     {multiLeg ? "Multi Leg" : "Single Leg"}
//                   </Text>
//                 </div>

//                 <div className="flex items-center gap-2">
//                   <Switch
//                     size="small"
//                     checked={automated}
//                     onChange={(val) => setAutomated(val)}
//                   />
//                   <Text className="text-gray-600 text-sm">Automated</Text>
//                 </div>
//               </div>
//             </div>
//           </Card>
//         </Col>

//         <Col xs={24} xl={12}>
//           <Card
//             size="small"
//             title={
//               <span className="font-semibold text-gray-700">
//                 General Settings
//               </span>
//             }
//             className="shadow-sm"
//           >
//             <div className="space-y-4">
//               <div>
//                 <Text className="text-xs text-gray-500 block mb-2">
//                   Strategy Type
//                 </Text>

//                 <Radio.Group
//                   value={strategyType}
//                   onChange={(e) => setStrategyType(e.target.value)}
//                   buttonStyle="solid"
//                 >
//                   <Radio.Button value="intraday">Intraday</Radio.Button>
//                   <Radio.Button value="positional">Positional</Radio.Button>
//                 </Radio.Group>
//               </div>

//               <Divider className="my-2" />

//               <Row gutter={12}>
//                 <Col xs={24} sm={12}>
//                   <Text className="text-xs text-gray-500 block mb-1">
//                     Entry Time
//                   </Text>
//                   <TimePicker
//                     value={entryTime}
//                     onChange={setEntryTime}
//                     format="HH:mm"
//                     className="w-full"
//                   />
//                 </Col>

//                 <Col xs={24} sm={12}>
//                   <Text className="text-xs text-gray-500 block mb-1">
//                     Exit Time
//                   </Text>
//                   <TimePicker
//                     value={exitTime}
//                     onChange={setExitTime}
//                     format="HH:mm"
//                     className="w-full"
//                   />
//                 </Col>
//               </Row>
//             </div>
//           </Card>
//         </Col>

//         <Col span={24}>
//           <Card
//             size="small"
//             title={<span className="font-semibold text-gray-700">Note</span>}
//             className="shadow-sm"
//           >
//             <Input.TextArea
//               rows={4}
//               placeholder="Enter note here..."
//               value={note}
//               onChange={(e) => setNote(e.target.value)}
//             />
//           </Card>
//         </Col>
//       </Row>

//       <div className="mt-6">
//         <div className="flex items-center justify-between mb-4">
//           <Title level={5} className="!mb-0 text-gray-700">
//             Strategy Conditions
//           </Title>
//           <Button
//             type="dashed"
//             icon={<PlusOutlined />}
//             onClick={addRuleBlock}
//             disabled={!conditionMap}
//           >
//             Add Condition
//           </Button>
//         </div>

//         <div className="space-y-4">
//           {ruleBlocks.map((block) => renderRuleBlock(block))}

//           {ruleBlocks.length === 0 && (
//             <div className="text-center p-8 bg-white border border-dashed border-gray-300 rounded-lg text-gray-400">
//               No conditions added yet. Click "Add Condition" to start building
//               your strategy.
//             </div>
//           )}
//         </div>
//       </div>

//       <div className="flex justify-end gap-3 mt-6 border-t pt-4">
//         <Button>Cancel</Button>
//         <Button
//           type="primary"
//           onClick={() => {
//             if (!selectedInstrument) {
//               message.error("Please select an instrument first");
//               return;
//             }

//             const finalPayload = buildFinalPayload();

//             console.log("========== FINAL API PAYLOAD ==========");
//             console.log(finalPayload);
//             console.log(
//               "========== FINAL API PAYLOAD JSON ==========",
//               JSON.stringify(finalPayload, null, 2),
//             );
//           }}
//         >
//           Save Strategy
//         </Button>
//       </div>
//     </div>
//   );
// }

import { useEffect, useMemo, useState } from "react";
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
  message,
} from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import {
  searchInstrumentApi,
  fetchConditionMap,
  insertUpdateStrategyApi,
} from "../services/autoStrategyApi";
import { useNavigate } from "react-router-dom";

const { Text, Title } = Typography;
const { Option } = Select;

const getUnderlyingCode = (type: string) => {
  switch (type) {
    case "equity":
      return "EQ";
    case "future":
      return "FUT";
    case "index":
      return "INDEX";
    default:
      return "EQ";
  }
};

const formatSectionName = (section: string) => section?.toLowerCase() || "";
const formatStrategyName = (strategy: string) => strategy?.toLowerCase() || "";

export default function AddAutostrategy() {
  const navigate = useNavigate();

  const [options, setOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false); // Added state for save button loading

  const [underlying, setUnderlying] = useState("equity");
  const [multiLeg, setMultiLeg] = useState(false);
  const [automated, setAutomated] = useState(false);
  const [selectedInstrument, setSelectedInstrument] = useState<any>("");

  const [conditionMap, setConditionMap] = useState<any>(null);
  const [ruleBlocks, setRuleBlocks] = useState<any[]>([]);

  const [strategyName, setStrategyName] = useState("");
  const [note, setNote] = useState("");
  const [strategyType, setStrategyType] = useState("intraday");

  const [entryTime, setEntryTime] = useState<any>(dayjs("09:35", "HH:mm"));
  const [exitTime, setExitTime] = useState<any>(dayjs("15:15", "HH:mm"));

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

  const handleSearchInstrument = async (value: string) => {
    if (!value) return;
    try {
      setLoading(true);
      const underlyingCode = getUnderlyingCode(underlying);
      const res = await searchInstrumentApi(value, underlyingCode);
      const list = res?.data?.result || [];
      setOptions(list);
    } catch (err) {
      console.error("Instrument search error:", err);
    } finally {
      setLoading(false);
    }
  };

  const selectedInstrumentMeta = useMemo(() => {
    return (
      options.find((item) => item.instrument_id === selectedInstrument) || null
    );
  }, [options, selectedInstrument]);

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

  // ----------------------------
  // INDICATOR STRING BUILDERS
  // ----------------------------

  const buildIndicatorString = (
    indicatorName: string,
    block: any,
    occurrenceIndex = 0,
  ): string => {
    const instrument = selectedInstrument || "";
    const indicatorConfig = conditionMap?.indicator?.[indicatorName];

    if (!indicatorConfig) return "";

    const getValue = (fieldKey: string, fallback: any) => {
      const blockValue =
        block.values?.[`ind_${indicatorName}_${fieldKey}_${occurrenceIndex}`];
      const oldKeyValue = block.values?.[`ind_${indicatorName}_${fieldKey}`];
      return blockValue !== undefined
        ? blockValue
        : oldKeyValue !== undefined
          ? oldKeyValue
          : fallback;
    };

    if (indicatorName === "ema") {
      const timeframe = getValue(
        "timeframe",
        indicatorConfig.timeframe?.default ?? 1,
      );
      const period = getValue("period", indicatorConfig.period?.default ?? 20);
      const field = getValue(
        "field",
        indicatorConfig.field?.default ?? "close",
      );
      return `ema(instrument=${instrument},timeframe=${timeframe},period=${period},field=${field})`;
    }

    if (indicatorName === "pivot") {
      const timeframe = getValue(
        "timeframe",
        indicatorConfig.timeframe?.default ?? 1,
      );
      const mode =
        getValue("type", indicatorConfig.type?.default ?? "large") || "large";
      return `pivot(instrument=${instrument},timeframe=${timeframe},mode=${mode})`;
    }

    if (indicatorName === "atr") {
      const timeframe = getValue(
        "timeframe",
        indicatorConfig.timeframe?.default ?? 1,
      );
      const period = getValue("period", indicatorConfig.period?.default ?? 20);
      return `atr(instrument=${instrument},timeframe=${timeframe},period=${period})`;
    }

    if (indicatorName === "atrv") {
      const timeframe = getValue(
        "timeframe",
        indicatorConfig.timeframe?.default ?? 1,
      );
      const period = getValue("period", indicatorConfig.period?.default ?? 20);
      return `atrv(instrument=${instrument},timeframe=${timeframe},period=${period})`;
    }

    if (indicatorName === "sma") {
      const timeframe = getValue(
        "timeframe",
        indicatorConfig.timeframe?.default ?? 1,
      );
      const period = getValue("period", indicatorConfig.period?.default ?? 20);
      const field = getValue(
        "field",
        indicatorConfig.field?.default ?? "close",
      );
      return `sma(instrument=${instrument},timeframe=${timeframe},period=${period},field=${field})`;
    }

    return "";
  };

  const buildNestedIndicatorString = (
    rawIndicator: string,
    block: any,
    occurrenceIndex = 0,
  ) => {
    const instrument = selectedInstrument || "";

    if (rawIndicator === "sma(atrv)") {
      const smaCfg = conditionMap?.indicator?.sma;
      const atrvCfg = conditionMap?.indicator?.atrv;

      const smaPeriod =
        block.values?.[`ind_sma_period_${occurrenceIndex}`] ??
        smaCfg?.period?.default ??
        20;
      const smaTimeframe =
        block.values?.[`ind_sma_timeframe_${occurrenceIndex}`] ??
        smaCfg?.timeframe?.default ??
        1;
      const atrvPeriod =
        block.values?.[`ind_atrv_period_${occurrenceIndex}`] ??
        atrvCfg?.period?.default ??
        20;
      const atrvTimeframe =
        block.values?.[`ind_atrv_timeframe_${occurrenceIndex}`] ??
        atrvCfg?.timeframe?.default ??
        1;

      return `sma(instrument=${instrument},timeframe=${smaTimeframe},period=${smaPeriod},field=atrv(instrument=${instrument},timeframe=${atrvTimeframe},period=${atrvPeriod}))`;
    }

    if (rawIndicator === "sma(atr)") {
      const smaCfg = conditionMap?.indicator?.sma;
      const atrCfg = conditionMap?.indicator?.atr;

      const smaPeriod =
        block.values?.[`ind_sma_period_${occurrenceIndex}`] ??
        smaCfg?.period?.default ??
        20;
      const smaTimeframe =
        block.values?.[`ind_sma_timeframe_${occurrenceIndex}`] ??
        smaCfg?.timeframe?.default ??
        1;
      const atrPeriod =
        block.values?.[`ind_atr_period_${occurrenceIndex}`] ??
        atrCfg?.period?.default ??
        20;
      const atrTimeframe =
        block.values?.[`ind_atr_timeframe_${occurrenceIndex}`] ??
        atrCfg?.timeframe?.default ??
        1;

      return `sma(instrument=${instrument},timeframe=${smaTimeframe},period=${smaPeriod},field=atr(instrument=${instrument},timeframe=${atrTimeframe},period=${atrPeriod}))`;
    }

    return buildIndicatorString(rawIndicator, block, occurrenceIndex);
  };

  const getBlockIndicators = (block: any) => {
    if (!block.section || !block.strategy || !block.version) return [];

    const activeConfig =
      conditionMap?.[block.section]?.[block.strategy]?.[block.version];

    if (!activeConfig?.indicator) return [];

    return activeConfig.indicator
      .map((rawInd: string, index: number) =>
        buildNestedIndicatorString(rawInd, block, index),
      )
      .filter(Boolean);
  };

  const getAllIndicators = () => {
    // Keep duplicates natively to exactly match payload expectation
    return ruleBlocks.flatMap((block) => getBlockIndicators(block));
  };

  const buildSettingsPayload = (block: any) => {
    const activeConfig =
      conditionMap?.[block.section]?.[block.strategy]?.[block.version];

    if (!activeConfig?.settings) return JSON.stringify({ "": null });

    const settingKeys = Object.keys(activeConfig.settings);
    // Render blank configs EXACTLY as requested {"":null}
    if (settingKeys.length === 0) return JSON.stringify({ "": null });

    const settingsPayload: Record<string, any> = {};
    let hasValues = false;

    settingKeys.forEach((settingKey) => {
      let value = block.values?.[settingKey];

      if (value === undefined || value === null || value === "") {
        return;
      }

      const settingDef = activeConfig.settings[settingKey];
      const isCustomArrayType =
        settingDef &&
        settingDef.type &&
        conditionMap?.custom_type?.[settingDef.type] &&
        Array.isArray(conditionMap.custom_type[settingDef.type]);

      // JSON mapping rule: numeric outputs need to be cast to string representations ("1", "11", etc)
      if (typeof value === "number") {
        value = String(value);
      }

      // JSON mapping rule: Types defined natively as arrays in Condition Map must always output as arrays
      // even if standard selection yields a single value (e.g., {"condition":["below"]})
      if (isCustomArrayType && !Array.isArray(value)) {
        value = [value];
      }

      settingsPayload[settingKey] = value;
      hasValues = true;
    });

    if (!hasValues) {
      return JSON.stringify({ "": null });
    }

    return JSON.stringify(settingsPayload);
  };

  const buildStrategyChecks = () => {
    return ruleBlocks
      .filter((block) => block.section && block.strategy && block.version)
      .map((block) => {
        const section = formatSectionName(block.section);
        const strategy = formatStrategyName(block.strategy);
        const version = block.version;

        return {
          id: 0,
          name: `0.${section}.${strategy}.${version}.1`,
          settings: buildSettingsPayload(block),
          indicator: getBlockIndicators(block),
          strategy_id: 0,
        };
      });
  };

  const buildFinalPayload = () => {
    const instrumentId = selectedInstrument ? [String(selectedInstrument)] : [];

    const payload = {
      id: 0,
      name: strategyName || "New Strategy",
      instrument: instrumentId,
      pivot_timeframes: ["1"],
      strategy_timeframes: ["1"],
      strike_buffer: 1000,
      timeframe: 1,
      manual_execution: [1, 4],
      note: note || "",
      indicators: getAllIndicators(),
      multileg: multiLeg,
      automated: automated,
      underlying_from: underlying.toUpperCase(),
      strategy_type: strategyType === "intraday" ? "Intraday" : "Positional",
      strategy_checks: buildStrategyChecks(),
    };

    return payload;
  };

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

    if (type === "time") {
      return (
        <TimePicker
          className="w-full"
          format="HH:mm"
          value={currentValue ? dayjs(currentValue, "HH:mm") : null}
          onChange={(time, timeString) =>
            updateRuleValue(blockId, key, timeString)
          }
        />
      );
    }

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

    if (type === "int" || type === "float") {
      return (
        <InputNumber
          className="w-full"
          value={currentValue}
          onChange={(val) => updateRuleValue(blockId, key, val)}
        />
      );
    }

    if (customTypes[type] && Array.isArray(customTypes[type])) {
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

    return (
      <Input
        value={currentValue}
        onChange={(e) => updateRuleValue(blockId, key, e.target.value)}
      />
    );
  };

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

    const strategySettings: { key: string; config: any }[] = [];
    const indicatorList: {
      name: string;
      raw: string;
      fields: any[];
      index: number;
    }[] = [];

    if (activeConfig) {
      if (activeConfig.settings) {
        Object.entries(activeConfig.settings).forEach(([k, v]) => {
          strategySettings.push({ key: k, config: v });
        });
      }

      if (activeConfig.indicator && conditionMap.indicator) {
        activeConfig.indicator.forEach(
          (indString: string, indIndex: number) => {
            const parsedInds = getExtractedIndicators(indString);
            parsedInds.forEach((indName) => {
              const indConfig = conditionMap.indicator[indName];
              if (indConfig) {
                const fields: any[] = [];
                Object.entries(indConfig).forEach(([ik, iv]: [string, any]) => {
                  if (ik !== "instrument") {
                    fields.push({
                      key: `ind_${indName}_${ik}_${indIndex}`,
                      label:
                        ik.charAt(0).toUpperCase() +
                        ik.slice(1).replace("_", " "),
                      type: iv.type,
                      edit: iv.edit,
                      defaultValue: iv.default,
                    });
                  }
                });

                indicatorList.push({
                  name: indName,
                  raw: indString,
                  fields,
                  index: indIndex,
                });
              }
            });
          },
        );
      }
    }

    return (
      <div
        key={block.id}
        className="mb-4 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
      >
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

        {block.version && activeConfig && (
          <div>
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

            <div className="p-4 space-y-4">
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

              {strategySettings.length > 0 && indicatorList.length > 0 && (
                <Divider className="my-2" />
              )}

              {indicatorList.length > 0 && (
                <div className="space-y-4">
                  {indicatorList.map((ind, idx) => (
                    <Row gutter={[16, 16]} key={idx} className="items-end">
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
                                renderField(
                                  block.id,
                                  f.key,
                                  { label: f.label, type: f.type },
                                  val,
                                )
                              ) : (
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <Input
          placeholder="Strategy Name"
          size="large"
          className="max-w-md"
          value={strategyName}
          onChange={(e) => setStrategyName(e.target.value)}
        />
        <Button type="primary" onClick={() => navigate("/auto-strategy")}>
          Strategy List
        </Button>
      </div>

      <Row gutter={[16, 16]}>
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
                  value={selectedInstrument}
                  onChange={(value) => setSelectedInstrument(value)}
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

              <div>
                <Text className="text-xs text-gray-500 block mb-2">
                  Underlying From
                </Text>

                <Radio.Group
                  value={underlying}
                  onChange={(e) => {
                    const value = e.target.value;
                    setUnderlying(value);
                    setSelectedInstrument(null);
                    setOptions([]);

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

              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <Switch
                    size="small"
                    checked={multiLeg}
                    onChange={(val) => setMultiLeg(val)}
                    disabled={underlying !== "index"}
                  />
                  <Text className="text-gray-600 text-sm">
                    {multiLeg ? "Multi Leg" : "Single Leg"}
                  </Text>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    size="small"
                    checked={automated}
                    onChange={(val) => setAutomated(val)}
                  />
                  <Text className="text-gray-600 text-sm">Automated</Text>
                </div>
              </div>
            </div>
          </Card>
        </Col>

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

                <Radio.Group
                  value={strategyType}
                  onChange={(e) => setStrategyType(e.target.value)}
                  buttonStyle="solid"
                >
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
                    value={entryTime}
                    onChange={setEntryTime}
                    format="HH:mm"
                    className="w-full"
                  />
                </Col>

                <Col xs={24} sm={12}>
                  <Text className="text-xs text-gray-500 block mb-1">
                    Exit Time
                  </Text>
                  <TimePicker
                    value={exitTime}
                    onChange={setExitTime}
                    format="HH:mm"
                    className="w-full"
                  />
                </Col>
              </Row>
            </div>
          </Card>
        </Col>

        <Col span={24}>
          <Card
            size="small"
            title={<span className="font-semibold text-gray-700">Note</span>}
            className="shadow-sm"
          >
            <Input.TextArea
              rows={4}
              placeholder="Enter note here..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </Card>
        </Col>
      </Row>

      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <Title level={5} className="!mb-0 text-gray-700">
            Strategy Conditions
          </Title>
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={addRuleBlock}
            disabled={!conditionMap}
          >
            Add Condition
          </Button>
        </div>

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

      <div className="flex justify-end gap-3 mt-6 border-t pt-4">
        <Button onClick={() => navigate("/auto-strategy")}>Cancel</Button>
        <Button
          type="primary"
          loading={saving} // Added loading state here
          onClick={async () => {
            if (!selectedInstrument) {
              message.error("Please select an instrument first");
              return;
            }

            const finalPayload = buildFinalPayload();

            console.log("========== FINAL API PAYLOAD ==========");
            console.log(finalPayload);

            // Integrating the API call
            try {
              setSaving(true);
              const response = await insertUpdateStrategyApi(finalPayload);

              if (response) {
                message.success("Strategy saved successfully!");
                navigate("/auto-strategy"); // Redirects the user back to the list
              }
            } catch (error) {
              console.error("Error saving strategy:", error);
              message.error("Failed to save strategy. Please try again.");
            } finally {
              setSaving(false);
            }
          }}
        >
          Save Strategy
        </Button>
      </div>
    </div>
  );
}