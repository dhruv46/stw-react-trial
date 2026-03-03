import React, { useState, useEffect } from "react";
import {
  Card,
  Input,
  DatePicker,
  Checkbox,
  Button,
  Typography,
  message,
} from "antd";
import dayjs, { Dayjs } from "dayjs";
import { useNavigate, useParams } from "react-router-dom";
import {
  postExceptionalHolidayApi,
  getExceptionalWorkingDayById,
} from "../../services/SettingsService/ExceptionalSettingsApi";

const { Title, Text } = Typography;

const exchanges = [
  "NSE",
  "BSE",
  "MCX",
  "CSE",
  "ICEX",
  "India INX",
  "MSE",
  "NCDEX",
  "NSE IFSC",
];

export default function AddExceptionalHoliday() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState<string>("");
  const [date, setDate] = useState<Dayjs | null>(null);
  const [morningSession, setMorningSession] = useState<string[]>([]);
  const [eveningSession, setEveningSession] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  /* ================= SESSION FORMAT ================= */

  const formatSession = (session: string[]) => {
    return `{${session.join(", ")}}`;
  };

  const parseSession = (session: string) => {
    if (!session) return [];

    return session
      .replace(/[{}]/g, "")
      .split(",")
      .map((item) => item.replace(/"/g, "").trim());
  };

  /* ================= FETCH BY ID (EDIT MODE) ================= */

  useEffect(() => {
    const fetchExceptionalHoliday = async () => {
      if (!id) return;

      try {
        setLoading(true);

        const res = await getExceptionalWorkingDayById(Number(id));
        const data = res?.data?.result?.[0];

        if (!data) return;

        setName(data.name);
        setDate(dayjs(data.date));
        setMorningSession(parseSession(data.morning_session));
        setEveningSession(parseSession(data.evening_session));
      } catch (error) {
        message.error("Failed to load exceptional holiday data");
      } finally {
        setLoading(false);
      }
    };

    fetchExceptionalHoliday();
  }, [id]);

  /* ================= SUBMIT ================= */

  const handleSubmit = async () => {
    if (!name.trim()) {
      message.error("Working name is required");
      return;
    }

    if (!date) {
      message.error("Working date is required");
      return;
    }

    if (morningSession.length === 0 && eveningSession.length === 0) {
      message.error("Select at least one session (Morning or Evening)");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        id: id ? Number(id) : 0,
        working_date: date.format("DD/MM/YYYY"),
        working_name: name.trim(),
        morning_session: formatSession(morningSession),
        evening_session: formatSession(eveningSession),
      };

      const response = await postExceptionalHolidayApi(payload);

      if (response?.data) {
        message.success(
          id
            ? "Exceptional working day updated successfully!"
            : "Exceptional working day added successfully!",
        );

        setTimeout(() => {
          navigate("/exceptional-setting");
        }, 800);
      }
    } catch (error: any) {
      message.error(
        error?.response?.data?.message ||
          "Failed to save exceptional working day",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <Title level={4} className="!mb-0">
          {id ? "Edit Exceptional Holiday" : "Add Exceptional Holiday"}
        </Title>

        <Button type="default" onClick={() => navigate("/exceptional-setting")}>
          Exceptional Holiday List
        </Button>
      </div>

      {/* Card */}
      <div className="flex justify-center">
        <Card
          className="w-full max-w-2xl shadow-sm rounded-xl"
          styles={{ body: { padding: "28px" } }}
        >
          <div className="space-y-6">
            {/* Holiday Name */}
            <div>
              <Text strong className="text-sm">
                Holiday Name
              </Text>
              <Input
                size="middle"
                placeholder="Enter holiday name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2"
              />
            </div>

            {/* Date */}
            <div>
              <Text strong className="text-sm">
                Select Date
              </Text>
              <DatePicker
                size="middle"
                format="DD-MM-YYYY"
                value={date}
                onChange={(value) => setDate(value)}
                className="w-full mt-2"
              />
            </div>

            {/* Morning Session */}
            <div>
              <Text strong className="text-sm">
                Morning Session
              </Text>

              <Checkbox.Group
                options={exchanges}
                value={morningSession}
                onChange={(list) => setMorningSession(list as string[])}
                className="grid grid-cols-3 gap-3 mt-3"
              />
            </div>

            {/* Evening Session */}
            <div>
              <Text strong className="text-sm">
                Evening Session
              </Text>

              <Checkbox.Group
                options={exchanges}
                value={eveningSession}
                onChange={(list) => setEveningSession(list as string[])}
                className="grid grid-cols-3 gap-3 mt-3"
              />
            </div>

            {/* Submit */}
            <div className="flex justify-center pt-4">
              <Button
                type="primary"
                size="middle"
                loading={loading}
                onClick={handleSubmit}
                className="px-10 rounded-lg"
              >
                Submit
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
