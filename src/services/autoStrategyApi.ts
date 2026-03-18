import API from "./api";

export const fetchEnabledAutomatedStrategyList = () => {
  return API.get("/fetch_enabled_automated_strategy_list");
};

export const searchInstrumentApi = (q: string, inst_type: string = "EQ") => {
  return API.get("/search_inst", {
    params: {
      q,
      inst_type,
    },
  });
};

export const fetchConditionMap = () => {
  return API.get("/condition_map");
};

// 🔥 NEW API (Strategy Instrument)
export const getStrategyInstrumentApi = (strategyId: number) => {
  return API.get("/getStrategyInstrument", {
    params: {
      strategy_id: strategyId,
    },
  });
};

export const getStrategyTimeframeApi = (strategyId: number) => {
  return API.get("/getStrategyTimeframe", {
    params: {
      strategy_id: strategyId,
    },
  });
};

export const getStrategyIndicatorApi = (strategyId: number) => {
  return API.get("/getStrategyIndicator", {
    params: {
      strategy_id: strategyId,
    },
  });
};
