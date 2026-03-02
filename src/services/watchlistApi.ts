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

// ==============================
// Add Instrument To Watchlist
// ==============================
export const addWatchlistApi = (instrument: string, pageNo: number = 1) => {
  return API.get(`/add_watch_list?instrument=${instrument}&page_no=${pageNo}`);
};

// ==============================
// ✅ Delete Instrument From Watchlist
// ==============================
export const deleteWatchlistApi = (instrument: string) => {
  return API.get(`/delete_watch_list?instrument=${instrument}`);
};
