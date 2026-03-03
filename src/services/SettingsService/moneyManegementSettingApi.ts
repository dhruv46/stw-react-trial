import APi from "../api";

export const fetchMoneyManagementList = () => {
  return APi.get("/fetch_money_management_list");
};

export const fetchClientNameList = () => {
  return APi.get("/fetch_client_name_list");
};

/* ================= ADD MONEY MANAGEMENT ================= */

export const postMoneyManagementApi = (payload: {
  id: number;
  capital_balance: string;
  account_balance: string;
  strategy_id: string;
  client_id: string;
}) => {
  return APi.post("/post_money_management", payload);
};

export const fetchMoneyManagementById = (id: number) => {
  return APi.get(`/get_money_management?money_management_id=${id}`);
};

export const deleteMoneyManagementApi = (id: number) => {
  return APi.get(`/delete_money_management?money_management_id=${id}`);
};
