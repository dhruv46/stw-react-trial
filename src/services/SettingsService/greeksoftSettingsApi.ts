import API from "../api";

/* ================= FETCH LIST ================= */

export const greeksoftSettingsApi = () => {
  return API.get("/fetch_greeksoft_api_list");
};

/* ================= ADD / UPDATE GREEKSOFT ================= */

export const postGreeksoftApi = (payload: {
  id: number;
  user_name: string;
  user_password: string;
  session_id: string;
  session_password: string;
  session_link: string;
  order_link: string;
  base64: boolean;
  pro: boolean;
  is_enabled: boolean;
  type: string;
}) => {
  return API.post("/post_greeksoft_api", payload);
};

/* ================= DELETE GREEKSOFT ================= */

export const deleteGreeksoftApi = (api_id: number) => {
  return API.get(`/delete_greeksoft_api?api_id=${api_id}`);
};

/* ================= FETCH GREEKSOFT BY ID ================= */

export const greeksoftSettingsByIdApi = (id: number) => {
  return API.get(`/get_greeksoft_api?api_id=${id}`);
};
