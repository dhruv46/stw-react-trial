import API from "./api";

export const getManualExecutions = () => {
  return API.get("/get_manual_execution_list");
};

// ✅ Search Instrument API
export const searchInstrumentForIndexEq = (query: string) => {
  return API.get(`/search_instrument_for_index_eq?q=${query}`);
};

// ✅ Search Instrument API
export const getSpotFutureUnderlying = (query: string) => {
  return API.get(`/get_spot_future_availability?instrument=${query}`);
};

export const getInstrumentExpiryDate = (
  instrument: string,
  underlying_type: string,
) => {
  return API.get(
    `/get_instrument_expiry_date?instrument=${instrument}&underlying_type=${underlying_type}`,
  );
};

export const getInstrumentStrikePriceList = (
  instrument: number,
  instrument_type: string,
  expiry_date: string,
) => {
  return API.get("/fetch_instrument_strike_price_list", {
    params: {
      instrument,
      instrument_type,
      expiry_date,
    },
  });
};

export const getInstrumentSubscription = (
  instrument_code: number,
  price: number,
  expiry_date: string,
  option_type: string,
  atm_shift: string = "ATM",
) => {
  return API.get("/get_instrument_subscription", {
    params: {
      instrument_code,
      price,
      expiry_date,
      option_type,
      atm_shift,
    },
  });
};

// ✅ NEW: Future Instrument API
export const getFutureInstrument = (
  instrument: number,
  expiry_date: string,
) => {
  return API.get("/get_future_instrument", {
    params: {
      instrument,
      expiry_date,
    },
  });
};

// ✅ Create Manual Execution
export const postManualExecution = (payload: any) => {
  return API.post("/post_manual_execution", payload);
};

export const getManualExecutionsById = (id: number) => {
  return API.get(`/get_manual_execution?manual_execution_id=${id}`);
};

export const getManualStrategyByClientId = (id: number) => {
  return API.get(`/get_manual_strategy_by_client?client_id=${id}`);
};
