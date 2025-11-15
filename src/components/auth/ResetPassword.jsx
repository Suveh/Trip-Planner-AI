// src/components/auth/ResetPassword.jsx
import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";

export default function ResetPassword() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await resetPassword(email);
    } catch (err) {
      // toast handled
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4  bg-gradient-to-br from-sky-100 to-sky-300 ">
      <div className="max-w-md w-full bg-white p-8 rounded shadow">
        <h3 className="text-xl font-semibold mb-4">Reset password</h3>
        <form onSubmit={handleReset} className="space-y-4">
          <input
            className="w-full px-4 py-3 rounded-lg border"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
          />
          <div className="flex justify-between items-center">
            <Link to="/login" className="text-sm text-blue-600 hover:underline">Back to login</Link>
            <button type="submit" disabled={loading} className="!bg-blue-800 text-white px-4 py-2 rounded">
              {loading ? "Sending..." : "Send reset email"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
