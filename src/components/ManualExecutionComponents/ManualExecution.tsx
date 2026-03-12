import React, { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";
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
  Modal,
  Checkbox,
} from "antd";
import type { ColumnType } from "antd/es/table";
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
  getManualExecutionsById,
  getManualStrategyByClientId,
  updateManualExecutionEnabled,
  deleteManualExecutionById,
  copyManualExecution,
  reorderManualExecution,
  getManualExecutionByPKId,
  getClientMultiplierList,
  insertUpdateClientMultiplier,
} from "../../services/manualExecutionApi";
import { getEnabledClientList } from "../../services/SettingsService/userSettingsApi";
import { FetchStrategyList } from "../../services/SettingsService/userSettingsApi";
import { useSocket } from "../../hook/useSocket";
import socketService from "../../services/socketService";
import { getMeApi } from "../../services/authApi";

const { Title, Text } = Typography;
const { Option } = Select;

import { createContext, useContext } from "react";
import { Form } from "antd";

const EditableContext = createContext<any>(null);

const CombinedRow: React.FC<any> = (props) => {
  const [form] = Form.useForm();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: props["data-row-key"], // AntD passes the rowKey here
  });

  const style: React.CSSProperties = {
    ...props.style,
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: isDragging ? "grabbing" : "move",
    zIndex: isDragging ? 9999 : "auto",
    position: isDragging ? "relative" : undefined,
    userSelect: isDragging ? "none" : "auto",
  };

  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr
          {...props}
          ref={setNodeRef}
          style={style}
          {...attributes}
          {...listeners}
        />
      </EditableContext.Provider>
    </Form>
  );
};
const EditableCell: React.FC<any> = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  ...restProps
}) => {
  const [editing, setEditing] = React.useState(false);
  const form = useContext(EditableContext);

  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({ [dataIndex]: record[dataIndex] });
  };

  const save = async () => {
    try {
      const values = await form.validateFields();
      toggleEdit();
      handleSave({ ...record, ...values });
    } catch (err) {}
  };

  let childNode = children;

  if (editable) {
    childNode = editing ? (
      <Form.Item style={{ margin: 0 }} name={dataIndex}>
        <InputNumber
          size="small"
          autoFocus
          controls={false}
          style={{ width: "100%", fontSize: "10px", height: "18px" }}
          onPressEnter={save}
          onBlur={save}
        />
      </Form.Item>
    ) : (
      <div onDoubleClick={toggleEdit} className="cursor-pointer">
        {children}
      </div>
    );
  }

  return <td {...restProps}>{childNode}</td>;
};

interface ManualExecutionRow {
  key: number;
  id: number;
  strategyName: string;
  strategyTag: string;
  instrument: string; // Used for display name
  instrumentId: string; // NEW: To store the actual Instrument ID
  underlying: string;
  underlyingInstrumentId: string; // NEW: To store the Underlying Instrument ID
  entryLevel: string | number;
  isEntryLevelHighlighted?: boolean;
  stoplossLevel: string | number;
  status: boolean;
  actionType: "pending" | "active";
  isRowHighlighted?: boolean;
  strategy_id: number;
  productType: string;
  entryTime: string;
  rowColor?: string;
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
  const [startTime, setStartTime] = useState<string>("09:15");
  const [endTime, setEndTime] = useState<string>("15:27");
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
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [tableTicks, setTableTicks] = useState<Record<string, any>>({});
  const tableSubscribedRef = React.useRef<string[]>([]);
  const [clientModalVisible, setClientModalVisible] = useState(false);
  const [clientData, setClientData] = useState<any[]>([]);
  const [clientModalId, setClientModalId] = useState<number | null>(null);
  const [executionId, setExecutionId] = useState<number | null>(null);
  const [executionData, setExecutionData] = useState<any>(null);
  const fetchExecutions = async () => {
    try {
      setLoading(true);
      const response = await getManualExecutions();

      const mappedData: ManualExecutionRow[] = response.data.result.map(
        (item: any) => {
          let rowColor = "";

          if (!item.completed && !item.enabled && !item.is_position) {
            rowColor = "row-red";
          } else if (item.completed && !item.enabled && !item.is_position) {
            rowColor = "row-green";
          } else if (!item.completed && item.enabled && item.is_position) {
            rowColor = "row-yellow";
          } else if (!item.completed && item.enabled && !item.is_position) {
            rowColor = "row-white";
          }

          return {
            key: item.id,
            id: item.id,
            strategyName: item.strategy_name,
            strategyTag: item.strategy_tag,
            strategy_id: item.strategy_id,
            instrument: item.instrument_name,
            instrumentId: String(item.instrument),
            underlying: item.underlying_instrument,
            underlyingInstrumentId: String(item.underlying_instrument_id),

            productType: item.product_type,
            entryTime: item.entry_time,

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

            rowColor,
          };
        },
      );
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

  // Subscribe to all underlying instruments loaded into the table
  useEffect(() => {
    if (!data || data.length === 0) return;

    const newTableInstruments = data
      .map((row) => row.underlyingInstrumentId)
      .filter((id) => id && !tableSubscribedRef.current.includes(id));

    if (newTableInstruments.length === 0) return;

    const uniqueNewInstruments = Array.from(new Set(newTableInstruments));

    uniqueNewInstruments.forEach((inst) => {
      const topic = `tick_message_${inst}`;
      socketService.subscribe(topic, (body: any) => {
        const inner =
          typeof body.data === "string" ? JSON.parse(body.data) : body;

        setTableTicks((prev) => ({
          ...prev,
          [inst]: {
            Price: inner.Price,
            ChangeValue: inner.ChangeValue,
            PercentChange: inner.PercentChange,
          },
        }));
      });
    });

    tableSubscribedRef.current = [
      ...tableSubscribedRef.current,
      ...uniqueNewInstruments,
    ];
  }, [data]);

  const fetchTagOptions = async (currentStrategyId?: number) => {
    try {
      const fetchMe = await getMeApi();
      const clientId = fetchMe.data.user_clients?.[0];

      const clientRes = await getManualStrategyByClientId(clientId);

      // 🔹 Check if strategy_id is null
      const strategies = clientRes.data.result || [];

      // ONLY show the error if we are creating a NEW execution (!currentStrategyId)
      // and there are no available tags.
      if (
        (!strategies.length || strategies[0]?.strategy_id === null) &&
        !currentStrategyId
      ) {
        message.error("All strategy tags are in use.");
      }

      const strategyRes = await FetchStrategyList();

      const clientStrategies: number[] =
        clientRes.data.result?.flatMap((c: any) => c.strategy_id) || [];

      const strategyList = strategyRes.data.result || [];
      if (currentStrategyId && !clientStrategies.includes(currentStrategyId)) {
        clientStrategies.push(currentStrategyId);
      }

      const filteredStrategies = strategyList.filter((s: any) =>
        clientStrategies.includes(s.id),
      );

      const options = filteredStrategies.map((s: any) => ({
        label: `${s.id} : ${s.name}`,
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

  // const toggleTradeType = () => {
  //   setTradeType((prev) => (prev === "intraday" ? "positional" : "intraday"));
  // };
  const toggleTradeType = () => {
    setTradeType((prev) => {
      const nextType = prev === "intraday" ? "positional" : "intraday";

      if (nextType === "intraday") {
        // Automatically default to 15:27 without running the old validations
        // that caused the "09:15" bug
        setEndTime("15:27");

        // Safety check: ensure Start Time isn't accidentally higher than 15:27
        if (startTime > "15:27") {
          setStartTime("15:27");
        }
      } else {
        // Positional: Clear the squareoff time
        setEndTime("");
      }

      return nextType;
    });
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

    const lotSize =
      selectedUnderlying === "future"
        ? Number(instrumentMeta?.future_lotsize)
        : Number(instrumentMeta?.option_lotsize);

    const defaultExpiry = spotExpiry?.[0] || undefined;

    const newLeg: ExecutionLeg = {
      id: `temp_${Date.now()}`,
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

  const handleToggleStatus = async (id: number, checked: boolean) => {
    try {
      const row = data.find((d) => d.id === id);
      if (!row) return;

      const payload = {
        id: row.id,
        instrument: row.instrumentId,
        strategy_name: row.strategyName,
        underlying_instrument: row.underlying,
        strategy_id: row.strategy_id,
        // Use dynamic values from the row data
        product_type: row.productType,
        entry_time: row.entryTime,
        entry_level: Number(String(row.entryLevel).replace(/,/g, "")),
        stoploss_level: Number(String(row.stoplossLevel).replace(/,/g, "")),
        enabled: checked,
        reset: !checked,

        // Conditionally set the underlying ID based on the underlying type
        underlying_instrument_id:
          row.underlying?.toLowerCase() === "spot"
            ? row.instrumentId
            : row.underlyingInstrumentId,
      };

      try {
        const res = await updateManualExecutionEnabled(payload);

        if (res.data.result) {
          setData((prev) =>
            prev.map((item) =>
              item.id === id ? { ...item, status: checked } : item,
            ),
          );

          message.success(res.data.result);
          fetchExecutions();
        } else if (res.data.error) {
          message.error(res.data.error);
        }
      } catch (error) {
        console.error("Status update failed", error);
        message.error("Failed to update status");
      }
    } catch (error) {
      console.error("Status update failed", error);
      message.error("Failed to update status");
    }
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
              qty: next === "EQ" ? 1 : lotSize,
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
      // id: 0,
      id: isEditMode && editingId ? editingId : 0,
      underlying_instrument: selectedUnderlying?.toUpperCase(),
      underlying_instrument_id: String(tradeInstrumentId),

      product_type: tradeType,
      instrument: String(baseInstrumentId),

      strategy_name: strategyName,
      strategy_id: selectedTag,
      expiry_date: selectedExpiry ? selectedExpiry : null, // ✅ ADD THIS

      entry_time: `${startTime}:00`,
      squareoff_time: endTime ? `${endTime}:00` : null,
      entry_level: entryLevel,

      enabled: enabled,
      reset: !enabled,
      stoploss_level: stoplossLevel,

      // portfolio_leg: legs.map((leg) => ({
      //   // id: 0,
      //   id: isEditMode && leg.id ? leg.id : 0,
      //   signal: leg.side,
      //   instrument_type: leg.optionType,
      //   strike_selection:
      //     leg.optionType === "CE" || leg.optionType === "PE"
      //       ? leg.strikePrice
      //       : undefined,

      //   expiry_date: leg.optionType !== "EQ" ? leg.expiry : undefined,

      //   // manual_execution_id: 0,
      //   manual_execution_id: isEditMode && editingId ? editingId : 0,
      //   delete: false,
      //   lots: String(leg.lots),
      //   quantity: leg.qty,
      // })),

      portfolio_leg: legs.map((leg) => {
        // ✅ Explicitly check if it's a frontend-only temporary leg
        const isNewLeg = String(leg.id).startsWith("temp_");

        return {
          // ✅ Send 0 if temporary, otherwise send the real database ID
          id: isNewLeg ? 0 : Number(leg.id),

          signal: leg.side,
          instrument_type: leg.optionType,
          strike_selection:
            leg.optionType === "CE" || leg.optionType === "PE"
              ? String(leg.strikePrice)
              : undefined,

          expiry_date: leg.optionType !== "EQ" ? leg.expiry : undefined,

          manual_execution_id: isEditMode && editingId ? editingId : 0,
          delete: false,
          lots: String(leg.lots),
          quantity: leg.qty,
        };
      }),

      // squareoff_time: endTime.format("HH:mm:ss"),

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
      resetForm();
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

  const handleEditExecution = async (id: number) => {
    try {
      const res = await getManualExecutionsById(id);
      const exec = res.data.result.manual_execution[0];
      const legsData = res.data.result.portfolio_legs || [];

      setIsAdding(true);
      setIsEditMode(true);
      setEditingId(exec.id);

      await fetchTagOptions(exec.strategy_id);

      const instrumentId = Number(exec.instrument);
      const futureInstrumentId = Number(exec.underlying_instrument_id);
      const underlying = exec.underlying_instrument.toLowerCase();

      // 1. Set pure scalar states immediately
      setStrategyName(exec.strategy_name);
      setSelectedTag(exec.strategy_id);
      setEntryLevel(exec.entry_level);
      setStoplossLevel(exec.stoploss_level);
      setTradeType(
        exec.product_type === "positional" ? "positional" : "intraday",
      );
      // Extract the first 5 characters (e.g., "09:15:00" becomes "09:15")
      setStartTime(exec.entry_time.substring(0, 5));
      setEndTime(
        exec.squareoff_time ? exec.squareoff_time.substring(0, 5) : "",
      );
      setEnabled(exec.enabled);
      setDisplayInstrumentName(exec.instrument_name);
      setBaseInstrumentId(instrumentId);
      setSelectedInstrument(instrumentId);

      setStockOptions([
        {
          label: exec.instrument_name,
          value: instrumentId as any,
        },
      ]);

      // Set default ticker data
      setInstrumenttik((prev: any) => ({
        ...prev,
        [instrumentId]: {
          Price: exec.ltp,
          ChangeValue: exec.ChangeValue,
          PercentChange: exec.PercentChange,
        },
      }));

      // 2. Fetch Metadata sequentially to avoid state race conditions
      const metaRes = await getSpotFutureUnderlying(instrumentId.toString());
      const metaResult = metaRes.data.result;

      setInstrumentMeta(metaResult);
      setSpotExpiry(metaResult.spot_expiry || []);
      setFutureExpiry(metaResult.future_expiry || []);

      const types = metaResult.underlying_instrument_type || [];
      let uOptions;
      if (metaResult.series === "FUTCOM") {
        uOptions = [{ label: "FUTURE", value: "future" }];
      } else {
        uOptions = types.map((type: string) => ({
          label: type.toUpperCase(),
          value: type,
        }));
      }
      setUnderlyingOptions(uOptions);
      setSelectedUnderlying(underlying);

      // 3. Resolve underlying specific details (Expiry & TradeInstrumentId)
      let currentTradeInstId = instrumentId;

      if (underlying === "spot") {
        setTradeInstrumentId(instrumentId);
        setSelectedExpiry(null);
        setExpiryOptions([]);
      } else if (underlying === "future") {
        if (metaResult.series === "FUTCOM") {
          const baseExpiry = metaResult.base_expiry;
          setExpiryOptions([{ label: baseExpiry, value: baseExpiry }]);
          setSelectedExpiry(baseExpiry);
          currentTradeInstId = futureInstrumentId;
          setTradeInstrumentId(futureInstrumentId);
        } else {
          const expRes = await getInstrumentExpiryDate(
            instrumentId.toString(),
            underlying.toUpperCase(),
          );
          const dates = expRes.data.result?.expiry_date || [];
          setExpiryOptions(
            dates.map((date: string) => ({ label: date, value: date })),
          );

          if (dates.length > 0) {
            let matchedExpiry = dates[0];

            // ✅ FIX: Use the leg's expiry date if the main execution expiry is null
            const targetExpiry = exec.expiry_date || legsData?.[0]?.expiry_date;

            if (targetExpiry) {
              const targetDayjs = dayjs(targetExpiry);
              const apiExpiryStr = targetDayjs
                .format("DD-MMM-YYYY")
                .toUpperCase();

              const foundOption = dates.find((d: string) => {
                // Check if strict string matches (e.g. "02-APR-2026")
                if (d.toUpperCase() === apiExpiryStr) return true;
                // Fallback to dayjs date comparison
                if (dayjs(d).isValid() && dayjs(d).isSame(targetDayjs, "day"))
                  return true;
                return false;
              });

              if (foundOption) {
                matchedExpiry = foundOption;
              }
            }

            setSelectedExpiry(matchedExpiry);
            await fetchFutureInstrument(instrumentId, matchedExpiry);
          }
          currentTradeInstId = futureInstrumentId;
          setTradeInstrumentId(futureInstrumentId);
        }
      }

      // 4. Map Legs, Populate Dropdowns, and Connect Sockets
      const newLegInstrumentMap: Record<string, string> = {};
      const newSubscribedInstruments: string[] = [];

      const mappedLegs = await Promise.all(
        legsData.map(async (leg: any) => {
          const legId = String(leg.id);
          let legExpiry = undefined;

          // Parse Expiry Date correctly
          if (leg.expiry_date) {
            const availableExpiries =
              leg.instrument_type === "FUT"
                ? metaResult.future_expiry || []
                : metaResult.spot_expiry || [];

            const targetDate = dayjs(leg.expiry_date);
            legExpiry = availableExpiries.find((e: string) =>
              dayjs(e).isSame(targetDate, "day"),
            );

            if (!legExpiry) {
              legExpiry = targetDate.format("DD-MMM-YYYY").toUpperCase(); // Fallback
            }

            // Fetch strike prices for this leg's expiry so the dropdown populates
            if (leg.instrument_type !== "EQ" && leg.instrument_type !== "FUT") {
              const series =
                underlying === "future"
                  ? metaResult.series
                  : metaResult.option_series || metaResult.series;

              try {
                const spRes = await getInstrumentStrikePriceList(
                  instrumentId,
                  series,
                  legExpiry,
                );
                setStrikePrices(spRes.data.result?.strike_price_list || []);
              } catch (err) {
                console.error("Strike API error during edit", err);
              }
            }
          }

          // Fetch tick subscription for the leg
          if (leg.instrument_type !== "EQ" && legExpiry) {
            try {
              const atmShift =
                typeof leg.strike_selection === "string" &&
                leg.strike_selection.startsWith("ATM")
                  ? leg.strike_selection
                  : String(leg.strike_selection);

              const price = exec.ltp || metaResult.ltp || 0;

              const subRes = await getInstrumentSubscription(
                instrumentId,
                price,
                legExpiry,
                leg.instrument_type,
                atmShift,
              );

              const inst = subRes.data?.subscribed_instruments?.[0];
              if (inst) {
                newSubscribedInstruments.push(inst);
                newLegInstrumentMap[legId] = inst;
              }
            } catch (error) {
              console.error("Subscription API error during edit", error);
            }
          }

          return {
            id: legId,
            strategyName: exec.strategy_name,
            instrumentId: instrumentId,
            instrumentName: exec.instrument_name,
            underlying: underlying,
            expiry: legExpiry,
            strikePrice: leg.strike_selection,
            entryLevel: exec.entry_level,
            stoplossLevel: exec.stoploss_level,
            side: leg.signal,
            optionType: leg.instrument_type,
            lots: Number(leg.lots),
            qty: Number(leg.quantity),
          };
        }),
      );

      // 5. Finalize states
      setLegs(mappedLegs);
      setLegInstrumentMap((prev) => ({ ...prev, ...newLegInstrumentMap }));
      setSubscribedInstruments((prev) => {
        const unique = new Set([...prev, ...newSubscribedInstruments]);
        return Array.from(unique);
      });
    } catch (error) {
      console.error("Edit fetch failed", error);
      message.error("Failed to load execution data");
    }
  };

  const resetForm = () => {
    setStrategyName("");
    setSelectedTag(null);
    setSelectedInstrument(null);
    setBaseInstrumentId(null);
    setTradeInstrumentId(null);

    setSelectedUnderlying(null);
    setSelectedExpiry(null);

    setEntryLevel(null);
    setStoplossLevel(null);

    setStartTime("09:15");
    setEndTime("15:27");

    setTradeType("intraday");
    setEnabled(false);

    setLegs([]);
    setStrikePrices([]);
    setExpiryOptions([]);

    setInstrumentMeta(null);
    setDisplayInstrumentName("");

    setSubscribedInstruments([]);
    setLegInstrumentMap({});
    setLegTicks({});

    setIsEditMode(false);
    setEditingId(null);
  };

  const handleDeleteExecution = (id: number) => {
    Modal.confirm({
      title: "Delete Manual Execution",
      content: "Are you sure you want to delete this manual execution?",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      centered: true,

      async onOk() {
        try {
          const res = await deleteManualExecutionById(id);

          if (res.data.result) {
            message.success(res.data.result);

            setData((prev) => prev.filter((item) => item.id !== id));
          } else {
            message.error(res.data.error);
          }
        } catch (error) {
          console.error("Delete failed", error);
          message.error("Delete failed");
        }
      },
    });
  };

  const handleCopyExecution = async (id: number) => {
    try {
      const res = await copyManualExecution(id);

      if (res.data.result) {
        message.success(res.data.result);

        // reload table data
        fetchExecutions();
      } else if (res.data.error) {
        message.error(res.data.error);
      }
    } catch (error) {
      console.error("Copy failed", error);
      message.error("Copy failed");
    }
  };
  type EditableColumnType = ColumnType<ManualExecutionRow> & {
    editable?: boolean;
  };
  const columns: EditableColumnType[] = [
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
      width: 80,
      className: "text-[10px]",
    },
    {
      title: "Price",
      key: "price",
      width: 70,
      className: "text-[10px] font-bold",
      render: (_, record) => {
        const tick = tableTicks[record.underlyingInstrumentId];

        // Show placeholder if socket hasn't returned a price yet
        if (!tick || tick.Price === undefined) {
          return <span className="text-gray-400">--</span>;
        }

        return (
          <span className={"text-gray-600"}>
            {Number(tick.Price).toFixed(2)}
          </span>
        );
      },
    },
    {
      title: "Entry",
      dataIndex: "entryLevel",
      width: 70,
      editable: true,
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
      editable: true,
    },
    {
      title: "Client",
      dataIndex: "client",
      width: 40,
      align: "center",
      render: (_, record) => (
        <InfoCircleFilled
          className="text-blue-500 text-sm cursor-pointer"
          onClick={() => openClientModal(record.id)}
        />
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      width: 50,
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
      width: 70,
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
                  onClick={() => handleEditExecution(record.id)}
                />,

                // ✅ Show Play icon only if status is true
                record.status && (
                  <IoPlaySharp
                    key="play"
                    className="text-blue-600 text-sm cursor-pointer"
                  />
                ),

                <MdDelete
                  key="delete"
                  className="text-red-600 text-sm cursor-pointer"
                  onClick={() => handleDeleteExecution(record.id)}
                />,
              ].filter(Boolean); // removes false values

        icons.push(
          <CopyOutlined
            key="copy"
            className="text-blue-500 text-sm cursor-pointer"
            onClick={() => handleCopyExecution(record.id)}
          />,
        );

        return <Space size={4}>{icons}</Space>;
      },
    },
  ];

  const mergedColumns = columns.map((col: any) => {
    if (!col.editable) return col;

    return {
      ...col,
      onCell: (record: ManualExecutionRow) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave: handleSave,
      }),
    };
  });
  const handleSave = async (row: ManualExecutionRow) => {
    const newData = [...data];
    const index = newData.findIndex((item) => item.id === row.id);
    const item = newData[index];

    const updatedRow = {
      ...item,
      ...row,
    };

    // ✅ VALIDATION
    if (
      updatedRow.entryLevel === undefined ||
      updatedRow.entryLevel === null ||
      updatedRow.entryLevel === "" ||
      updatedRow.stoplossLevel === undefined ||
      updatedRow.stoplossLevel === null ||
      updatedRow.stoplossLevel === ""
    ) {
      message.error("Entry Level and Stoploss Level cannot be empty");
      return; // ❌ Stop API call
    }

    newData.splice(index, 1, updatedRow);
    setData(newData);

    try {
      const payload = {
        id: updatedRow.id,
        instrument: updatedRow.instrumentId,
        strategy_name: updatedRow.strategyName,
        strategy_id: updatedRow.strategy_id,

        underlying_instrument: updatedRow.underlying,

        underlying_instrument_id:
          updatedRow.underlying?.toLowerCase() === "spot"
            ? updatedRow.instrumentId
            : updatedRow.underlyingInstrumentId,

        product_type: updatedRow.productType,
        entry_time: updatedRow.entryTime,

        entry_level: Number(String(updatedRow.entryLevel).replace(/,/g, "-")),
        stoploss_level: Number(
          String(updatedRow.stoplossLevel).replace(/,/g, "-"),
        ),

        enabled: updatedRow.status,
        reset: !updatedRow.status,

        portfolio_leg: [], // keep empty because we only update entry/stoploss
        squareoff_time: updatedRow.entryTime,

        client_multiplier: {
          1: {
            multiplier: 1,
            enabled: true,
          },
        },
      };

      const res = await postManualExecution(payload);

      if (res.data.result) {
        message.success(res.data.result);
        fetchExecutions();
      } else if (res.data.error) {
        message.error(res.data.error);
      }
    } catch (error) {
      console.error("Update failed", error);
      message.error("Failed to update entry/stoploss");
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );
  const handleDragEnd = async (event: any) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = data.findIndex((i) => i.id === active.id);
      const newIndex = data.findIndex((i) => i.id === over?.id);

      const newData = arrayMove(data, oldIndex, newIndex);

      setData(newData);

      // 🔥 CALL API WITH NEW ORDER
      try {
        const movedRow = newData[newIndex];

        const res = await reorderManualExecution(
          movedRow.id,
          newIndex + 1, // order position
        );

        if (res.data?.result) {
          message.success(res.data.result);
          fetchExecutions();
        } else {
          message.error("Failed to reorder");
        }
      } catch (error) {
        console.error("Reorder API failed", error);
        message.error("Failed to reorder");
      }
    }
  };

  const handleTimeFormat = (
    e: React.ChangeEvent<HTMLInputElement>,
    setTimeState: any,
  ) => {
    // Remove everything except numbers
    let value = e.target.value.replace(/[^0-9]/g, "");

    if (value.length >= 3) {
      // Enforce max 23 for hours
      let hours = parseInt(value.slice(0, 2), 10);
      if (hours > 23) hours = 23;

      // Auto-insert the colon
      value = `${hours.toString().padStart(2, "0")}:${value.slice(2)}`;
    }

    // Enforce max 59 for minutes
    if (value.length === 5) {
      let mins = parseInt(value.slice(3, 5), 10);
      if (mins > 59) mins = 59;
      value = `${value.slice(0, 3)}${mins.toString().padStart(2, "0")}`;
    }

    // Limit length to 5 characters (HH:mm)
    setTimeState(value.slice(0, 5));
  };

  const handleStartTimeBlur = (value: string) => {
    // 1. Auto-fill incomplete typing
    let formattedValue = value;
    if (value.length === 1) formattedValue = `0${value}:00`;
    else if (value.length === 2) formattedValue = `${value}:00`;
    else if (value.length === 3) formattedValue = `${value}00`;
    else if (value.length === 4) formattedValue = `${value}0`;

    // 2. Intraday safety check for Start Time
    if (tradeType === "intraday" && formattedValue > "15:27") {
      message.warning("Intraday start time cannot exceed 15:27");
      formattedValue = "15:27";
    }

    setStartTime(formattedValue);
  };

  const handleEndTimeBlur = (value: string) => {
    // If input is cleared
    if (!value) {
      if (tradeType === "intraday") {
        setEndTime("15:27"); // Force default if intraday
      } else {
        setEndTime(""); // Allow blank if positional
      }
      return;
    }

    // 1. Auto-fill incomplete typing
    let formattedValue = value;
    if (value.length === 1) formattedValue = `0${value}:00`;
    else if (value.length === 2) formattedValue = `${value}:00`;
    else if (value.length === 3) formattedValue = `${value}00`;
    else if (value.length === 4) formattedValue = `${value}0`;

    // 2. Strict Validations based on Trade Type
    if (tradeType === "intraday") {
      if (formattedValue > "15:27") {
        message.warning("Intraday Squareoff time cannot exceed 15:27");
        formattedValue = "15:27";
      }
      if (formattedValue < startTime) {
        message.error("Squareoff time cannot be less than Start time");
        formattedValue = startTime; // Revert to match start time
      }
    } else if (tradeType === "positional") {
      // Positional boundaries: Between 09:15 and 15:27
      if (formattedValue < "09:15") {
        message.warning("Squareoff time cannot be earlier than 09:15");
        formattedValue = "15:27";
      } else if (formattedValue > "15:27") {
        message.warning("Squareoff time cannot exceed 15:27");
        formattedValue = "15:27";
      }
    }

    setEndTime(formattedValue);
  };

  const openClientModal = async (id: number) => {
    try {
      setExecutionId(id);
      setClientModalVisible(true);

      const [clientRes, executionRes, multiplierRes] = await Promise.all([
        getEnabledClientList(),
        getManualExecutionByPKId(id),
        getClientMultiplierList(id),
      ]);

      const clients = clientRes.data.result || [];
      const multiplierList = multiplierRes.data.result || [];

      const mapped = clients.map((client: any) => {
        const multi = multiplierList.find((m: any) => m.id === client.id);

        const execution = executionRes.data.result?.[0];

        // store execution object
        setExecutionData(execution);

        return {
          key: client.id,
          client_id: client.id,
          name: client.name,
          broker: client.broker,
          multiplier: multi?.client_multiplier,
          enabled: multi?.client_enabled || false,
        };
      });

      setClientData(mapped);
    } catch (err) {
      console.error("Client modal load failed", err);
    }
  };

  const updateClientMultiplier = async (
    clientId: number,
    value: number,
    enabled: boolean,
  ) => {
    try {
      const updatedData = clientData.map((c) =>
        c.client_id === clientId ? { ...c, multiplier: value } : c,
      );

      setClientData(updatedData);

      const clientMultiplier: any = {};

      updatedData.forEach((client) => {
        if (client.multiplier !== undefined && client.multiplier !== null) {
          clientMultiplier[client.client_id] = {
            multiplier: client.multiplier,
            enabled: client.enabled,
          };
        }
      });

      const payload = {
        id: executionId,
        client_multiplier: clientMultiplier,
      };

      const res = await insertUpdateClientMultiplier(payload);

      if (res.data.result?.[0]) {
        message.success(res.data.result[0]);
      }
    } catch (error) {
      console.error("Multiplier update failed", error);
    }
  };

  const handleMultiplierChange = async (id: number, value: number) => {
    const client = clientData.find((c) => c.client_id === id);

    const updated = clientData.map((c) =>
      c.client_id === id ? { ...c, multiplier: value } : c,
    );

    setClientData(updated);

    if (client) {
      await updateClientMultiplier(id, value, client.enabled);
    }
  };
  const handleApplyClientMultiplier = async () => {
    try {
      const clientMultiplier: any = {};

      clientData.forEach((client) => {
        if (client.enabled) {
          clientMultiplier[client.client_id] = {
            multiplier: client.multiplier,
            enabled: client.enabled,
          };
        }
      });

      const payload = {
        id: executionId,
        client_multiplier: clientMultiplier,
      };

      const res = await insertUpdateClientMultiplier(payload);

      if (res.data.result?.[0]) {
        message.success(res.data.result[0]);
      }

      console.log(executionData);

      // 2️⃣ Call postManualExecution with stored data
      if (executionData) {
        const executionPayload = {
          id: executionData.id,
          strategy_name: executionData.strategy_name,
          instrument: executionData.instrument,
          product_type: executionData.product_type,
          entry_time: executionData.entry_time,
          underlying_instrument: executionData.underlying_instrument,
          underlying_instrument_id: executionData.underlying_instrument_id,
          strategy_id: executionData.strategy_id,
          entry_level: executionData.entry_level,
          stoploss_level: executionData.stoploss_level,
          enabled: executionData.enabled,
          reset: !executionData.enabled,
        };

        const res = await postManualExecution(executionPayload);
        if (res.data.result) {
          message.success(res.data.result);
        }
      }

      setClientModalVisible(false);
    } catch (error) {
      console.error("Apply client multiplier failed", error);
    }
  };

  const clientColumns = [
    {
      title: (
        <Checkbox
          checked={clientData.length > 0 && clientData.every((c) => c.enabled)}
          indeterminate={
            clientData.some((c) => c.enabled) &&
            !clientData.every((c) => c.enabled)
          }
          onChange={(e) => {
            const checked = e.target.checked;

            const updated = clientData.map((c) => ({
              ...c,
              enabled: checked,
            }));

            setClientData(updated);
          }}
        />
      ),
      dataIndex: "enabled",
      width: 40,
      render: (val: boolean, record: any) => (
        <Checkbox
          checked={val}
          onChange={(e) => {
            const updated = clientData.map((c) =>
              c.client_id === record.client_id
                ? { ...c, enabled: e.target.checked }
                : c,
            );
            setClientData(updated);
          }}
        />
      ),
    },
    {
      title: "Client ID",
      dataIndex: "client_id",
    },
    {
      title: "Client Name",
      dataIndex: "name",
    },
    {
      title: "Broker",
      dataIndex: "broker",
    },
    {
      title: "Multiplier",
      dataIndex: "multiplier",
      render: (value: number, record: any) => {
        const showInput =
          clientModalId === record.client_id ||
          value === 0 ||
          value === undefined ||
          value === null;

        if (showInput) {
          return (
            <InputNumber
              min={1}
              autoFocus
              value={value || undefined}
              onPressEnter={(e) => {
                const val = Number((e.target as HTMLInputElement).value);
                handleMultiplierChange(record.client_id, val);
                setClientModalId(null);
              }}
              // onBlur={(e) => {
              //   const val = Number((e.target as HTMLInputElement).value);
              //   handleMultiplierChange(record.client_id, val);
              //   setClientModalId(null);
              // }}
            />
          );
        }

        return (
          <div
            onDoubleClick={() => setClientModalId(record.client_id)}
            className="cursor-pointer"
          >
            {value}x
          </div>
        );
      },
    },
  ];
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
                resetForm();
                setIsAdding(true);
                fetchTagOptions();
              }}
            />
          )}
        </div>

        <div className="flex-1 p-1 overflow-auto">
          {isAdding ? (
            <div className="p-2 bg-white">
              <Row gutter={[8, 12]}>
                {/* Strategy Name */}
                <Col span={4}>
                  <div className="field-container">
                    <span className="field-label">Strategy Name</span>
                    <Input
                      placeholder="Enter Name"
                      className="text-[11px]"
                      value={strategyName}
                      onChange={(e) => setStrategyName(e.target.value)}
                    />
                  </div>
                </Col>

                {/* Tag */}
                <Col span={4}>
                  <div className="field-container">
                    <span className="field-label">Tag</span>
                    <Select
                      placeholder="Select Tag"
                      className="w-full text-[11px]"
                      value={selectedTag || null}
                      options={tagOptions}
                      onChange={(val) => setSelectedTag(val)}
                    />
                  </div>
                </Col>

                {/* Stock Name */}
                <Col span={4}>
                  <div className="field-container">
                    <span className="field-label">Stock Name</span>
                    <Select
                      showSearch
                      placeholder="Search..."
                      className="w-full text-[11px]"
                      filterOption={false}
                      value={selectedInstrument}
                      onSelect={handleInstrumentSelect}
                      onSearch={handleStockSearch}
                      options={stockOptions}
                    />
                  </div>
                </Col>

                {/* Underlying */}
                <Col span={4}>
                  <div className="field-container">
                    <span className="field-label">Underlying</span>
                    <Select
                      className="w-full text-[11px]"
                      options={underlyingOptions}
                      value={selectedUnderlying}
                      onChange={handleUnderlyingChange}
                    />
                  </div>
                </Col>

                {/* Expiry */}
                <Col span={4}>
                  <div className="field-container">
                    <span className="field-label">Expiry</span>
                    <Select
                      className="w-full text-[11px]"
                      options={expiryOptions}
                      disabled={selectedUnderlying !== "future"}
                      value={selectedExpiry}
                      onChange={async (val) => {
                        setSelectedExpiry(val);
                        if (val && baseInstrumentId)
                          await fetchFutureInstrument(baseInstrumentId, val);
                      }}
                    />
                  </div>
                </Col>

                {/* Trade Type Button (Keep as is for high visibility) */}
                <Col span={4} className="flex items-end pb-[2px]">
                  <Button
                    onClick={toggleTradeType}
                    className={`w-full h-7 text-[11px] font-bold rounded ${
                      tradeType === "intraday"
                        ? "bg-blue-600 text-white"
                        : "bg-yellow-400 text-black"
                    }`}
                  >
                    {tradeType === "intraday" ? "Intraday" : "Positional"}
                  </Button>
                </Col>

                {/* Entry Level */}
                <Col span={4}>
                  <div className="field-container">
                    <span className="field-label">Entry Level</span>
                    <InputNumber
                      className="w-full text-[11px]"
                      min={0.01}
                      step={0.01}
                      controls={false}
                      value={entryLevel}
                      onKeyDown={handleNumberKeyDown}
                      onChange={(val) => setEntryLevel(val)}
                    />
                  </div>
                </Col>

                {/* Stoploss Level */}
                <Col span={4}>
                  <div className="field-container">
                    <span className="field-label">Stoploss Level</span>
                    <InputNumber
                      className="w-full text-[11px]"
                      min={0.01}
                      step={0.01}
                      controls={false}
                      value={stoplossLevel}
                      onChange={(val) => setStoplossLevel(val)}
                      onKeyDown={handleNumberKeyDown}
                    />
                  </div>
                </Col>

                {/* Start Time */}
                {/* Start Time */}
                <Col span={4}>
                  <div className="field-container">
                    <span className="field-label">Start Time</span>
                    <Input
                      placeholder="HH:mm"
                      className="text-[11px]"
                      style={{ height: "28px", paddingRight: "8px" }}
                      value={startTime}
                      onChange={(e) => handleTimeFormat(e, setStartTime)}
                      onBlur={(e) => handleStartTimeBlur(e.target.value)}
                    />
                  </div>
                </Col>

                {/* Squareoff Time */}
                {/* Squareoff Time */}
                {/* Squareoff Time */}
                {/* Squareoff Time */}
                <Col span={4}>
                  <div className="field-container">
                    <span className="field-label">Squareoff Time</span>
                    <Input
                      placeholder="HH:mm"
                      className="text-[11px]"
                      style={{ height: "28px", paddingRight: "8px" }}
                      value={endTime}
                      onChange={(e) => handleTimeFormat(e, setEndTime)}
                      onBlur={(e) => handleEndTimeBlur(e.target.value)}
                    />
                  </div>
                </Col>

                {/* Add Leg Button */}
                <Col span={4} className="flex items-end pb-[2px]">
                  <Button
                    onClick={handleAddLeg}
                    disabled={
                      !strategyName ||
                      !selectedTag ||
                      !selectedInstrument ||
                      !entryLevel
                    }
                    className="w-full h-7 text-[11px] bg-emerald-700 text-white hover:bg-emerald-800 font-bold"
                  >
                    Add Leg +
                  </Button>
                </Col>

                {/* Enabled Toggle */}
                <Col span={4} className="flex items-end justify-center pb-1">
                  <div className="flex flex-col items-center">
                    <Switch
                      size="small"
                      checked={enabled}
                      onChange={(checked) => setEnabled(checked)}
                    />
                    <Text className="text-[9px] text-gray-500 font-bold uppercase mt-1">
                      Enabled
                    </Text>
                  </div>
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
                                            : selectedUnderlying === "future"
                                              ? Number(
                                                  instrumentMeta?.future_lotsize,
                                                )
                                              : Number(
                                                  instrumentMeta?.option_lotsize,
                                                ),
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
                          className="w-full bg-slate-50 rounded text-[13px] hover:bg-slate-100 transition-colors py-1"
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
                          className="w-full bg-slate-50 rounded text-[13px] font-semibold text-blue-600 hover:bg-slate-100 transition-colors py-1"
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
                  onClick={() => {
                    resetForm();
                    setIsAdding(false);
                    setIsEditMode(false);
                    setEditingId(null);
                  }}
                >
                  Back
                </Button>
              </div>
            </div>
          ) : (
            <Spin spinning={loading}>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={data.map((i) => i.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <Table
                    rowKey="id"
                    components={{
                      body: {
                        row: CombinedRow,
                        cell: EditableCell,
                      },
                    }}
                    size="small"
                    columns={mergedColumns}
                    dataSource={data}
                    pagination={false}
                    sticky
                    rowClassName={(record) => record.rowColor || ""}
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
                </SortableContext>
              </DndContext>
            </Spin>
          )}
        </div>

        <Modal
          title="Client Multiplier"
          open={clientModalVisible}
          onCancel={() => setClientModalVisible(false)}
          footer={null}
          width={700}
        >
          <Table
            columns={clientColumns}
            dataSource={clientData}
            pagination={false}
            rowKey="client_id"
          />

          <div className="flex justify-center gap-3 mt-5">
            <Button type="primary" onClick={handleApplyClientMultiplier}>
              Apply
            </Button>
            <Button onClick={() => setClientModalVisible(false)}>Cancel</Button>
          </div>
        </Modal>
      </Card>

      <style>
        {`
        .manual-execution-table .ant-input-number-input {
  font-size: 10px !important;
  font-weight: 400;
  height: 18px;
}

.manual-execution-table .ant-input-number {
  height: 22px !important;
}

.manual-execution-table .ant-form-item {
  margin-bottom: 0 !important;
}
          .row-red td { background-color: #FFDEDE !important; }
          .row-green td { background-color: #c9e9cb !important; }
          .row-yellow td { background-color: #FFF8BA !important; }
          .row-white td { background-color: #ffffff !important; }
        .manual-execution-table .ant-table-thead > tr > th {

          font-size: 10px;
          font-weight: 600;
          padding: 4px 4px;
        }
        .manual-execution-table .ant-table-tbody > tr > td {
          padding: 3px 4px !important;
          font-size: 10px;
          white-space: nowrap;
        }

        .manual-execution-table .ant-table-body::-webkit-scrollbar {
          width: 3px; height: 3px;
        }
        .manual-execution-table .ant-table-body::-webkit-scrollbar-thumb {

          border-radius: 3px;
        }

        /* Container for the labeled field */
.field-container {
  position: relative;
  margin-top: 8px; /* Space for the label to sit on top */
}

/* The Label sitting on the border */
.field-label {
  position: absolute;
  top: -8px; /* Pulls it up to sit on the border */
  left: 10px;
  background-color: white; /* Matches card background to hide border behind text */
  padding: 0 4px;
  font-size: 10px;
  color: #666;
  z-index: 1;
  pointer-events: none;
  font-weight: 500;
  white-space: nowrap;
}

/* Adjusting Ant Design inputs to fit the style */
.field-container .ant-input,
.field-container .ant-select-selector,
.field-container .ant-input-number {
  border-color: #d9d9d9 !important;
  border-radius: 4px !important;
  height: 28px !important; /* Slightly taller for better label alignment */
}

/* Specialized styling for HTML time input to match Ant Design */
.custom-time-input {
  width: 100%;
  height: 28px;
  font-size: 11px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  padding: 0 8px;
  outline: none;
}
.custom-time-input:hover { border-color: #4096ff; }
.custom-time-input:focus { border-color: #1677ff; box-shadow: 0 0 0 2px rgba(5, 145, 255, 0.1); }
      `}
      </style>
    </div>
  );
};

export default ManualExecution;
