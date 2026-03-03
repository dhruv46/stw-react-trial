import API from "./api";

// ==============================
// Fetch Trade Book
// ==============================
export const fetchTradeBookApi = (
  startDate: string,
  endDate: string,
  csv: boolean = false,
  mode: "live" | "demo" = "live",
) => {
  return API.get(
    `/fetch_trade_book?start_date=${startDate}&end_date=${endDate}&csv=${csv}&mode=${mode}`,
  );
};

// ==============================
// Fetch Trade Book
// ==============================
export const fetchEditTradeBookApi = (
  startDate: string,
  endDate: string,
  csv: boolean = false,
) => {
  return API.get(
    `/fetch_missing_field_tradebook?start_date=${startDate}&end_date=${endDate}&csv=${csv}`,
  );
};

// ==============================
// Insert Trade Book CSV
// ==============================
export const insertTradeBookCsvApi = (payload: {
  broker: string;
  client: number;
  acc_name: string;
  data: any[];
}) => {
  return API.post("/insert_tradebook_csv", payload);
};

// ==============================
// Update Trade Book Field (Remarks)
// ==============================
export const updateTradeBookFieldApi = (payload: {
  id: string | number;
  field_name: string;
  field_value: string;
}) => {
  return API.post("/update_missing_field_tradebook", payload);
};
