// src/components/auth/Signup.jsx
import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../../public/logo.png";

export default function Signup() {
  const { signUpWithEmail } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await signUpWithEmail(email, password, displayName);
      navigate("/");
    } catch (err) {
      // toast handled in context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-rose-200 px-4">
      <div className="max-w-md w-full bg-white/90 rounded-2xl p-8 shadow-lg">
      <div className="flex justify-center mb-4">
                <img src={logo} alt="logo" className="h-20 w-auto rounded-md" />
              </div>
        <h2 className="text-center text-2xl font-bold mb-6 text-slate-800">Create an account</h2>
        <form onSubmit={handleSignup} className="space-y-4">
          <input
            className="w-full px-4 py-3 rounded-lg border focus:outline-none"
            placeholder="Full name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
          />
          <input
            className="w-full px-4 py-3 rounded-lg border focus:outline-none"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="w-full px-4 py-3 rounded-lg border focus:outline-none"
            placeholder="Password (min 6 chars)"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
          <button disabled={loading} className="w-full !bg-green-700 text-white py-2 rounded-lg">
            {loading ? "Creating..." : "Sign up"}
          </button>

          <div className="text-sm text-slate-600 text-center">
            Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Sign in</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
