import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getMeApi } from "../services/authApi";
import Loader from "../components/Loader";

/* ================= Cookie Helpers ================= */

const setCookie = (name: string, value: string, days = 7) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);

  document.cookie = `${name}=${encodeURIComponent(
    value,
  )};expires=${expires.toUTCString()};path=/`;
};

const getCookie = (name: string) => {
  const cookies = document.cookie.split("; ");

  for (let cookie of cookies) {
    const [key, value] = cookie.split("=");

    if (key === name) {
      return decodeURIComponent(value);
    }
  }

  return null;
};

/* ================= Component ================= */

interface AuthGuardProps {
  children: JSX.Element;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Prevent double execution
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    getMeApi()
      .then((response) => {
        const user = response.data;

        const cookieFullName = getCookie("full_name");
        const cookieEmail = getCookie("email");
        const cookieUsername = getCookie("username");

        if (cookieFullName !== user.full_name) {
          setCookie("full_name", user.full_name);
        }

        if (cookieEmail !== user.email) {
          setCookie("email", user.email);
        }

        if (cookieUsername !== user.username) {
          setCookie("username", user.username);
        }

        setLoading(false);

        if (location.pathname === "/login" || location.pathname === "/forgot") {
          navigate("/", { replace: true });
        }
      })
      .catch(() => {
        navigate("/login", { replace: true });
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }

  return children;
}
