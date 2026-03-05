// import React, { useEffect, useState } from "react";
// import { Table, Card, Typography, Button, Space, message } from "antd";
// import type { ColumnsType } from "antd/es/table";
// import {
//   PlusOutlined,
//   CheckCircleOutlined,
//   CloseCircleOutlined,
// } from "@ant-design/icons";
// import { useNavigate } from "react-router-dom";
// import { FiEdit2 } from "react-icons/fi";
// import { MdDeleteOutline } from "react-icons/md";
// import Loader from "../../components/Loader";

// import {
//   getTrueDataApi,
//   deleteTrueDataApi,
// } from "../../services/SettingsService/trueDataApi";

// const { Title } = Typography;

// interface TrueDataRow {
//   key: number;
//   id: number;
//   name: string;
//   user_id: string;
//   password: string;
//   type: string;
//   minute: boolean;
//   tick: boolean;
//   url: string;
//   port: number;
//   is_enabled: boolean;
// }

// export default function TrueDataList() {
//   const navigate = useNavigate();

//   const [data, setData] = useState<TrueDataRow[]>([]);
//   const [loading, setLoading] = useState(false);

//   /* ================= FETCH DATA ================= */

//   useEffect(() => {
//     const fetchTrueData = async () => {
//       try {
//         setLoading(true);

//         const res = await getTrueDataApi();

//         const apiData = res?.data?.result ?? [];

//         const mapped = apiData.map((item: any, index: number) => ({
//           key: index,
//           ...item,
//         }));

//         setData(mapped);
//       } catch (error) {
//         console.error("Failed to fetch TrueData list", error);
//         message.error("Failed to fetch data");
//         setData([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchTrueData();
//   }, []);

//   /* ================= TABLE COLUMNS ================= */

//   const columns: ColumnsType<TrueDataRow> = [
//     {
//       title: "ID",
//       dataIndex: "id",
//       align: "center",
//     },
//     {
//       title: "User",
//       dataIndex: "name",
//     },
//     {
//       title: "User ID",
//       dataIndex: "user_id",
//     },
//     {
//       title: "Type",
//       dataIndex: "type",
//       align: "center",
//     },
//     {
//       title: "Minute",
//       dataIndex: "minute",
//       align: "center",
//       render: (val: boolean) => (val ? "true" : "false"),
//     },
//     {
//       title: "Tick",
//       dataIndex: "tick",
//       align: "center",
//       render: (val: boolean) => (val ? "true" : "false"),
//     },
//     {
//       title: "Url",
//       dataIndex: "url",
//       ellipsis: true,
//     },
//     {
//       title: "Port",
//       dataIndex: "port",
//       align: "center",
//     },
//     {
//       title: "Enabled",
//       dataIndex: "is_enabled",
//       align: "center",
//       render: (value: boolean) =>
//         value ? (
//           <span className="text-green-600">
//             <CheckCircleOutlined style={{ fontSize: 18 }} />
//           </span>
//         ) : (
//           <span className="text-red-600">
//             <CloseCircleOutlined style={{ fontSize: 18 }} />
//           </span>
//         ),
//     },
//     {
//       title: "Action",
//       align: "center",
//       render: (_, record) => (
//         <Space size={6}>
//           <Button
//             size="small"
//             type="text"
//             icon={<FiEdit2 size={14} />}
//             onClick={() => navigate(`/edit-truedata/${record.id}`)}
//           />

//           <Button
//             size="small"
//             danger
//             type="text"
//             icon={<MdDeleteOutline size={16} />}
//           />
//         </Space>
//       ),
//     },
//   ];

//   if (loading) {
//     return <Loader />;
//   }

//   return (
//     <div className="h-[calc(100vh-65px)] bg-slate-100 p-3 overflow-hidden">
//       <Card
//         size="small"
//         className="h-full flex flex-col rounded-xl border bg-white shadow-sm"
//         styles={{
//           body: {
//             padding: 0,
//             height: "100%",
//             display: "flex",
//             flexDirection: "column",
//           },
//         }}
//       >
//         {/* HEADER */}

//         <div className="px-4 py-2 border-b bg-white rounded-t-xl">
//           <div className="flex items-center justify-between">
//             <Title level={4} className="!m-0 !font-bold">
//               True Data List
//             </Title>

//             <Button
//               type="primary"
//               icon={<PlusOutlined />}
//               className="bg-blue-600 font-semibold"
//               onClick={() => navigate("/add-true-data")}
//             >
//               Add True Data
//             </Button>
//           </div>
//         </div>

//         {/* TABLE */}

//         <div className="flex-1 p-2 overflow-hidden bg-slate-50">
//           <div className="h-full bg-white rounded-lg border overflow-hidden">
//             <Table
//               size="small"
//               columns={columns}
//               dataSource={data}
//               pagination={false}
//               sticky
//               tableLayout="auto"
//               scroll={{
//                 x: 900,
//                 y: "calc(100vh - 220px)",
//               }}
//               className="holiday-table"
//             />
//           </div>
//         </div>
//       </Card>

//       {/* TABLE STYLE */}

//       <style>
//         {`
// .holiday-table .ant-table {
//   font-size: 11px;
// }

// .holiday-table .ant-table-thead > tr > th {
//   background: #f8fafc !important;
//   font-size: 11px;
//   font-weight: 600;
//   padding: 5px 8px !important;
//   height: 32px;
// }

// .holiday-table .ant-table-tbody > tr > td {
//   padding: 2px 8px !important;
//   height: 28px;
//   font-size: 11px;
// }

// .holiday-table .ant-table-tbody > tr:nth-child(even) {
//   background: #fcfdff;
// }

// .holiday-table .ant-table-tbody > tr:hover > td {
//   background: #eef6ff !important;
// }

// .holiday-table .ant-btn {
//   height: 22px;
//   width: 22px;
//   padding: 0;
//   display: inline-flex;
//   align-items: center;
//   justify-content: center;
// }

// .holiday-table .ant-space {
//   gap: 4px !important;
// }
// `}
//       </style>
//     </div>
//   );
// }

import React, { useEffect, useState } from "react";
import { Table, Card, Typography, Button, Space, message, Modal } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  PlusOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { FiEdit2 } from "react-icons/fi";
import { MdDeleteOutline } from "react-icons/md";
import Loader from "../../components/Loader";

import {
  getTrueDataApi,
  deleteTrueDataApi,
} from "../../services/SettingsService/trueDataApi";

const { Title } = Typography;
const { confirm } = Modal;

interface TrueDataRow {
  key: number;
  id: number;
  user: string;
  user_id: string;
  password: string;
  type: string;
  minute: boolean;
  tick: boolean;
  url: string;
  port: number;
  is_enabled: boolean;
}

export default function TrueDataList() {
  const navigate = useNavigate();

  const [data, setData] = useState<TrueDataRow[]>([]);
  const [loading, setLoading] = useState(false);

  /* ================= FETCH DATA ================= */

  const fetchTrueData = async () => {
    try {
      setLoading(true);

      const res = await getTrueDataApi();
      const apiData = res?.data?.result ?? [];

      const mapped = apiData.map((item: any, index: number) => ({
        key: index,
        ...item,
      }));

      setData(mapped);
    } catch (error) {
      console.error("Failed to fetch TrueData list", error);
      message.error("Failed to fetch data");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrueData();
  }, []);

  /* ================= DELETE ================= */

  const handleDelete = (id: number) => {
    confirm({
      title: "Delete True Data",
      icon: <ExclamationCircleOutlined />,
      content: "Are you sure you want to delete this True Data?",
      okText: "Yes",
      okType: "danger",
      cancelText: "Cancel",

      async onOk() {
        try {
          await deleteTrueDataApi(id);

          message.success("True Data deleted successfully");

          fetchTrueData();
        } catch (error) {
          message.error("Failed to delete True Data");
        }
      },
    });
  };

  /* ================= TABLE COLUMNS ================= */

  const columns: ColumnsType<TrueDataRow> = [
    {
      title: "ID",
      dataIndex: "id",
      align: "center",
    },
    {
      title: "User",
      dataIndex: "user",
    },
    {
      title: "User ID",
      dataIndex: "user_id",
    },
    {
      title: "Type",
      dataIndex: "type",
      align: "center",
    },
    {
      title: "Minute",
      dataIndex: "minute",
      align: "center",
      render: (val: boolean) => (val ? "true" : "false"),
    },
    {
      title: "Tick",
      dataIndex: "tick",
      align: "center",
      render: (val: boolean) => (val ? "true" : "false"),
    },
    {
      title: "Url",
      dataIndex: "url",
      ellipsis: true,
    },
    {
      title: "Port",
      dataIndex: "port",
      align: "center",
    },
    {
      title: "Enabled",
      dataIndex: "is_enabled",
      align: "center",
      render: (value: boolean) =>
        value ? (
          <span className="text-green-600">
            <CheckCircleOutlined style={{ fontSize: 18 }} />
          </span>
        ) : (
          <span className="text-red-600">
            <CloseCircleOutlined style={{ fontSize: 18 }} />
          </span>
        ),
    },
    {
      title: "Action",
      align: "center",
      render: (_, record) => (
        <Space size={6}>
          <Button
            size="small"
            type="text"
            icon={<FiEdit2 size={14} />}
            onClick={() => navigate(`/edit-truedata/${record.id}`)}
          />

          <Button
            size="small"
            danger
            type="text"
            icon={<MdDeleteOutline size={16} />}
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      ),
    },
  ];

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="h-[calc(100vh-65px)] bg-slate-100 p-3 overflow-hidden">
      <Card
        size="small"
        className="h-full flex flex-col rounded-xl border bg-white shadow-sm"
        styles={{
          body: {
            padding: 0,
            height: "100%",
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        {/* HEADER */}

        <div className="px-4 py-2 border-b bg-white rounded-t-xl">
          <div className="flex items-center justify-between">
            <Title level={4} className="!m-0 !font-bold">
              True Data List
            </Title>

            <Button
              type="primary"
              icon={<PlusOutlined />}
              className="bg-blue-600 font-semibold"
              onClick={() => navigate("/add-true-data")}
            >
              Add True Data
            </Button>
          </div>
        </div>

        {/* TABLE */}

        <div className="flex-1 p-2 overflow-hidden bg-slate-50">
          <div className="h-full bg-white rounded-lg border overflow-hidden">
            <Table
              size="small"
              columns={columns}
              dataSource={data}
              pagination={false}
              sticky
              tableLayout="auto"
              scroll={{
                x: 900,
                y: "calc(100vh - 220px)",
              }}
              className="holiday-table"
            />
          </div>
        </div>
      </Card>

      {/* TABLE STYLE */}

      <style>
        {`
.holiday-table .ant-table {
  font-size: 11px;
}

.holiday-table .ant-table-thead > tr > th {
  background: #f8fafc !important;
  font-size: 11px;
  font-weight: 600;
  padding: 5px 8px !important;
  height: 32px;
}

.holiday-table .ant-table-tbody > tr > td {
  padding: 2px 8px !important;
  height: 28px;
  font-size: 11px;
}

.holiday-table .ant-table-tbody > tr:nth-child(even) {
  background: #fcfdff;
}

.holiday-table .ant-table-tbody > tr:hover > td {
  background: #eef6ff !important;
}

.holiday-table .ant-btn {
  height: 22px;
  width: 22px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.holiday-table .ant-space {
  gap: 4px !important;
}
`}
      </style>
    </div>
  );
}
