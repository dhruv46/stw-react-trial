import { getMeApi } from "../services/authApi";
import { useEffect, useState } from "react";
import { Input, Button, Switch, Divider, Spin } from "antd";

interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  enabled: boolean;
  user_role: string;
  two_factor_enabled: boolean;
}

export default function UserInfo() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMeApi()
      .then((response) => setUser(response.data))
      .catch((error) => console.error("Error fetching user info:", error))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Spin size="small" />
      </div>
    );

  return (
    <div className="bg-gray-100 max-h-screen p-3 max-w-4xl align-center mx-auto">
      <div className="bg-white rounded-md shadow-sm border">
        {/* Header */}
        <div className="px-3 py-2 border-b flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-800">User Settings</h2>

          <span className="text-[11px] px-2 py-[2px] bg-blue-50 text-blue-600 rounded">
            {user?.user_role}
          </span>
        </div>

        <div className="p-3 space-y-4 ">
          {/* ================= USER INFO ================= */}
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-2">
              User Information
            </p>

            <div className="grid grid-cols-2 gap-3">
              {/* Full Name */}
              <div>
                <label className="text-[11px] text-gray-600">Full Name</label>
                <Input
                  size="small"
                  value={user?.full_name}
                  className="mt-0.5 h-8"
                />
              </div>

              {/* Username */}
              <div>
                <label className="text-[11px] text-gray-600">Username</label>
                <Input
                  size="small"
                  value={user?.username}
                  className="mt-0.5 h-8"
                />
              </div>
            </div>

            {/* Email */}
            <div className="mt-2">
              <label className="text-[11px] text-gray-600">Email</label>
              <Input size="small" value={user?.email} className="mt-0.5 h-8" />
            </div>

            {/* 2FA */}
            <div className="flex justify-between items-center border rounded px-3 py-2 mt-3 bg-gray-50">
              <div>
                <p className="text-[12px] font-medium">
                  Two-Factor Authentication
                </p>
                <p className="text-[10px] text-gray-500">
                  Extra security layer
                </p>
              </div>

              <Switch size="small" checked={user?.two_factor_enabled} />
            </div>

            <Button
              type="primary"
              size="small"
              className="mt-3 h-8 px-4 text-xs"
            >
              Save Changes
            </Button>
          </div>

          <Divider className="!my-1" />

          {/* ================= PASSWORD ================= */}
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-2">
              Change Password
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-gray-600">
                  Current Password
                </label>
                <Input.Password size="small" className="mt-0.5 h-8" />
              </div>

              <div>
                <label className="text-[11px] text-gray-600">
                  New Password
                </label>
                <Input.Password size="small" className="mt-0.5 h-8" />
              </div>

              <div>
                <label className="text-[11px] text-gray-600">
                  Confirm Password
                </label>
                <Input.Password size="small" className="mt-0.5 h-8" />
              </div>
            </div>

            <Button
              size="small"
              className="mt-3 bg-yellow-400 hover:!bg-yellow-500 text-black border-none h-8 px-4 text-xs"
            >
              Update Password
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
