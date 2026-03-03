import API from "../api";

export const getClientMasterListApi = () => {
  return API.get("/fetch_client_master_list");
};

export const fetchIIFLlistApi = () => {
  return API.get("/fetch_iifl_api_list?is_enabled=True");
};

export const fetchGreeksoftApiListApi = () => {
  return API.get("/fetch_greeksoft_api_list?is_enabled=True");
};

export const fetchTruedataApiList = () => {
  return API.get("/fetch_truedata_api_list?is_enabled=True");
};

export const fetchZerodhaApiList = () => {
  return API.get("/fetch_zerodha_api_list?is_enabled=True");
};

export const fetchMastertrustApiList = () => {
  return API.get("/fetch_master_trust_api_list?is_enabled=True");
};

// ✅ Correct POST API
export const addClientDataApi = (data: any) => {
  return API.post("/post_client_data", data);
};

export const deleteClientDataApi = (id: number) => {
  return API.get(`/delete_client_master?api_id=${id}`);
};
