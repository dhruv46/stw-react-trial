import API from "./api";

interface FetchOHLCParams {
  instrument: string;
  timeframe: number;
  page: number;
  page_size?: number;
}

export const fetchOHLCPrice = (params: FetchOHLCParams) => {
  return API.get("/fetch_cohlc_paginate", {
    params,
  });
};
