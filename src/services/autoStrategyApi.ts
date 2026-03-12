import API from "./api";

export const fetchEnabledAutomatedStrategyList = () => {
  return API.get("/fetch_enabled_automated_strategy_list");
};
