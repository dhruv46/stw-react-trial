import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, ArrowRight, Eye, EyeOff, User } from "lucide-react";
import bgImage from "/login-bg-3.avif"; // adjust path if needed
import { loginApi } from "../services/authApi"; // adjust path

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);

  //set the items in the cookie instead of localStorage
  function setItem(key: string, value: string, days?: number) {
    let cookieString = `${encodeURIComponent(key)}=${encodeURIComponent(value)}; path=/;`;
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      cookieString += `expires=${date.toUTCString()};`;
    }
    document.cookie = cookieString;
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const res = await loginApi({
        username,
        password,
      });

      // console.log("Login successful:", res.data);

      // 2️⃣ Store the token in cookie for 7 days
      setItem("access_token", res.data.access_token, 7);
      navigate("/", { replace: true }); // ✅ navigate after login localStorage.setItem("token", res.data.access_token);
    } catch (err: any) {
      setError(err.response?.data?.error_description || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12 bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/10"></div>

      {/* Content Wrapper */}
      <div className="relative z-10 w-full flex flex-col items-center">
        {/* Logo / Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20">
            <Lock className="text-white" size={24} />
          </div>
          <h2 className="text-2xl font-bold text-black">Welcome back</h2>
          <p className="text-sm text-neutral-600 mt-1">
            Please enter your details to sign in.
          </p>
        </div>

        {/* Login Card */}
        <div className="w-full max-w-[400px] bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-8">
          <form className="space-y-5" onSubmit={onSubmit}>
            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700 ml-1">
                Username
              </label>
              <div className="relative group">
                <User
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-blue-600 transition-colors"
                  size={18}
                />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="username"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-300 bg-white text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
            {/* Password Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700 ml-1">
                Password
              </label>

              <div className="relative group">
                {/* Left Lock Icon */}
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-blue-600 transition-colors"
                  size={18}
                />

                {/* Input */}
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-neutral-300 bg-white text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all"
                />

                {/* Right Eye Icon */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-blue-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember Me + Forgot Password */}
            <div className="flex items-center justify-between">
              {/* Left Side - Remember */}
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  id="remember"
                  className="w-4 h-4 rounded border-neutral-300 text-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
                />
                <span className="text-sm text-neutral-600">Remember me</span>
              </label>

              {/* Right Side - Forgot */}
              <Link
                to="/forgot"
                className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              disabled={loading}
              className="group w-full flex items-center justify-center gap-2 rounded-xl py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-500/25 active:scale-[0.98] transition-all"
            >
              {loading ? "Signing in..." : "Sign in"}
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>

            {error && (
              <div className="text-sm text-red-500 text-center">{error}</div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
