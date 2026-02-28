import { useEffect, useState } from "react";
import { Input, Button, Switch, Divider, message } from "antd";
import Loader from "../components/Loader";
import { getMeApi } from "../services/authApi";
import { updateProfileApi, changePasswordApi } from "../services/userInfoApi";

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
  const [saving, setSaving] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [passwordLoading, setPasswordLoading] = useState(false);

  /* ================= Fetch User ================= */
  useEffect(() => {
    getMeApi()
      .then((response) => setUser(response.data))
      .catch((error) => console.error("Error fetching user info:", error))
      .finally(() => setLoading(false));
  }, []);

  /* ================= Handle Input Change ================= */
  const handleChange = (field: keyof User, value: any) => {
    setUser((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  /* ================= Update Profile ================= */
  const handleSave = async () => {
    if (!user) return;

    try {
      setSaving(true);

      await updateProfileApi({
        full_name: user.full_name,
        username: user.username,
        email: user.email,
        two_factor_enabled: user.two_factor_enabled,
      });

      message.success("Profile updated successfully ✅");
    } catch (error) {
      console.error(error);
      message.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  /* ================= Change Password ================= */
  const handlePasswordChange = async () => {
    try {
      if (!passwordData.current_password)
        return message.warning("Enter current password");

      if (!passwordData.new_password)
        return message.warning("Enter new password");

      if (passwordData.new_password !== passwordData.confirm_password) {
        return message.error("Passwords do not match");
      }

      setPasswordLoading(true);

      await changePasswordApi(passwordData);

      message.success("Password updated successfully ✅");

      // reset fields
      setPasswordData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (error) {
      console.error(error);
      message.error("Failed to update password");
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="bg-gray-100 max-h-screen p-3 max-w-3xl mx-auto">
      <div className="bg-white rounded-md shadow-sm border">
        {/* Header */}
        <div className="px-3 py-2 border-b flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-800">User Settings</h2>

          <span className="text-[11px] px-2 py-[2px] bg-blue-50 text-blue-600 rounded">
            {user?.user_role}
          </span>
        </div>

        <div className="p-3 space-y-4">
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
                  onChange={(e) => handleChange("full_name", e.target.value)}
                  className="mt-0.5 h-8"
                />
              </div>

              {/* Username */}
              <div>
                <label className="text-[11px] text-gray-600">Username</label>
                <Input
                  size="small"
                  value={user?.username}
                  onChange={(e) => handleChange("username", e.target.value)}
                  className="mt-0.5 h-8"
                />
              </div>
            </div>

            {/* Email */}
            <div className="mt-2">
              <label className="text-[11px] text-gray-600">Email</label>
              <Input
                size="small"
                value={user?.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="mt-0.5 h-8"
              />
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

              <Switch
                size="small"
                checked={user?.two_factor_enabled}
                onChange={(checked) =>
                  handleChange("two_factor_enabled", checked)
                }
              />
            </div>

            <Button
              type="primary"
              size="small"
              loading={saving}
              onClick={handleSave}
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
                <Input.Password
                  size="small"
                  value={passwordData.current_password}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      current_password: e.target.value,
                    })
                  }
                  className="mt-0.5 h-8"
                />
              </div>

              <div>
                <label className="text-[11px] text-gray-600">
                  New Password
                </label>
                <Input.Password
                  size="small"
                  value={passwordData.new_password}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      new_password: e.target.value,
                    })
                  }
                  className="mt-0.5 h-8"
                />
              </div>

              <div>
                <label className="text-[11px] text-gray-600">
                  Confirm Password
                </label>
                <Input.Password
                  size="small"
                  value={passwordData.confirm_password}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirm_password: e.target.value,
                    })
                  }
                  className="mt-0.5 h-8"
                />
              </div>
            </div>

            <Button
              size="small"
              loading={passwordLoading}
              onClick={handlePasswordChange}
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
