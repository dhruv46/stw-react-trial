import React, { useState, useEffect } from "react";
import {
  Table,
  Card,
  Switch,
  Space,
  Typography,
  message,
  Spin,
  Empty,
  Input,
  Select,
  Button,
  TimePicker,
  Row,
  Col,
  InputNumber,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  PlusOutlined,
  CloseOutlined,
  CopyOutlined,
  CheckCircleFilled,
  InfoCircleFilled,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { FiEdit2 } from "react-icons/fi";
import { MdDelete } from "react-icons/md";
import { IoPlaySharp } from "react-icons/io5";
import dayjs from "dayjs";
import {
  getManualExecutions,
  searchInstrumentForIndexEq,
  getSpotFutureUnderlying,
  getInstrumentExpiryDate,
  getInstrumentStrikePriceList,
  getInstrumentSubscription,
  getFutureInstrument,
} from "../../services/manualExecutionApi";
import { getEnabledClientList } from "../../services/SettingsService/userSettingsApi";
import { FetchStrategyList } from "../../services/SettingsService/userSettingsApi";
import { useSocket } from "../../hook/useSocket";

const { Title, Text } = Typography;
const { Option } = Select;

interface ManualExecutionRow {
  key: number;
  id: number;
  strategyName: string;
  strategyTag: string;
  instrument: string;
  underlying: string;
  entryLevel: string | number;
  isEntryLevelHighlighted?: boolean;
  stoplossLevel: string | number;
  status: boolean;
  actionType: "pending" | "active";
  isRowHighlighted?: boolean;
}

interface ExecutionLeg {
  id: string;
  strategyName: string;
  instrumentId: number;
  instrumentName: string;
  underlying: string;

  expiry?: string;
  strikePrice?: number | string;

  entryLevel: number;
  stoplossLevel?: number;

  side: "BUY" | "SELL";
  optionType: "CE" | "PE" | "FUT" | "EQ";

  lots: number;
  qty: number;
}
const ManualExecution: React.FC = () => {
  const [data, setData] = useState<ManualExecutionRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [tagOptions, setTagOptions] = useState<
    { label: string; value: number }[]
  >([]);
  const [stockOptions, setStockOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [underlyingOptions, setUnderlyingOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [selectedInstrument, setSelectedInstrument] = useState<number | null>(
    null,
  );
  const [expiryOptions, setExpiryOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [selectedUnderlying, setSelectedUnderlying] = useState<string | null>(
    null,
  );
  const [selectedExpiry, setSelectedExpiry] = useState<string | null>(null);
  const [tradeType, setTradeType] = useState<"intraday" | "positional">(
    "intraday",
  );
  const [instrumenttik, setInstrumenttik] = useState<any>({});
  const [strategyName, setStrategyName] = useState<string>("");
  const [selectedTag, setSelectedTag] = useState<number | null>(null);
  const [entryLevel, setEntryLevel] = useState<number | null>(null);
  const [stoplossLevel, setStoplossLevel] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<any>(dayjs("09:15 AM", "hh:mm A"));
  const [endTime, setEndTime] = useState<any>(dayjs("03:15 PM", "hh:mm A"));
  const [legs, setLegs] = useState<ExecutionLeg[]>([]);
  const [instrumentMeta, setInstrumentMeta] = useState<any>(null);

  const [spotExpiry, setSpotExpiry] = useState<string[]>([]);
  const [futureExpiry, setFutureExpiry] = useState<string[]>([]);

  const [strikePrices, setStrikePrices] = useState<number[]>([]);
  const [baseInstrumentId, setBaseInstrumentId] = useState<number | null>(null);
  const [tradeInstrumentId, setTradeInstrumentId] = useState<number | null>(
    null,
  );

  const fetchExecutions = async () => {
    try {
      setLoading(true);
      const response = await getManualExecutions();
      const mappedData = response.data.result.map((item: any) => ({
        key: item.id,
        id: item.id,
        strategyName: item.strategy_name,
        strategyTag: item.strategy_tag,
        instrument: item.instrument_name,
        underlying: item.underlying_instrument,
        entryLevel: item.entry_level.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
        }),
        stoplossLevel: item.stoploss_level.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
        }),
        status: item.enabled,
        actionType: item.is_position ? "pending" : "active",
        isRowHighlighted: item.is_position,
        isEntryLevelHighlighted: item.is_position,
      }));
      setData(mappedData);
    } catch (error) {
      console.error("Failed to fetch executions:", error);
      message.error("Failed to load manual execution data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedUnderlying === "spot") {
      setSelectedExpiry(null);
      setTradeInstrumentId(baseInstrumentId);
    }
  }, [selectedUnderlying]);
  useEffect(() => {
    fetchExecutions();
  }, []);

  const fetchTagOptions = async () => {
    try {
      const clientRes = await getEnabledClientList();
      const strategyRes = await FetchStrategyList();

      const clientStrategies: number[] =
        clientRes.data.result?.flatMap((c: any) => c.strategy) || [];

      const strategyList = strategyRes.data.result || [];

      const filteredStrategies = strategyList.filter((s: any) =>
        clientStrategies.includes(s.id),
      );

      const options = filteredStrategies.map((s: any) => ({
        label: s.name,
        value: s.id,
      }));

      setTagOptions(options);
    } catch (error) {
      console.error("Failed to load strategy tags", error);
    }
  };

  const handleStockSearch = async (value: string) => {
    if (!value) {
      setStockOptions([]);
      return;
    }

    try {
      const res = await searchInstrumentForIndexEq(value);

      const options =
        res.data.result?.map((item: any) => ({
          label: `${item.DisplayName}`,
          value: item.instrument_id, // ✅ important
        })) || [];

      setStockOptions(options);
    } catch (error) {
      console.error("Stock search failed", error);
    }
  };

  // const handleInstrumentSelect = async (instrumentId: number) => {
  //   try {
  //     setBaseInstrumentId(instrumentId);
  //     setTradeInstrumentId(instrumentId); // default = spot instrument
  //     setSelectedInstrument(instrumentId);

  //     const res = await getSpotFutureUnderlying(instrumentId.toString());
  //     const result = res.data.result;

  //     setInstrumentMeta(result);

  //     setSpotExpiry(result.spot_expiry || []);
  //     setFutureExpiry(result.future_expiry || []);

  //     const types = result.underlying_instrument_type || [];

  //     // ✅ FUTCOM special handling
  //     let options;

  //     if (result.series === "FUTCOM") {
  //       options = [
  //         {
  //           label: "FUTURE",
  //           value: "future",
  //         },
  //       ];
  //     } else {
  //       options = types.map((type: string) => ({
  //         label: type.toUpperCase(),
  //         value: type,
  //       }));
  //     }

  //     setUnderlyingOptions(options);

  //     setInstrumenttik((prev: any) => ({
  //       ...prev,
  //       [instrumentId]: {
  //         Price: result.ltp,
  //         ChangeValue: result.change_value,
  //         PercentChange: result.percent_change,
  //       },
  //     }));
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  const handleInstrumentSelect = async (instrumentId: number) => {
    try {
      // ✅ reset dependent fields when instrument changes
      setSelectedUnderlying(null);
      setSelectedExpiry(null);
      setExpiryOptions([]);
      setStrikePrices([]);
      setLegs([]);

      setBaseInstrumentId(instrumentId);
      setTradeInstrumentId(instrumentId);
      setSelectedInstrument(instrumentId);

      const res = await getSpotFutureUnderlying(instrumentId.toString());
      const result = res.data.result;

      setInstrumentMeta(result);

      setSpotExpiry(result.spot_expiry || []);
      setFutureExpiry(result.future_expiry || []);

      const types = result.underlying_instrument_type || [];

      // FUTCOM → only FUTURE allowed
      let options;

      if (result.series === "FUTCOM") {
        options = [{ label: "FUTURE", value: "future" }];
      } else {
        options = types.map((type: string) => ({
          label: type.toUpperCase(),
          value: type,
        }));
      }

      setUnderlyingOptions(options);

      setInstrumenttik((prev: any) => ({
        ...prev,
        [instrumentId]: {
          Price: result.ltp,
          ChangeValue: result.change_value,
          PercentChange: result.percent_change,
        },
      }));
    } catch (error) {
      console.error(error);
    }
  };
  const fetchFutureInstrument = async (instrument: number, expiry: string) => {
    try {
      const res = await getFutureInstrument(instrument, expiry);

      const futureInstrumentId = res.data?.result?.instrument_id;

      if (futureInstrumentId) {
        // subscribe to future
        setTradeInstrumentId(futureInstrumentId);
        setSelectedInstrument(futureInstrumentId);
      } else {
        // fallback to base instrument
        setTradeInstrumentId(baseInstrumentId);
        setSelectedInstrument(baseInstrumentId);
      }
    } catch (error) {
      console.error("Future Instrument API error", error);

      setTradeInstrumentId(baseInstrumentId);
      setSelectedInstrument(baseInstrumentId);
    }
  };

  useSocket(
    selectedInstrument ? `tick_message_${selectedInstrument}` : "",
    (inner) => {
      if (!selectedInstrument) return;

      setInstrumenttik((prev: any) => ({
        ...prev,
        [selectedInstrument]: {
          Price: inner.Price,
          ChangeValue: inner.ChangeValue,
          PercentChange: inner.PercentChange,
        },
      }));
    },
  );
  const getCurrentPrice = () => {
    if (selectedInstrument && instrumenttik[selectedInstrument]?.Price) {
      return instrumenttik[selectedInstrument].Price;
    }

    return instrumentMeta?.ltp || 0;
  };

  // const handleUnderlyingChange = async (value: string) => {
  //   setSelectedUnderlying(value);

  //   if (!baseInstrumentId) return;

  //   // SPOT
  //   if (value === "spot") {
  //     setTradeInstrumentId(baseInstrumentId);
  //     setSelectedInstrument(baseInstrumentId);
  //   }

  //   // FUTURE
  //   if (value === "future") {
  //     try {
  //       const res = await getInstrumentExpiryDate(
  //         baseInstrumentId.toString(),
  //         value.toUpperCase(),
  //       );

  //       const dates = res.data.result?.expiry_date || [];

  //       const options = dates.map((date: string) => ({
  //         label: date,
  //         value: date,
  //       }));

  //       setExpiryOptions(options);

  //       if (dates.length > 0) {
  //         const firstExpiry = dates[0];
  //         setSelectedExpiry(firstExpiry);

  //         await fetchFutureInstrument(baseInstrumentId, firstExpiry);
  //       }
  //     } catch (error) {
  //       console.error("Failed to fetch expiry dates", error);
  //     }
  //   }
  // };

  const handleUnderlyingChange = async (value: string) => {
    setSelectedUnderlying(value);

    if (!baseInstrumentId || !instrumentMeta) return;

    // SPOT
    if (value === "spot") {
      setTradeInstrumentId(baseInstrumentId);
      setSelectedInstrument(baseInstrumentId);
      setSelectedExpiry(null);
      setExpiryOptions([]);
      return;
    }

    // FUTURE
    if (value === "future") {
      try {
        // FUTCOM handling
        if (instrumentMeta.series === "FUTCOM") {
          const baseExpiry = instrumentMeta.base_expiry;

          const option = {
            label: baseExpiry,
            value: baseExpiry,
          };

          setExpiryOptions([option]);
          setSelectedExpiry(baseExpiry);

          await fetchFutureInstrument(baseInstrumentId, baseExpiry);
          return;
        }

        // NORMAL FUTURE FLOW
        const res = await getInstrumentExpiryDate(
          baseInstrumentId.toString(),
          value.toUpperCase(),
        );

        const dates = res.data.result?.expiry_date || [];

        const options = dates.map((date: string) => ({
          label: date,
          value: date,
        }));

        setExpiryOptions(options);

        if (dates.length > 0) {
          const firstExpiry = dates[0];
          setSelectedExpiry(firstExpiry);

          await fetchFutureInstrument(baseInstrumentId, firstExpiry);
        }
      } catch (error) {
        console.error("Failed to fetch expiry dates", error);
      }
    }
  };

  const toggleTradeType = () => {
    setTradeType((prev) => (prev === "intraday" ? "positional" : "intraday"));
  };

  const validateLegFields = () => {
    if (!strategyName) {
      message.error("Please fill Strategy Name");
      return false;
    }

    if (!selectedTag) {
      message.error("Please select Tag");
      return false;
    }

    if (!selectedInstrument) {
      message.error("Please select Instrument");
      return false;
    }

    if (!selectedUnderlying) {
      message.error("Please select Underlying");
      return false;
    }

    if (!entryLevel) {
      message.error("Please fill Entry Level");
      return false;
    }

    if (!startTime || !endTime) {
      message.error("Please select Start and End Time");
      return false;
    }

    if (selectedUnderlying === "future" && !selectedExpiry) {
      message.error("Please select Expiry");
      return false;
    }

    return true;
  };
  const handleAddLeg = async () => {
    if (!validateLegFields()) return;

    const instrumentName =
      stockOptions.find((s) => Number(s.value) === selectedInstrument)?.label ||
      "";

    // const defaultOptionType: "CE" | "PE" | "FUT" = "CE";

    // const expiryList = defaultOptionType === "FUT" ? futureExpiry : spotExpiry;

    // const defaultExpiry = expiryList?.[0] || undefined;
    const lotSize =
      selectedUnderlying === "future"
        ? Number(instrumentMeta?.future_lotsize)
        : Number(instrumentMeta?.option_lotsize);

    const defaultExpiry = spotExpiry?.[0] || undefined;

    const newLeg: ExecutionLeg = {
      id: Date.now().toString(),
      strategyName,
      instrumentId: selectedInstrument!,
      instrumentName,
      underlying: selectedUnderlying!,
      entryLevel: entryLevel!,
      stoplossLevel: stoplossLevel || undefined,

      side: "BUY",
      optionType: "CE",

      expiry: defaultExpiry,
      strikePrice: "ATM",

      lots: 1,
      qty: lotSize,
    };

    setLegs((prev) => [...prev, newLeg]);

    // ✅ call strike price API
    if (defaultExpiry) {
      await fetchStrikePrices(selectedInstrument!, defaultExpiry);
    }

    // 🔥 CALL SUBSCRIPTION API
    try {
      const price = getCurrentPrice();

      await getInstrumentSubscription(
        tradeInstrumentId!, // important
        price,
        defaultExpiry || "",
        "CE",
        "ATM",
      );
    } catch (err) {
      console.error("Subscription API error", err);
    }
  };

  const removeLeg = (id: string) => {
    setLegs(legs.filter((leg) => leg.id !== id));
  };
  const fetchStrikePrices = async (instrument: number, expiry: string) => {
    if (!instrumentMeta) return;

    try {
      const series =
        selectedUnderlying === "future"
          ? instrumentMeta.series
          : instrumentMeta.option_series || instrumentMeta.series;

      const res = await getInstrumentStrikePriceList(
        instrument,
        series,
        expiry,
      );

      setStrikePrices(res.data.result?.strike_price_list || []);
    } catch (err) {
      console.error("Strike API error", err);
    }
  };
  const updateLegExpiry = async (id: string, expiry: string) => {
    const leg = legs.find((l) => l.id === id);
    if (!leg) return;

    setLegs((prev) =>
      prev.map((l) =>
        l.id === id
          ? {
              ...l,
              expiry,
            }
          : l,
      ),
    );

    await fetchStrikePrices(selectedInstrument!, expiry);

    await callSubscriptionApi(leg.optionType, expiry, leg.strikePrice || "ATM");
  };
  const updateStrike = async (id: string, strike: number | string) => {
    const leg = legs.find((l) => l.id === id);
    if (!leg) return;

    setLegs((prev) =>
      prev.map((l) =>
        l.id === id
          ? {
              ...l,
              strikePrice: strike,
            }
          : l,
      ),
    );

    if (leg.expiry) {
      await callSubscriptionApi(leg.optionType, leg.expiry, strike);
    }
  };

  const callSubscriptionApi = async (
    optionType: "CE" | "PE" | "FUT" | "EQ",
    expiry: string,
    strike: string | number,
  ) => {
    try {
      const price =
        selectedInstrument && instrumenttik[selectedInstrument]?.Price
          ? instrumenttik[selectedInstrument].Price
          : instrumentMeta?.ltp || 0;

      const atmShift =
        typeof strike === "string" && strike.startsWith("ATM")
          ? strike
          : String(strike);

      await getInstrumentSubscription(
        tradeInstrumentId!,
        price,
        expiry,
        optionType,
        atmShift,
      );
    } catch (error) {
      console.error("Subscription API error", error);
    }
  };
  const columns: ColumnsType<ManualExecutionRow> = [
    {
      title: "ID",
      dataIndex: "id",
      width: 40,
      className: "font-semibold text-[10px]",
    },
    {
      title: "Strategy",
      dataIndex: "strategyName",
      width: 100,
      className: "text-[10px]",
    },
    {
      title: "Tag",
      dataIndex: "strategyTag",
      width: 70,
      className: "text-[10px]",
    },
    {
      title: "Instrument",
      dataIndex: "instrument",
      width: 90,
      className: "text-[10px]",
    },
    {
      title: "Underlying",
      dataIndex: "underlying",
      width: 90,
      className: "text-[10px]",
    },
    {
      title: "Entry",
      dataIndex: "entryLevel",
      width: 70,
      render: (val, record) =>
        record.isEntryLevelHighlighted ? (
          <span className="bg-yellow-100 text-yellow-800 px-1 py-[1px] rounded font-medium text-[10px]">
            {val}
          </span>
        ) : (
          <span className="text-[10px]">{val}</span>
        ),
    },
    {
      title: "Stoploss",
      dataIndex: "stoplossLevel",
      width: 70,
      className: "text-[10px]",
    },
    {
      title: "Client",
      dataIndex: "client",
      width: 50,
      align: "center",
      render: () => <InfoCircleFilled className="text-blue-500 text-sm" />,
    },
    {
      title: "Status",
      dataIndex: "status",
      width: 60,
      align: "center",
      render: (status: boolean) => (
        <Switch
          checked={status}
          size="small"
          className={status ? "bg-blue-600" : "bg-gray-300"}
        />
      ),
    },
    {
      title: "Action",
      key: "action",
      width: 120,
      render: (_, record) => {
        const icons =
          record.actionType === "pending"
            ? [
                <CloseOutlined
                  key="close"
                  className="text-red-500 text-sm cursor-pointer"
                />,
                <CheckCircleFilled
                  key="check"
                  className="text-green-600 text-sm cursor-pointer"
                />,
              ]
            : [
                <FiEdit2
                  key="edit"
                  className="text-orange-500 text-sm cursor-pointer"
                />,
                <IoPlaySharp
                  key="play"
                  className="text-blue-600 text-sm cursor-pointer"
                />,
                <MdDelete
                  key="delete"
                  className="text-red-600 text-sm cursor-pointer"
                />,
              ];
        icons.push(
          <CopyOutlined
            key="copy"
            className="text-blue-500 text-sm cursor-pointer"
          />,
        );
        return <Space size={4}>{icons}</Space>;
      },
    },
  ];

  const handleNumberKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      !/[0-9.]/.test(e.key) &&
      !["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"].includes(e.key)
    ) {
      e.preventDefault();
    }
  };
  const showTicker =
    selectedUnderlying === "spot" ||
    (selectedUnderlying === "future" &&
      selectedInstrument !== baseInstrumentId);

  const currentTick =
    showTicker && selectedInstrument ? instrumenttik[selectedInstrument] : null;

  const toggleSide = (id: string) => {
    setLegs((prev) =>
      prev.map((leg) =>
        leg.id === id
          ? { ...leg, side: leg.side === "BUY" ? "SELL" : "BUY" }
          : leg,
      ),
    );
  };
  // const toggleOptionType = async (id: string) => {
  //   const leg = legs.find((l) => l.id === id);
  //   if (!leg) return;

  //   const next =
  //     leg.optionType === "CE" ? "PE" : leg.optionType === "PE" ? "FUT" : "CE";

  //   const expiryList = next === "FUT" ? futureExpiry : spotExpiry;
  //   const newExpiry = expiryList?.[0];

  //   setLegs((prev) =>
  //     prev.map((l) =>
  //       l.id === id
  //         ? {
  //             ...l,
  //             optionType: next,
  //             expiry: newExpiry,
  //           }
  //         : l,
  //     ),
  //   );

  //   if (newExpiry) {
  //     await fetchStrikePrices(selectedInstrument!, newExpiry);

  //     await callSubscriptionApi(next, newExpiry, leg.strikePrice || "ATM");
  //   }
  // };

  const toggleOptionType = async (id: string) => {
    const leg = legs.find((l) => l.id === id);
    if (!leg || !instrumentMeta) return;

    const types =
      instrumentMeta.series === "EQ"
        ? ["EQ", "CE", "PE", "FUT"]
        : ["CE", "PE", "FUT"];

    const currentIndex = types.indexOf(leg.optionType);
    const next = types[(currentIndex + 1) % types.length] as
      | "CE"
      | "PE"
      | "FUT"
      | "EQ";

    const expiryList = next === "FUT" ? futureExpiry : spotExpiry;
    const newExpiry = next === "EQ" ? undefined : expiryList?.[0];
    const lotSize =
      selectedUnderlying === "future"
        ? Number(instrumentMeta?.future_lotsize)
        : Number(instrumentMeta?.option_lotsize);

    setLegs((prev) =>
      prev.map((l) =>
        l.id === id
          ? {
              ...l,
              optionType: next,
              expiry: newExpiry,
              strikePrice: next === "EQ" ? undefined : l.strikePrice,
              qty: next === "EQ" ? 1 : l.lots * lotSize,
            }
          : l,
      ),
    );

    if (next !== "EQ" && newExpiry) {
      await fetchStrikePrices(selectedInstrument!, newExpiry);
      await callSubscriptionApi(next, newExpiry, leg.strikePrice || "ATM");
    }
  };

  return (
    <div className=" bg-gray-50 p-1 flex flex-col">
      <Card
        size="small"
        className="flex-1 rounded-md border shadow-sm flex flex-col"
        style={{ padding: 0, display: "flex", flexDirection: "column" }}
      >
        {/* Header */}
        <div className="px-2 py-1 border-b flex items-center justify-between bg-white rounded-t-md">
          <Title
            level={5}
            className="!m-0 !font-bold text-gray-800 text-[11px]"
          >
            Manual Execution
          </Title>
          {!isAdding && (
            <PlusOutlined
              className="text-blue-600 text-sm cursor-pointer"
              onClick={() => {
                setIsAdding(true);
                fetchTagOptions();
              }}
            />
          )}
        </div>

        <div className="flex-1 p-1 overflow-auto">
          {isAdding ? (
            <div className="p-2 bg-white">
              <Row gutter={[8, 8]}>
                <Col span={4}>
                  <Input
                    placeholder="Strategy Name"
                    className="text-[11px] h-6"
                    value={strategyName}
                    onChange={(e) => setStrategyName(e.target.value)}
                  />
                </Col>
                <Col span={4}>
                  <Select
                    placeholder="Tag"
                    className="w-full text-[11px] h-6"
                    options={tagOptions}
                    onChange={(val) => setSelectedTag(val)}
                  />
                </Col>
                <Col span={4}>
                  <Select
                    showSearch
                    placeholder="Search Stock"
                    className="w-full text-[11px]"
                    style={{ height: 24 }}
                    filterOption={false}
                    onSelect={handleInstrumentSelect} // ✅ call API here
                    onSearch={handleStockSearch}
                    options={stockOptions}
                  />
                </Col>
                <Col span={4}>
                  <Select
                    placeholder="Underlying"
                    className="w-full text-[11px] h-6"
                    options={underlyingOptions}
                    value={selectedUnderlying} // ✅ add this
                    onChange={handleUnderlyingChange}
                  />
                </Col>
                <Col span={4}>
                  <Select
                    placeholder="Expiry"
                    className="w-full text-[11px] h-6"
                    options={expiryOptions}
                    disabled={selectedUnderlying !== "future"}
                    value={selectedExpiry}
                    onChange={async (val) => {
                      setSelectedExpiry(val);

                      if (val && baseInstrumentId) {
                        await fetchFutureInstrument(baseInstrumentId, val);
                      }
                    }}
                  />
                </Col>
                <Col span={4}>
                  <Button
                    onClick={toggleTradeType}
                    className={`w-full h-6 text-[11px] font-semibold ${
                      tradeType === "intraday"
                        ? "bg-blue-600 text-white"
                        : "bg-yellow-400 text-black"
                    }`}
                  >
                    {tradeType === "intraday" ? "Intraday" : "Positional"}
                  </Button>
                </Col>

                <Col span={4}>
                  <InputNumber
                    placeholder="Entry Level"
                    className="w-full text-[11px] h-6"
                    min={0.01}
                    step={0.01}
                    controls={false}
                    style={{ width: "100%" }}
                    value={entryLevel}
                    onKeyDown={handleNumberKeyDown}
                    onChange={(val) => setEntryLevel(val)}
                  />
                </Col>
                <Col span={4}>
                  <InputNumber
                    placeholder="Stoploss Level"
                    className="w-full text-[11px] h-6"
                    min={0.01}
                    step={0.01}
                    controls={false}
                    style={{ width: "100%" }}
                    value={stoplossLevel}
                    onChange={(val) => setStoplossLevel(val)}
                    onKeyDown={handleNumberKeyDown}
                  />
                </Col>
                <Col span={4}>
                  <TimePicker
                    className="w-full h-6 text-[11px]"
                    value={startTime}
                    onChange={(val) => setStartTime(val)}
                    format="hh:mm A"
                    use12Hours
                    suffixIcon={<ClockCircleOutlined />}
                  />
                </Col>

                <Col span={4}>
                  <TimePicker
                    className="w-full h-6 text-[11px]"
                    value={endTime}
                    onChange={(val) => setEndTime(val)}
                    format="hh:mm A"
                    use12Hours
                    suffixIcon={<ClockCircleOutlined />}
                  />
                </Col>
                <Col span={4}>
                  <Button
                    onClick={handleAddLeg}
                    disabled={
                      !strategyName ||
                      !selectedTag ||
                      !selectedInstrument ||
                      !selectedUnderlying ||
                      !entryLevel ||
                      !startTime ||
                      !endTime
                    }
                    className="w-full h-6 text-[11px] bg-emerald-700 text-white hover:bg-emerald-800"
                  >
                    Add Leg +
                  </Button>
                </Col>
                <Col span={4} className="flex items-center gap-1">
                  <Switch size="small" />
                  <Text className="text-[10px] text-gray-500">Enabled</Text>
                </Col>
              </Row>
              <div className="flex items-center gap-3 max-w-64 mt-2 text-[11px] font-semibold">
                {currentTick && (
                  <>
                    {/* Instrument Name */}
                    <span className="text-gray-700">
                      {
                        stockOptions.find(
                          (s) => Number(s.value) === selectedInstrument,
                        )?.label
                      }
                    </span>

                    <span
                      className={`text-[13px] font-bold ${
                        (currentTick?.ChangeValue ?? 0) >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      ₹{Number(currentTick?.Price ?? 0).toFixed(2)}
                    </span>

                    <span
                      className={`${
                        (currentTick?.ChangeValue ?? 0) >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {(currentTick?.ChangeValue ?? 0) >= 0 ? "+" : ""}
                      {Number(currentTick?.ChangeValue ?? 0).toFixed(2)} (
                      {(currentTick?.PercentChange ?? 0) >= 0 ? "+" : ""}
                      {Number(currentTick?.PercentChange ?? 0).toFixed(2)}%)
                    </span>
                  </>
                )}
              </div>

              {legs.length > 0 && (
                <div className="mt-3 space-y-2 max-h-90 overflow-y-auto">
                  {legs.map((leg) => (
                    <div
                      key={leg.id}
                      className="flex items-center gap-5 bg-gray-100 rounded-xl px-3 py-2 border"
                    >
                      {/* BUY / SELL */}
                      <button
                        onClick={() => toggleSide(leg.id)}
                        className={`w-[56px] h-6 flex items-center justify-center text-[11px] font-bold rounded-md border transition
    ${
      leg.side === "BUY"
        ? "bg-green-100 text-green-700 border-green-300 hover:bg-green-200"
        : "bg-red-100 text-red-700 border-red-300 hover:bg-red-200"
    }`}
                      >
                        {leg.side}
                      </button>

                      {/* CE / PE / FUT */}
                      <button
                        onClick={() => toggleOptionType(leg.id)}
                        className="w-[48px] h-6 flex items-center justify-center text-[11px] font-bold rounded-md border border-blue-300 bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
                      >
                        {leg.optionType}
                      </button>

                      {/* strike */}
                      <div className="bg-gray-200 text-gray-600 text-[11px] px-3 py-[2px] rounded border min-w-[40px] text-center">
                        --
                      </div>

                      {/* lots */}
                      <div className="flex flex-col items-center bg-gray-200 px-2 py-[2px] rounded border">
                        <span className="text-[9px] text-gray-500 leading-none">
                          lots
                        </span>

                        <InputNumber
                          size="small"
                          min={1}
                          value={leg.lots}
                          disabled={leg.optionType === "EQ"}
                          className="w-[50px] text-[11px]"
                          controls={false}
                          onChange={(val) => {
                            const newLots = val || 1;

                            setLegs((prev) =>
                              prev.map((l) =>
                                l.id === leg.id
                                  ? {
                                      ...l,
                                      lots: newLots,
                                      qty:
                                        l.optionType === "EQ"
                                          ? 1
                                          : newLots *
                                            (selectedUnderlying === "future"
                                              ? Number(
                                                  instrumentMeta?.future_lotsize,
                                                )
                                              : Number(
                                                  instrumentMeta?.option_lotsize,
                                                )),
                                    }
                                  : l,
                              ),
                            );
                          }}
                        />
                      </div>

                      {/* qty */}
                      <div className="flex flex-col items-center bg-gray-200 px-3 py-[2px] rounded border">
                        <span className="text-[9px] text-gray-500 leading-none">
                          Qty
                        </span>
                        <span className="text-[11px] font-medium">
                          {leg.optionType === "EQ" ? 1 : leg.qty}
                        </span>
                      </div>

                      {/* Expiry */}
                      <Select
                        size="small"
                        className="w-[120px]"
                        value={leg.expiry}
                        placeholder="Expiry"
                        disabled={leg.optionType === "EQ"}
                        onChange={(val) => updateLegExpiry(leg.id, val)}
                        options={
                          leg.optionType === "FUT"
                            ? futureExpiry.map((d) => ({ label: d, value: d }))
                            : spotExpiry.map((d) => ({ label: d, value: d }))
                        }
                      />

                      {/* Strike */}

                      <Select
                        size="small"
                        className="w-[90px]"
                        placeholder="Strike"
                        value={leg.strikePrice}
                        disabled={
                          leg.optionType === "FUT" || leg.optionType === "EQ"
                        }
                        onChange={(val) => updateStrike(leg.id, val)}
                        options={[
                          // Extra ATM offset values from the image
                          { label: "ATM-2", value: "ATM-2" },
                          { label: "ATM-1", value: "ATM-1" },
                          { label: "ATM", value: "ATM" },
                          { label: "ATM+1", value: "ATM+1" },
                          { label: "ATM+2", value: "ATM+2" },

                          // Your existing dynamic strike prices
                          ...strikePrices.map((s) => ({
                            label: s.toString(),
                            value: s,
                          })),
                        ]}
                      />

                      {/* delete */}
                      <MdDelete
                        className="text-red-600 cursor-pointer ml-auto hover:text-red-800"
                        size={16}
                        onClick={() => removeLeg(leg.id)}
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-center gap-2 mt-4">
                <Button
                  className="px-4 h-7 text-blue-600 border font-semibold"
                  onClick={() => setIsAdding(false)}
                >
                  Submit
                </Button>
                <Button
                  className="px-4 h-7 text-red-600 border font-semibold"
                  onClick={() => setIsAdding(false)}
                >
                  Back
                </Button>
              </div>
            </div>
          ) : (
            <Spin spinning={loading}>
              <Table
                size="small"
                columns={columns}
                dataSource={data}
                pagination={false}
                sticky
                rowClassName={(record) =>
                  record.isRowHighlighted ? "bg-yellow-50" : ""
                }
                tableLayout="fixed"
                scroll={{ x: "max-content", y: "calc(100vh - 150px)" }}
                className="manual-execution-table"
                locale={{
                  emptyText: (
                    <Empty
                      description="No Manual Executions Found"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                  ),
                }}
              />
            </Spin>
          )}
        </div>
      </Card>

      <style>
        {`
        .manual-execution-table .ant-table-thead > tr > th {
          background: #f1f5f9 !important;
          font-size: 10px;
          font-weight: 600;
          padding: 4px 4px;
        }
        .manual-execution-table .ant-table-tbody > tr > td {
          padding: 3px 4px !important;
          font-size: 10px;
          white-space: nowrap;
        }
        .manual-execution-table .ant-table-tbody > tr:hover > td {
          background: #e0f2ff !important;
          transition: 0.1s;
        }
        .manual-execution-table .ant-table-body::-webkit-scrollbar {
          width: 3px; height: 3px;
        }
        .manual-execution-table .ant-table-body::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
      `}
      </style>
    </div>
  );
};

export default ManualExecution;
