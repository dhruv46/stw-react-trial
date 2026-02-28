import API from "../api";

// ================================
// Fetch Holiday List By Year
// ================================

export const fetchHolidayList = (year: number) => {
  return API.get(`/fetch_holiday_list?year=${year}`);
};
