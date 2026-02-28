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

// ================================
// Add / Update User
// ================================
export const addUpdateUser = (payload: {
  id: number;
  username: string;
  full_name: string;
  email: string;
  enabled: boolean;
  user_role: string;
  user_clients: number[];
  user_client_strategy: Record<string, unknown>;
  hashed_password: string;
}) => {
  return API.post("/add_update_user_list", payload);
};

// ================================
// Reset User Password
// ================================
interface ResetUserPassword {
  id: number;
  email: string;
}

export const resetUserPasswordApi = (data: ResetUserPassword) => {
  const params = new URLSearchParams();

  params.append("id", String(data.id));
  params.append("email", data.email);

  return API.post(`/reset_user_password?${params.toString()}`);
};

// ================================
// Get Strategy By Id
// ================================
export const getStrategyByClientId = (clientId: number) => {
  return API.get(`/get_strategy_by_client?client_id=${clientId}`);
};

// ================================
// Fetch Holdings
// ================================

export const FetchStrategyList = () => {
  return API.get("/fetch_strategy_list");
};

// ================================
// Fetch User By ID
// ================================
export const getUserById = (userId: number) => {
  return API.get(`/get_user_list_by_id?user_id=${userId}`);
};
