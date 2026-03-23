// import { useEffect, useMemo, useState } from "react";
// import { Card, Table, Typography } from "antd";
// import type { ColumnsType } from "antd/es/table";
// import { getPositionList } from "../services/HomeApi";
// import Loader from "../components/Loader";

// const { Text } = Typography;

// /* ================= Cookie Helper ================= */

// const getCookie = (name: string): string => {
//   const cookies = document.cookie.split(";");

//   for (let cookie of cookies) {
//     const [key, value] = cookie.trim().split("=");

//     if (key === name) {
//       return decodeURIComponent(value);
//     }
//   }

//   return "User";
// };

// /* ================= Types ================= */

// interface PositionRow {
//   id: number;
//   name: string;
//   DisplayName: string;
//   create_datetime: string;
//   quantity: number;
//   ltp: number;
//   last_trade_price: number;
//   sell_value: number;
//   PercentChange: number;
// }

// /* ================= Component ================= */

// export default function Home() {
//   const [positions, setPositions] = useState<PositionRow[]>([]);
//   const [loading, setLoading] = useState(true);

//   const fullName = getCookie("full_name");

//   /* ================= Fetch ================= */

//   useEffect(() => {
//     getPositionList()
//       .then((res) => {
//         const result = res.data?.result;
//         setPositions(Array.isArray(result) ? result : []);
//       })
//       .catch((err) => console.error(err))
//       .finally(() => setLoading(false));
//   }, []);
//   const formatNumber = (v: number | null | undefined) => {
//     return (v ?? 0).toFixed(2);
//   };

//   /* ================= Columns ================= */

//   const columns: ColumnsType<PositionRow> = useMemo(
//     () => [
//       {
//         title: "Strategy",
//         dataIndex: "name",
//         render: (v) => <span className="font-medium text-gray-800">{v}</span>,
//       },
//       {
//         title: "Display",
//         dataIndex: "DisplayName",
//       },
//       {
//         title: "Created",
//         dataIndex: "create_datetime",
//         width: 180,
//       },
//       {
//         title: "Qty",
//         dataIndex: "quantity",
//         align: "right",
//       },
//       {
//         title: "LTP",
//         dataIndex: "ltp",
//         align: "right",
//         render: (v) => formatNumber(v),
//       },
//       {
//         title: "Buy",
//         dataIndex: "last_trade_price",
//         align: "right",
//         render: (v) => formatNumber(v),
//       },
//       {
//         title: "Sell",
//         dataIndex: "sell_value",
//         align: "right",
//         render: (v) => formatNumber(v),
//       },
//       {
//         title: "P&L",
//         align: "right",
//         render: (_, row) => {
//           const pnl = (row.ltp - row.last_trade_price) * row.quantity;

//           return (
//             <span className={pnl >= 0 ? "text-green-600" : "text-red-600"}>
//               {formatNumber(pnl)}
//             </span>
//           );
//         },
//       },
//       {
//         title: "Chg %",
//         dataIndex: "PercentChange",
//         align: "right",
//         render: (v) => (
//           <span className={v >= 0 ? "text-green-600" : "text-red-600"}>
//             {formatNumber(v)}%
//           </span>
//         ),
//       },
//     ],
//     [],
//   );

//   /* ================= Loading ================= */

//   if (loading) {
//     return <Loader />;
//   }

//   /* ================= UI ================= */

//   return (
//     <div className="bg-gray-100 max-h-screen p-3">
//       <Card size="small" className="shadow-sm rounded-lg">
//         {/* Header */}
//         <div className="mb-3">
//           <Text className="text-base">
//             Hi, <span className="font-semibold">{fullName}</span>
//           </Text>
//         </div>

//         {/* Table */}
//         <Table
//           rowKey="id"
//           columns={columns}
//           dataSource={positions}
//           pagination={false}
//           size="small"
//           bordered
//           scroll={{ x: "max-content", y: 520 }}
//           className="compact-trading-table"
//         />
//       </Card>
//     </div>
//   );
// }

import { useEffect, useMemo, useRef, useState } from "react";
import { Card, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { getPositionList } from "../services/HomeApi";
import Loader from "../components/Loader";
import socketService from "../services/socketService";
import dayjs from "dayjs";

const { Text } = Typography;

/* ================= Cookie Helper ================= */

const getCookie = (name: string): string => {
  const cookies = document.cookie.split(";");

  for (let cookie of cookies) {
    const [key, value] = cookie.trim().split("=");
    if (key === name) return decodeURIComponent(value);
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
  buy_value: number;
  last_trade_price: number;
  sell_value: number;
  PercentChange: number;
  instrument: number; // ✅ IMPORTANT
}

/* ================= Component ================= */

export default function Home() {
  const [positions, setPositions] = useState<PositionRow[]>([]);
  const [loading, setLoading] = useState(true);

  const subscribedRef = useRef<number[]>([]); // ✅ track subscribed instruments

  const fullName = getCookie("full_name");

  /* ================= Fetch ================= */

  useEffect(() => {
    getPositionList()
      .then((res) => {
        const result = res.data?.result;
        setPositions(Array.isArray(result) ? result : []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  /* ================= Format ================= */

  const formatNumber = (v: number | null | undefined) => {
    return (v ?? 0).toFixed(2);
  };

  /* ================= Socket Subscribe (LIKE YOUR WATCHLIST) ================= */

  useEffect(() => {
    if (!positions.length) return;

    const instruments = positions.map((p) => p.instrument).filter(Boolean);

    const newInstruments = instruments.filter(
      (inst) => !subscribedRef.current.includes(inst),
    );

    if (!newInstruments.length) return;

    newInstruments.forEach((inst) => {
      const topic = `tick_message_${inst}`;

      socketService.subscribe(topic, (body: any) => {
        const inner = JSON.parse(body.data);

        setPositions((prev) =>
          prev.map((p) =>
            p.instrument === inst
              ? {
                  ...p,
                  ltp: inner.Price ?? p.ltp,
                  PercentChange: inner.PercentChange ?? p.PercentChange,
                }
              : p,
          ),
        );
      });
    });

    subscribedRef.current = [...subscribedRef.current, ...newInstruments];
  }, [positions.length]); // 👈 SAME as your watchlist pattern

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
        render: (value: string) => {
          return dayjs(value, "DD-MM-YYYY HH:mm:ss.SSSSSS").format(
            "DD MMM YYYY, HH:mm:ss",
          );
        },
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
        render: (v) => formatNumber(v),
      },
      {
        title: "Buy Price",
        dataIndex: "buy_value",
        align: "right",
        render: (v) => formatNumber(v),
      },
      {
        title: "Sell Price",
        dataIndex: "last_trade_price",
        align: "right",
        render: (v) => formatNumber(v),
      },
      {
        title: "P&L",
        align: "right",
        render: (_, row) => {
          const pnl =
            row.quantity > 0
              ? (row.ltp - row.last_trade_price) * row.quantity
              : (row.last_trade_price - row.ltp) * Math.abs(row.quantity);

          return (
            <span className={pnl >= 0 ? "text-green-600" : "text-red-600"}>
              {formatNumber(pnl)}
            </span>
          );
        },
      },
      {
        title: "Chg %",
        align: "right",
        render: (_, row) => {
          const ltp = row.ltp;

          let percent = 0;

          if (row.buy_value > 0) {
            percent = ((ltp - row.buy_value) / row.buy_value) * 100;
          }

          return (
            <span className={percent >= 0 ? "text-green-600" : "text-red-600"}>
              {formatNumber(percent)}%
            </span>
          );
        },
      },
    ],
    [],
  );

  /* ================= Loading ================= */

  if (loading) return <Loader />;

  /* ================= UI ================= */

  return (
    <div className="bg-gray-100 max-h-screen p-3">
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
