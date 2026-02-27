import API from "../api";

// ================================
// Fetch Holdings
// ================================

export const getUserList = () => {
  return API.get("/fetch_user_list");
};

// ================================
// Fetch Enabled Clients
// ================================

export const getEnabledClientList = () => {
  return API.get("/fetch_enabled_clients");
};
