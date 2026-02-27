// import React, { useEffect, useState } from "react";
// import { getPositionList } from "../services/HomeApi";

// /* --- Helper to get Cookie --- */
// const getCookie = (name: string): string => {
//   const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
//   // console.log("Cookie Match for", name, ":", match); // Debug log

//   if (match) {
//     return decodeURIComponent(match[2]);
//   }

//   return "User";
// };
// export default function Home() {
//   const [positions, setPositions] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const fullName = getCookie("full_name");

//   useEffect(() => {
//     getPositionList()
//       .then((res) => {
//         // console.log("Position List:", res.data); // Debug log
//         // Based on your JSON structure, data is in res.result
//         setPositions(res.data?.result || []);
//       })
//       .catch((err) => console.error("Error fetching positions:", err))
//       .finally(() => setLoading(false));
//   }, []);

//   if (loading)
//     return (
//       <div className="p-6 text-center text-gray-500">Loading positions...</div>
//     );

//   return (
//     <div className="bg-gray-50 min-h-screen p-6 font-sans">
//       {/* Greeting Header */}
//       <div className="flex items-center gap-2 mb-6">
//         <h1 className="text-2xl font-normal text-gray-800">
//           Hi, <span className="font-medium">{fullName}</span>
//         </h1>
//       </div>

//       {/* Table Container */}
//       <div className="bg-white rounded shadow-sm overflow-hidden border border-gray-100">
//         <div className="overflow-x-auto">
//           <table className="w-full text-left border-collapse">
//             <thead className="bg-gray-50 border-b border-gray-200">
//               <tr>
//                 <th className="px-4 py-3 text-sm font-bold text-black">
//                   Strategy
//                 </th>
//                 <th className="px-4 py-3 text-sm font-bold text-black">
//                   Display Name
//                 </th>
//                 <th className="px-4 py-3 text-sm font-bold text-black">
//                   Created Datetime
//                 </th>
//                 <th className="px-4 py-3 text-sm font-bold text-black text-right">
//                   Qty
//                 </th>
//                 <th className="px-4 py-3 text-sm font-bold text-black text-right">
//                   Ltp
//                 </th>
//                 <th className="px-4 py-3 text-sm font-bold text-black text-right">
//                   Buy Price
//                 </th>
//                 <th className="px-4 py-3 text-sm font-bold text-black text-right">
//                   Sell Price
//                 </th>
//                 <th className="px-4 py-3 text-sm font-bold text-black text-right">
//                   P&L
//                 </th>
//                 <th className="px-4 py-3 text-sm font-bold text-black text-right">
//                   Chg(%)
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-100">
//               {positions.map((item) => {
//                 // Calculate P&L: (LTP - BuyPrice) * Qty
//                 const pnlValue =
//                   (item.ltp - item.last_trade_price) * item.quantity;
//                 const pnlColor =
//                   pnlValue >= 0 ? "text-green-500" : "text-red-500";
//                 const chgColor =
//                   item.PercentChange >= 0 ? "text-green-500" : "text-red-500";

//                 return (
//                   <tr
//                     key={item.id}
//                     className="hover:bg-gray-50 transition-colors"
//                   >
//                     <td className="px-4 py-4 text-sm text-gray-700">
//                       {item.name}
//                     </td>
//                     <td className="px-4 py-4 text-sm text-gray-700">
//                       {item.DisplayName}
//                     </td>
//                     <td className="px-4 py-4 text-sm text-gray-600 font-light">
//                       {item.create_datetime}
//                     </td>
//                     <td className="px-4 py-4 text-sm text-gray-700 text-right">
//                       {item.quantity}
//                     </td>
//                     <td className="px-4 py-4 text-sm text-gray-700 text-right font-medium">
//                       {item.ltp.toFixed(2)}
//                     </td>
//                     <td className="px-4 py-4 text-sm text-gray-700 text-right">
//                       {item.last_trade_price.toFixed(2)}
//                     </td>
//                     <td className="px-4 py-4 text-sm text-gray-700 text-right">
//                       {item.sell_value.toFixed(2)}
//                     </td>
//                     <td
//                       className={`px-4 py-4 text-sm text-right font-medium ${pnlColor}`}
//                     >
//                       {pnlValue.toFixed(2)}
//                     </td>
//                     <td
//                       className={`px-4 py-4 text-sm text-right font-medium ${chgColor}`}
//                     >
//                       {item.PercentChange.toFixed(2)}%
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }

import React, { useEffect, useMemo, useState } from "react";
import { Card, Table, Typography, Spin } from "antd";
import type { ColumnsType } from "antd/es/table";
import { getPositionList } from "../services/HomeApi";

const { Text } = Typography;

/* ================= Cookie Helper ================= */

const getCookie = (name: string): string => {
  const cookies = document.cookie.split(";");

  for (let cookie of cookies) {
    const [key, value] = cookie.trim().split("=");

    if (key === name) {
      return decodeURIComponent(value);
    }
  }

  return "User";
};

/* ================= Types ================= */

interface PositionRow {
  id: number;
  name: string;
  DisplayName: string;
  create_datetime: string;
  quantity: number;
  ltp: number;
  last_trade_price: number;
  sell_value: number;
  PercentChange: number;
}

/* ================= Component ================= */

export default function Home() {
  const [positions, setPositions] = useState<PositionRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fullName = getCookie("full_name");

  /* ================= Fetch ================= */

  useEffect(() => {
    getPositionList()
      .then((res) => {
        setPositions(res.data?.result || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  /* ================= Columns ================= */

  const columns: ColumnsType<PositionRow> = useMemo(
    () => [
      {
        title: "Strategy",
        dataIndex: "name",
        render: (v) => <span className="font-medium text-gray-800">{v}</span>,
      },
      {
        title: "Display",
        dataIndex: "DisplayName",
      },
      {
        title: "Created",
        dataIndex: "create_datetime",
        width: 180,
      },
      {
        title: "Qty",
        dataIndex: "quantity",
        align: "right",
      },
      {
        title: "LTP",
        dataIndex: "ltp",
        align: "right",
        render: (v) => v.toFixed(2),
      },
      {
        title: "Buy",
        dataIndex: "last_trade_price",
        align: "right",
        render: (v) => v.toFixed(2),
      },
      {
        title: "Sell",
        dataIndex: "sell_value",
        align: "right",
        render: (v) => v.toFixed(2),
      },
      {
        title: "P&L",
        align: "right",
        render: (_, row) => {
          const pnl = (row.ltp - row.last_trade_price) * row.quantity;

          return (
            <span className={pnl >= 0 ? "text-green-600" : "text-red-600"}>
              {pnl.toFixed(2)}
            </span>
          );
        },
      },
      {
        title: "Chg %",
        dataIndex: "PercentChange",
        align: "right",
        render: (v) => (
          <span className={v >= 0 ? "text-green-600" : "text-red-600"}>
            {v.toFixed(2)}%
          </span>
        ),
      },
    ],
    [],
  );

  /* ================= Loading ================= */

  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <Spin size="large" />
      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <div className="bg-gray-100 min-h-screen p-3">
      <Card size="small" className="shadow-sm rounded-lg">
        {/* Header */}
        <div className="mb-3">
          <Text className="text-base">
            Hi, <span className="font-semibold">{fullName}</span>
          </Text>
        </div>

        {/* Table */}
        <Table
          rowKey="id"
          columns={columns}
          dataSource={positions}
          pagination={false}
          size="small"
          bordered
          scroll={{ x: "max-content", y: 520 }}
          className="compact-trading-table"
        />
      </Card>
    </div>
  );
}
