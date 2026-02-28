import API from "./api";

// ================================
// Profile Update Payload
// ================================
interface ProfileUpdatePayload {
  full_name: string;
  username: string;
  email: string;
  two_factor_enabled: boolean;
}

// ================================
// Update Profile API
// ================================
export const updateProfileApi = (data: ProfileUpdatePayload) => {
  return API.post("/profile_update", data);
};

// ================================
// Change Password Payload
// ================================
interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

// ================================
// Change Password API
// ================================
export const changePasswordApi = (data: ChangePasswordPayload) => {
  return API.post("/change_user_password", data);
};
