// src/components/auth/Login.jsx
import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../../public/logo.png";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FcGoogle } from "react-icons/fc";
import { HiOutlineMail } from "react-icons/hi";
import { RiLockPasswordLine } from "react-icons/ri";
import { FiUserPlus, FiKey } from "react-icons/fi";

export default function Login() {
  const { signInWithGoogle, signInWithEmail } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleGoogle = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
      navigate("/");
    } catch (err) {
      // toast handled in context
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await signInWithEmail(email, password);
      navigate("/");
    } catch (err) {
      // toast handled in context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-100 to-sky-300 px-4">
      <div className="max-w-md w-full bg-white/80 backdrop-blur-md rounded-2xl p-8 shadow-lg">
        <div className="flex justify-center mb-4">
          <img src={logo} alt="logo" className="h-20 w-auto rounded-md" />
        </div>
        <h2 className="text-center text-2xl font-bold mb-6 text-slate-800">Welcome back</h2>

        {/* Google Button with Icon */}
        <button
          onClick={handleGoogle}
          disabled={loading}
          className="w-full !bg-blue-800 text-white py-3 rounded-lg mt-2 hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
        >
          {loading ? (
            <AiOutlineLoading3Quarters className="animate-spin" />
          ) : (
            <FcGoogle className="text-xl" />
          )}
          Continue with Google
        </button>

        <div className="flex items-center justify-between text-sm text-slate-600 mb-4">
          <span className="flex-1 h-px bg-slate-300 mr-3"></span>
          <span>OR</span>
          <span className="flex-1 h-px bg-slate-300 ml-3"></span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Input with Icon */}
          <div className="relative">
            <HiOutlineMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
            <input
              className="w-full pl-10 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
            />
          </div>

          {/* Password Input with Icon */}
          <div className="relative">
            <RiLockPasswordLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
            <input
              className="w-full pl-10 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
            />
          </div>

          <div className="flex items-center justify-between text-xs">
            <Link to="/reset-password" className="text-blue-600 hover:underline flex items-center gap-1">
              <FiKey className="text-sm" />
              Forgot password?
            </Link>
            <Link to="/signup" className="text-blue-600 hover:underline flex items-center gap-1">
              <FiUserPlus className="text-sm" />
              Create account
            </Link>
          </div>

          {/* Sign In Button with Icon */}
          <button
            disabled={loading}
            className="w-full !bg-blue-800 text-white py-3 rounded-lg mt-2 hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
            type="submit"
          >
            {loading ? (
              <AiOutlineLoading3Quarters className="animate-spin" />
            ) : (
              <HiOutlineMail />
            )}
            {loading ? "Signing in..." : "Sign In with Email"}
          </button>
        </form>
      </div>
    </div>
  );
}