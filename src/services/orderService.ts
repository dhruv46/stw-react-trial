import API from "./api";

// Request params interface
interface OrderBookPayload {
  strategy: number | string;
  start_date: string;
  end_date: string;
  client_id: number | string;
  mode?: string;
}

// Fetch Order Book
export const getOrderBookApi = (data: OrderBookPayload) => {
  const params = new URLSearchParams();

  params.append("strategy", String(data.strategy));
  params.append("start_date", data.start_date);
  params.append("end_date", data.end_date);
  params.append("client_id", String(data.client_id));
  params.append("mode", data.mode || "sim");

  return API.get(`/order_book?${params.toString()}`);
};

// ================================
// Fetch Client Name List
// ================================
interface ClientListPayload {
  mode?: string;
}

export const getClientListApi = (data?: ClientListPayload) => {
  const params = new URLSearchParams();

  params.append("mode", data?.mode || "sim");

  return API.get(`/fetch_client_name_list?${params.toString()}`);
};

// ================================
// Fetch Strategy Name List
// ================================
export const getStrategyListApi = () => {
  return API.get(`/fetch_strategy_name_list`);
};
