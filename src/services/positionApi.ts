import API from "./api";

// ================================
// Fetch Position (By Client / Strategy)
// ================================

interface FetchPositionPayload {
  position_by: "client" | "strategy";
}

export const getPositionApi = (data: FetchPositionPayload) => {
  const params = new URLSearchParams();

  params.append("position_by", data.position_by);

  return API.get(`/fetch_position?${params.toString()}`);
};
