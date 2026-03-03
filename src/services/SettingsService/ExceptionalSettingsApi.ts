import API from "../api";

// ================================
// Fetch Exceptional Working Days List By Year
// ================================

export const fetchExceptionalWorkingDaysList = (year: number) => {
  return API.get(`/fetch_exceptional_working_list?year=${year}`);
};

// ================================
// Add / Post Holiday
// ================================
interface PostExceptionalWorkingPayload {
  id: number;
  working_date: string; // format: DD/MM/YYYY
  working_name: string;
  morning_session: string; // "{NSE, BSE}"
  evening_session: string; // "{NSE, BSE}"
}

export const postExceptionalHolidayApi = (
  payload: PostExceptionalWorkingPayload,
) => {
  return API.post("/post_exceptional_working", payload);
};

// ================================
// Get Exceptional Working Day By ID
// ================================

export const getExceptionalWorkingDayById = (id: number) => {
  return API.get(`/get_exceptional_working?working_id=${id}`);
};

// ================================
// Delete Exceptional Working Day
// ================================

export const deleteExceptionalWorkingDay = (id: number) => {
  return API.get(`/delete_exceptional_working?working_id=${id}`);
};
