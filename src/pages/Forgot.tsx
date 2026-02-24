import React from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowRight } from "lucide-react";
import bgImage from "/login-bg-3.avif"; // same image as login

export default function Forgot() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12 bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/10"></div>

      {/* Content Wrapper */}
      <div className="relative z-10 w-full flex flex-col items-center">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20">
            <Mail className="text-white" size={24} />
          </div>
          <h2 className="text-2xl font-bold text-black">Reset your password</h2>
          <p className="text-sm text-neutral-600 mt-1">
            Enter your email and we’ll send you a reset link.
          </p>
        </div>

        {/* Card */}
        <div className="w-full max-w-[400px] bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-8">
          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700 ml-1">
                Email Address
              </label>
              <div className="relative group">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-blue-600 transition-colors"
                  size={18}
                />
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-300 bg-white text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button className="group w-full flex items-center justify-center gap-2 rounded-xl py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-500/25 active:scale-[0.98] transition-all">
              Send reset link
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>

            {/* Back to Login */}
            <div className="text-sm text-center">
              <Link
                to="/login"
                className="font-medium text-blue-600 hover:text-blue-700 hover:underline underline-offset-4 transition-all"
              >
                Back to sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
