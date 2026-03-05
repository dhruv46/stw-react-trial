import API from "../api";

interface FetchPNLParams {
  start_date: string;
  end_date: string;
  csv?: boolean;
  page_size?: number;
  page_num?: number;
}

export const fetchAllPnlStatement = async (params: FetchPNLParams) => {
  try {
    const response = await API.get("/fetch_all_pnl_statement", {
      params: {
        start_date: params.start_date,
        end_date: params.end_date,
        csv: params.csv ?? false,
        page_size: params.page_size ?? 50,
        page_num: params.page_num ?? 1,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching PNL statement:", error);
    throw error;
  }
};

// ===============================
// Download CSV
// ===============================
export const downloadPnlStatementCsv = async (params: FetchPNLParams) => {
  const res = await API.get("/fetch_all_pnl_statement", {
    params: {
      ...params,
      csv: true,
    },
    responseType: "blob",
  });

  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement("a");

  link.href = url;
  link.setAttribute("download", "pnl_statement.csv");

  document.body.appendChild(link);
  link.click();
  link.remove();
};
