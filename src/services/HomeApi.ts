import API from "./api";

// ================================
// Fetch Holdings
// ================================

export const getPositionList = () => {
  return API.get("/fetch_position_list");
};
