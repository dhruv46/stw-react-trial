import API from "../api";

export const getTrueDataApi = () => {
  return API.get("/fetch_truedata_api_list");
};

/* ================= ADD / UPDATE TRUE DATA ================= */

export const postTrueDataApi = (payload: {
  id: number;
  user: string;
  user_id: string;
  password: string;
  type: string;
  minute: boolean;
  tick: boolean;
  url: string;
  port: number;
  is_enabled: boolean;
}) => {
  return API.post("/post_truedata_api", payload);
};

/* ================= FETCH TRUE DATA ================= */

export const getTrueDataApiById = (id: number) => {
  return API.get(`/get_truedata_api?api_id=${id}`);
};

/* ================= DELETE TRUE DATA ================= */

export const deleteTrueDataApi = (id: number) => {
  return API.get(`/delete_truedata_api?api_id=${id}`);
};
