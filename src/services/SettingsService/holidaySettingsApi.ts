import API from "../api";

// ================================
// Fetch Holiday List By Year
// ================================

export const fetchHolidayList = (year: number) => {
  return API.get(`/fetch_holiday_list?year=${year}`);
};

// ================================
// Add / Post Holiday
// ================================
interface PostHolidayPayload {
  id: number;
  holiday_date: string; // format: DD/MM/YYYY
  holiday_name: string;
  morning_session: string; // "{NSE, BSE}"
  evening_session: string; // "{NSE, BSE}"
}

export const postHolidayApi = (payload: PostHolidayPayload) => {
  return API.post("/post_holiday", payload);
};

// ================================
// Get Holiday By ID
// ================================

export const getHolidayById = (id: number) => {
  return API.get(`/get_holiday?holiday_id=${id}`);
};

// ================================
// Delete Holiday By ID
// ================================

export const deleteHolidayById = (id: number) => {
  return API.get(`/delete_holiday?holiday_id=${id}`);
};
