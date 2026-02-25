import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  // headers: {
  //   "Content-Type": "application/json",
  // },
  withCredentials: true,
});

const getTokenFromCookie = () => {
  const match = document.cookie.match(/(^| )access_token=([^;]+)/);
  return match ? match[2] : null;
};

// 🔐 Request Interceptor (Attach Token)
API.interceptors.request.use(
  (config) => {
    const token = getTokenFromCookie();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

export default API;
