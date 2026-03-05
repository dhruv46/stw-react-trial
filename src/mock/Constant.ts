export const CONSTANTS = {
  TYPELIST: {
    typeList: [
      {
        id: 1,
        name: "both",
      },
      {
        id: 2,
        name: "order",
      },
      {
        id: 3,
        name: "data",
      },
    ],
  },
  MESSAGE_CODE: {
    message_code: [
      {
        id: 1501,
        name: "Touchline",
      },
      {
        id: 1502,
        name: "Market Data",
      },
      {
        id: 1505,
        name: "Candle Data",
      },
      {
        id: 1507,
        name: "Market Status",
      },
      {
        id: 1510,
        name: "OpenInterest",
      },
      {
        id: 1512,
        name: "LTP",
      },
      {
        id: 1105,
        name: "Instrument Charge",
      },
    ],
  },
  CLINET_DATA_MODE: {
    clientDataMode: [
      {
        id: 1,
        name: "live",
      },
      {
        id: 2,
        name: "simulation",
      },
    ],
  },
  CLINET_DATA_BROKER: {
    clientDataBroker: [
      {
        id: 1,
        name: "greeksoft",
      },
      {
        id: 2,
        name: "iifl",
      },
      {
        id: 3,
        name: "truedata",
      },
      {
        id: 4,
        name: "zerodha",
      },
      {
        id: 5,
        name: "master-trust",
      },
    ],
  },
  CONTRACT_NOTE_TYPE: {
    contractNoteType: [
      {
        id: 1,
        name: "equity",
      },
      {
        id: 2,
        name: "F&O",
      },
    ],
  },
  NOTIFICATION_STATUS: {
    SUCCESS: {
      id: 1,
      name: "Success",
      type: "success" as "success",
    },
    FAILED: {
      id: 2,
      name: "Failed",
      type: "failed" as "failed",
    },
  },
  POSITION_TYPE: {
    SCALLING_SQUARE_OFF_BY_STRATEGY_ID: {
      SCALE_UP_BY_STRATEGY_ID: "scale_in_strategy_id",
      SCALE_DOWN_BY_STRATEGY_ID: "scale_out_strategy_id",
      SQUARE_OFF_STRATEGY_ID: "square_off_strategy_id",
      SCALE_UP_MESSAGE:
        "Are you sure you want to <b>Scale In</b> this position?",
      SCALE_DOWN_MESSAGE:
        "Are you sure you want to <b>Scale Out</b> this position?",
    },
    SCALLING_SQUARE_OFF_BY_CLIENT_ID: {
      SCALE_UP_BY_CLIENT_ID: "scale_in_client_id",
      SCALE_DOWN_BY_CLIENT_ID: "scale_out_client_id",
      SQUARE_OFF_CLIENT_ID: "square_off_client_id",
      SCALE_UP_MESSAGE:
        "Are you sure you want to <b>Scale In</b> this position?",
      SCALE_DOWN_MESSAGE:
        "Are you sure you want to <b>Scale Out</b> this position?",
    },
  },
  MANUAL_EXECUTION: {
    EXCHANGE_TYPE: [
      {
        id: 1,
        name: "NSE",
      },
      {
        id: 2,
        name: "BSE",
      },
    ],
    SEGMENT_TYPE: [
      {
        id: 1,
        name: "INDEX",
      },
      {
        id: 2,
        name: "EQUITY",
      },
    ],
    ORDER_TYPE: [
      {
        id: 1,
        name: "NRML",
      },
      {
        id: 2,
        name: "MIS",
      },
    ],
    EXECUTION_TECHNIQUE: [
      {
        id: 1,
        name: "Synthetic",
      },
      {
        id: 2,
        name: "Manual Leg",
      },
      {
        id: 3,
        name: "Multi Leg",
      },
    ],
  },
  OPTION_TYPE: [
    {
      id: 1,
      name: "Both",
    },
    {
      id: 2,
      name: "CE",
    },
    {
      id: 3,
      name: "PE",
    },
  ],
  BROKRAGE_CHARGES: [
    { id: 1, code: "EQ_DELIVERY", name: "EQ Delivery" },
    { id: 2, code: "EQ_INTRADAY", name: "EQ Intraday" },
    { id: 3, code: "FUTURE", name: "Future" },
    { id: 4, code: "OPTION", name: "Option" },
  ],
};
