import API from "./api";

// Fetch Watchlist
// pageNo defaults to 1
export const getWatchlistApi = (pageNo: number = 1) => {
  return API.get(`/get_user_watch_list?page_no=${pageNo}`);
};
