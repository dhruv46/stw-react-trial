import API from "../api";

/* ================= FETCH LIST ================= */

export const getMasterTrustSettingsApi = async () => {
  return await API.get("/fetch_master_trust_api_list");
};

/* ================= ADD MASTER TRUST ================= */

export const postMasterTrustApi = async (payload: {
  id: number;
  user: string;
  password: string;
  factor2: string;
  vendor_code: string;
  app_key: string;
  imei: string;
  type: string;
  host_url: string;
  websocket_url: string;
  is_enabled: boolean;
}) => {
  return await API.post("/post_master_trust_api", payload);
};

/* ================= GET MASTER TRUST BY ID ================= */

export const getMasterTrustApiById = async (id: number) => {
  return await API.get(`/get_master_trust_api?api_id=${id}`);
};

/* ================= DELETE MASTER TRUST ================= */

export const deleteMasterTrustApi = async (id: number) => {
  return await API.get(`/delete_master_trust_api?api_id=${id}`);
};