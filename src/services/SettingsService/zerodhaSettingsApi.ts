import API from "../api";

/* ================= FETCH ZERODHA LIST ================= */

export const getZerodhaSettingsApi = () => {
  return API.get("/fetch_zerodha_api_list");
};

/* ================= ADD / UPDATE ZERODHA ================= */

export const postZerodhaApi = (payload: {
  id: number;
  user_id: string;
  key: string;
  secret: string;
  password: string;
  totp: string;
  url: string;
  type: string;
  is_enabled: boolean;
}) => {
  return API.post("/post_zerodha_api", payload);
};

/* ================= FETCH ZERODHA BY ID ================= */

export const getZerodhaSettingsApiById = (id: number) => {
  return API.get(`/get_zerodha_api?api_id=${id}`);
};

/* ================= DELETE ZERODHA BY ID ================= */

export const deleteZerodhaSettingsApiById = (id: number) => {
  return API.get(`/delete_zerodha_api?api_id=${id}`);
};
