import API from "./api";

// ==============================
// Fetch Watchlist
// ==============================
export const getWatchlistApi = (pageNo: number = 1) => {
  return API.get(`/get_user_watch_list?page_no=${pageNo}`);
};

// ==============================
// Search Instruments
// ==============================
export const searchInstrumentsApi = (query: string, page: number = 1) => {
  return API.get(
    `/search_instruments_by_all?q=${encodeURIComponent(query)}&page=${page}`,
  );
};
