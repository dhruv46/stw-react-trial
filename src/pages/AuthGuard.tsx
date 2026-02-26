import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getMeApi } from "../services/authApi";
import "../style/boxLoader.css";

interface AuthGuardProps {
  children: JSX.Element;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation(); // current URL

  useEffect(() => {
    getMeApi()
      .then(() => {
        setLoading(false);

        // If user is on /login or /forgot after login, redirect to home
        if (location.pathname === "/login" || location.pathname === "/forgot") {
          navigate("/", { replace: true });
        }
      })
      .catch(() => navigate("/login", { replace: true }));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="load-wrapper">
          <div className="box-wrapper">
            <div>
              <span></span>
            </div>
            <div>
              <span></span>
            </div>
            <div>
              <span></span>
            </div>
            <div>
              <span></span>
            </div>
          </div>
          <p>loading!..</p>
        </div>
      </div>
    );
  }

  return children;
}
