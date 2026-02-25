import API from "./api";

// 1. Define an interface that matches your form data requirements
interface LoginPayload {
  username: string; // The API expects 'username' per your screenshot
  password: string;
}

export const loginApi = (data: LoginPayload) => {
  // 2. Use URLSearchParams to ensure it is sent as "Form Data" (x-www-form-urlencoded)
  const params = new URLSearchParams();
  params.append("grant_type", "password");
  params.append("username", data.username);
  params.append("password", data.password);

  // You can also add these if your backend requires them:
  // params.append("otp", "");
  // params.append("scope", "");
  // params.append("client_id", "your_client_id");
  // params.append("client_secret", "your_client_secret");

  return API.post("/token", params, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
};

export const getMeApi = () => {
  return API.get("/users/me");
};

export const forgotPasswordApi = (email: string) => {
  return API.post("/forgot-password", { email });
};

// src/services/authApi.ts
export const logoutApi = () => {
  // Remove the access_token cookie
  document.cookie =
    "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

  // Optional: redirect to login page
  window.location.href = "/login";
};
