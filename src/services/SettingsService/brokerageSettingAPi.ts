import API from "../api";

interface BrokerChargesParams {
  charges_type?: string;
  broker?: string;
  client_id?: string | number;
  start_date: string;
  end_date: string;
}

export const fetchBrokerCharges = async (params: BrokerChargesParams) => {
  const response = await API.get("/fetch_broker_charges", {
    params: {
      charges_type: params.charges_type || "",
      broker: params.broker || "",
      client_id: params.client_id || "",
      start_date: params.start_date,
      end_date: params.end_date,
    },
  });

  return response.data;
};

export const getClientListApi = () => {
  return API.get(`/fetch_client_name_list`);
};

export const getBrokerListApi = () => {
  return API.get(`/fetch_broker_list`);
};

export interface BrokeragePayload {
  id: number;
  charges_type: string;
  client_id: string;
  broker: string;
  start_date: string;
  end_date: string;
  [key: string]: any; // for dynamic buy_/sell_ fields
}
// ======================
// Submit brokerage charges
// ======================
export const postBrokerageChargesApi = (payload: BrokeragePayload) => {
  return API.post("/broker_charges", payload);
};
