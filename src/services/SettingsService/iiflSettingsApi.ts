import API from "../api";

export const iiflSettingsApi = () => {
  return API.get("/fetch_iifl_api_list");
};

/* ================= ADD / UPDATE IIFL ================= */

export const postIiflApi = (payload: {
  id: number;
  user: string;
  key: string;
  secret: string;
  url: string;
  broadcast_mode: string;
  source: string;
  type: string;
  message_code: number[];
  timeframe: number[];
  disable_ssl: boolean;
  is_enabled: boolean;
}) => {
  return API.post("/post_iifl_api", payload);
};

/* ================= FETCH IIFL ================= */

export const getIiflApi = (id: number) => {
  return API.get(`/get_iifl_api?api_id=${id}`);
};

/* ================= DELETE IIFL ================= */
export const deleteIiflApi = (id: number) => {
  return API.get(`/delete_iifl_api?api_id=${id}`);
};
