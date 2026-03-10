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
  postManualExecution,
} from "../../services/manualExecutionApi";
import { getEnabledClientList } from "../../services/SettingsService/userSettingsApi";
import { FetchStrategyList } from "../../services/SettingsService/userSettingsApi";
import { useSocket } from "../../hook/useSocket";
import socketService from "../../services/socketService";

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
  const subscribedRef = React.useRef<string[]>([]);
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
  const [subscribedInstruments, setSubscribedInstruments] = useState<string[]>(
    [],
  );
  const [legInstrumentMap, setLegInstrumentMap] = useState<
    Record<string, string>
  >({});
  const [legTicks, setLegTicks] = useState<Record<string, any>>({});
  const [displayInstrumentName, setDisplayInstrumentName] =
    useState<string>("");
  const [enabled, setEnabled] = useState<boolean>(false);

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
        entryLevel:
          item.entry_level != null
            ? Number(item.entry_level).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })
            : "-",

        stoplossLevel:
          item.stoploss_level != null
            ? Number(item.stoploss_level).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })
            : "-",
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
      setDisplayInstrumentName(
        stockOptions.find((s) => Number(s.value) === instrumentId)?.label || "",
      );
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

      const futureData = res.data?.result?.[0];

      if (!futureData) return;

      const futureInstrumentId = futureData.instrument;

      // set instrument ids
      setTradeInstrumentId(futureInstrumentId);
      // setSelectedInstrument(futureInstrumentId);
      setDisplayInstrumentName(futureData.instrument_name);

      // ✅ store API LTP as default tick
      setInstrumenttik((prev: any) => ({
        ...prev,
        [futureInstrumentId]: {
          Price: futureData.ltp,
          ChangeValue: futureData.ChangeValue,
          PercentChange: futureData.PercentChange,
        },
      }));
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

      // await getInstrumentSubscription(
      //   tradeInstrumentId!, // important
      //   price,
      //   defaultExpiry || "",
      //   "CE",
      //   "ATM",
      // );
      await callSubscriptionApi(newLeg.id, "CE", defaultExpiry || "", "ATM");
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

    const newStrike = "ATM";

    setLegs((prev) =>
      prev.map((l) =>
        l.id === id
          ? {
              ...l,
              expiry,
              strikePrice: newStrike, // ✅ reset strike when expiry changes
            }
          : l,
      ),
    );

    // fetch new strike list
    await fetchStrikePrices(selectedInstrument!, expiry);

    // call subscription with ATM
    await callSubscriptionApi(id, leg.optionType, expiry, newStrike);
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
      // await callSubscriptionApi(leg.optionType, leg.expiry, strike);
      await callSubscriptionApi(id, leg.optionType, leg.expiry, strike);
    }
  };

  const callSubscriptionApi = async (
    legId: string,
    optionType: "CE" | "PE" | "FUT" | "EQ",
    expiry: string,
    strike: string | number,
  ) => {
    try {
      const price = getCurrentPrice();

      const atmShift =
        typeof strike === "string" && strike.startsWith("ATM")
          ? strike
          : String(strike);

      const res = await getInstrumentSubscription(
        tradeInstrumentId!,
        price,
        expiry,
        optionType,
        atmShift,
      );

      const instrument = res.data?.subscribed_instruments?.[0];

      if (!instrument) return;

      setSubscribedInstruments((prev) =>
        prev.includes(instrument) ? prev : [...prev, instrument],
      );

      setLegInstrumentMap((prev) => ({
        ...prev,
        [legId]: instrument,
      }));
    } catch (error) {
      console.error("Subscription API error", error);
    }
  };

  useEffect(() => {
    if (!subscribedInstruments.length) return;

    const newInstruments = subscribedInstruments.filter(
      (inst) => !subscribedRef.current.includes(inst),
    );

    if (!newInstruments.length) return;

    newInstruments.forEach((inst) => {
      const topic = `tick_message_${inst}`;

      socketService.subscribe(topic, (body: any) => {
        const inner =
          typeof body.data === "string" ? JSON.parse(body.data) : body;

        setLegTicks((prev) => ({
          ...prev,
          [inst]: {
            Price: inner.Price,
            ChangeValue: inner.ChangeValue,
            PercentChange: inner.PercentChange,
          },
        }));
      });
    });

    subscribedRef.current = [...subscribedRef.current, ...newInstruments];
  }, [subscribedInstruments]);
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
      render: (status: boolean, record) => (
        <Switch
          checked={status}
          size="small"
          className={status ? "bg-blue-600" : "bg-gray-300"}
          onChange={(checked) => handleToggleStatus(record.id, checked)}
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
    selectedUnderlying === "spot" || selectedUnderlying === "future";

  const currentTick =
    showTicker && selectedInstrument ? instrumenttik[selectedInstrument] : null;

  const handleToggleStatus = (id: number, checked: boolean) => {
    setData((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: checked } : item,
      ),
    );
  };
  const toggleSide = (id: string) => {
    setLegs((prev) =>
      prev.map((leg) =>
        leg.id === id
          ? { ...leg, side: leg.side === "BUY" ? "SELL" : "BUY" }
          : leg,
      ),
    );
  };

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
      await callSubscriptionApi(id, next, newExpiry, leg.strikePrice || "ATM");
    }
  };

  const buildPayload = () => {
    const payload = {
      id: 0,
      underlying_instrument: selectedUnderlying?.toUpperCase(),
      underlying_instrument_id: String(tradeInstrumentId),

      product_type: tradeType,
      instrument: String(baseInstrumentId),

      strategy_name: strategyName,
      strategy_id: selectedTag,

      entry_time: startTime.format("HH:mm:ss"),
      entry_level: entryLevel,

      enabled: enabled,
      reset: true,
      stoploss_level: stoplossLevel,

      portfolio_leg: legs.map((leg) => ({
        id: 0,
        signal: leg.side,
        instrument_type: leg.optionType,
        strike_selection:
          leg.optionType === "CE" || leg.optionType === "PE"
            ? leg.strikePrice
            : undefined,

        expiry_date: leg.optionType !== "EQ" ? leg.expiry : undefined,

        manual_execution_id: 0,
        delete: false,
        lots: String(leg.lots),
        quantity: leg.qty,
      })),

      squareoff_time: endTime.format("HH:mm:ss"),

      client_multiplier: {
        1: {
          multiplier: 1,
          enabled: true,
        },
      },
    };

    return payload;
  };

  const handleSubmitExecution = async () => {
    try {
      const payload = buildPayload();

      const { data } = await postManualExecution(payload);

      // If API sends error inside response
      if (data?.error) {
        message.error(data.error);
        return;
      }

      // Success response
      if (data?.result) {
        message.success(data.result);
      } else {
        message.success("Success");
      }

      setIsAdding(false);
      fetchExecutions();
    } catch (error: any) {
      message.error(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          "Failed to create execution",
      );
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
                  <Switch
                    size="small"
                    checked={enabled}
                    onChange={(checked) => setEnabled(checked)}
                  />
                  <Text className="text-[10px] text-gray-500">Enabled</Text>
                </Col>
              </Row>
              <div className="flex items-center gap-3 w-full mt-2 text-[11px] font-semibold">
                {currentTick && (
                  <>
                    {/* Instrument Name */}
                    <span className="text-gray-700">
                      {displayInstrumentName}
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
                <div className="mt-4 flex flex-col gap-1.5 max-h-90 overflow-y-auto pr-1">
                  {legs.map((leg) => (
                    <div
                      key={leg.id}
                      className="flex items-center gap-2 bg-white border border-slate-200 hover:border-blue-400 rounded-lg px-2 py-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-all group"
                    >
                      {/* 1. SIDE (BUY/SELL) - Compact Pill */}
                      <div className="w-[54px] flex-shrink-0">
                        <button
                          onClick={() => toggleSide(leg.id)}
                          className={`w-full h-7 flex items-center justify-center text-[10px] font-black rounded border transition-all active:scale-90 ${
                            leg.side === "BUY"
                              ? "bg-green-50 text-green-600 border-green-200 hover:bg-green-100"
                              : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                          }`}
                        >
                          {leg.side}
                        </button>
                      </div>

                      <div className="w-[48px] flex-shrink-0">
                        <button
                          onClick={() => toggleOptionType(leg.id)}
                          className={`w-full h-7 flex items-center justify-center text-[10px] font-bold rounded border transition-all active:scale-95
      ${
        leg.optionType === "CE"
          ? "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"
          : leg.optionType === "PE"
            ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
            : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
      }
    `}
                        >
                          {leg.optionType}
                        </button>
                      </div>

                      {/* 3. STRIKE PRICE LIVE TICK */}
                      <div className="w-[60px] flex-shrink-0 flex justify-center border rounded px-3 py-1">
                        {(() => {
                          const instrumentId = legInstrumentMap[leg.id];
                          const tick = instrumentId
                            ? legTicks[instrumentId]
                            : null;

                          return (
                            <span
                              className={`text-[13px] font-mono tracking-tighter ${
                                tick?.ChangeValue >= 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {tick ? Number(tick.Price).toFixed(1) : "--"}
                            </span>
                          );
                        })()}
                      </div>

                      {/* 4. LOTS & 5. QTY (Combined Module) */}
                      <div className="flex items-center bg-slate-50 border border-slate-100 rounded px-1.5 py-0.5 gap-2">
                        <div className="flex flex-col">
                          <span className="text-[7px] text-slate-400 font-bold uppercase leading-none mb-0.5">
                            Lots
                          </span>
                          <InputNumber
                            size="small"
                            variant="borderless"
                            min={1}
                            value={leg.lots}
                            // disabled={leg.optionType === "EQ"}
                            className="w-[40px] h-4 text-[11px] font-bold p-0"
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
                        <div className="w-[1px] h-6 bg-slate-200/60" />{" "}
                        {/* Divider */}
                        <div className="flex flex-col items-center min-w-[30px]">
                          <span className="text-[7px] text-slate-400 font-bold uppercase leading-none mb-0.5">
                            Qty
                          </span>
                          <span className="text-[11px] font-bold text-slate-600 leading-none">
                            {leg.optionType === "EQ" ? 1 : leg.qty}
                          </span>
                        </div>
                      </div>

                      {/* 6. EXPIRY SELECT */}
                      <div className="w-[110px] flex-shrink-0">
                        <Select
                          size="small"
                          variant="borderless"
                          className="w-full bg-slate-50 rounded text-[11px] hover:bg-slate-100 transition-colors"
                          value={leg.expiry}
                          placeholder="Expiry"
                          disabled={leg.optionType === "EQ"}
                          onChange={(val) => updateLegExpiry(leg.id, val)}
                          options={
                            leg.optionType === "FUT"
                              ? futureExpiry.map((d) => ({
                                  label: d,
                                  value: d,
                                }))
                              : spotExpiry.map((d) => ({ label: d, value: d }))
                          }
                        />
                      </div>

                      {/* 7. STRIKE PRICE SELECT */}
                      <div className="w-[95px] flex-shrink-0">
                        <Select
                          size="small"
                          variant="borderless"
                          className="w-full bg-slate-50 rounded text-[11px] font-semibold text-blue-600 hover:bg-slate-100 transition-colors"
                          placeholder="Strike"
                          value={leg.strikePrice}
                          disabled={
                            leg.optionType === "FUT" || leg.optionType === "EQ"
                          }
                          onChange={(val) => updateStrike(leg.id, val)}
                          options={[
                            { label: "ATM-2", value: "ATM-2" },
                            { label: "ATM-1", value: "ATM-1" },
                            { label: "ATM", value: "ATM" },
                            { label: "ATM+1", value: "ATM+1" },
                            { label: "ATM+2", value: "ATM+2" },
                            ...strikePrices.map((s) => ({
                              label: s.toString(),
                              value: s,
                            })),
                          ]}
                        />
                      </div>

                      {/* 8. DELETE (Now tucked inside the main flow) */}
                      <div className="flex-shrink-0 border-l  pl-1 ml-1">
                        <button
                          onClick={() => removeLeg(leg.id)}
                          className="p-1 text-red-400 hover:text-red-600 rounded transition-all"
                        >
                          <MdDelete size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-center gap-2 mt-4">
                <Button
                  className="px-4 h-7 text-blue-600 border font-semibold"
                  onClick={handleSubmitExecution}
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
