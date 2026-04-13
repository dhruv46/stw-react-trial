import API from "./api";

// Replace your current getClosedPositionPnl with this in your API file:
export const getClosedPositionPnl = (
  start_date: string,
  end_date: string,
  strategy_id?: number,
  client_id?: number,
) => {
  let url = `/get_closed_position_pnl?start_date=${start_date}&end_date=${end_date}`;

  // Append strategy_id if a specific strategy is selected (not 0)
  if (strategy_id && strategy_id !== 0) {
    url += `&strategy_id=${strategy_id}`;
  }

  // Append client_id if a specific client is selected (not 0)
  if (client_id && client_id !== 0) {
    url += `&client_id=${client_id}`;
  }

  return API.get(url); // Ensure 'API' matches your axios instance name
};

export const getUserClientsList = () => {
  return API.get("/get_user_clients_list");
};
