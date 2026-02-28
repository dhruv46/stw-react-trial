import API from "./api";

// ================================
// Signal Report Payload
// ================================
interface SignalReportPayload {
  strategy_id: number;
  start_date: string;
  end_date: string;
}

// ================================
// Get Signal Report API
// ================================
export const getSignalReportApi = (params: SignalReportPayload) => {
  return API.get("/signal_report", {
    params,
  });
};
