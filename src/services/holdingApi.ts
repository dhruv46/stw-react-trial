import API from "./api";

// ================================
// Fetch Holdings
// ================================

export const getHoldingApi = () => {
  return API.get("/get_holdings");
};
