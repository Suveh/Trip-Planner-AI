// src/components/auth/RequireAuth.jsx
import React from "react";
import { useAuth } from "../../context/AuthContext";
import { Navigate, useLocation } from "react-router-dom";

export default function RequireAuth({ children }) {
  const { currentUser, initializing } = useAuth();
  const location = useLocation();

  if (initializing) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
