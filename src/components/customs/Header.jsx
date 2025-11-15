import React from 'react'
import { Link } from 'react-router-dom';
import { useAuth } from "../../context/AuthContext";
import { LogOut } from 'lucide-react';

export default function Header() {
  const { currentUser, userData, logout } = useAuth();

  return (
    <div className="shadow-lg flex justify-between items-center w-full px-6 py-3 bg-white">
      <Link to="/" className="flex items-center gap-3">
        <img src="/logo.png" alt="Logo" className="h-10" />
        <span className="font-bold text-blue-900">TripPlanner AI</span>
      </Link>

      <div>
        {!currentUser ? (
          <Link
            to="/login"
            className="bg-blue-800 !text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Sign In
          </Link>
        ) : (
          <div className="flex items-center">

            {/* ⭐ My Trips Button */}
            <Link
              to="/my-trips"
              className="!text-blue-900 font-medium  px-3 py-2 rounded hover:bg-blue-50 transition-colors "
            >
              My Trips
            </Link>

            {/* Profile Section */}
            <Link
              to="/profile"
              className="flex items-center gap-2 hover:bg-gray-100 px-3 py-2 rounded transition-colors"
            >
              {userData?.photo ? (
                <img
                  src={userData.photo}
                  alt="Profile"
                  className="h-9 w-9 rounded-full object-cover border border-gray-300"
                />
              ) : currentUser?.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt="Profile"
                  className="h-9 w-9 rounded-full object-cover border border-gray-300"
                />
              ) : (
                <div className="h-9 w-9 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                  {currentUser.displayName
                    ? currentUser.displayName.charAt(0).toUpperCase()
                    : currentUser.email?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              <span className="text-sm">
                {currentUser.displayName || currentUser.email}
              </span>
            </Link>

            {/* Logout Button */}
            <button
  onClick={() => logout()}
  className="!bg-white text-red-600 p-2 rounded text-sm border border-red-600 hover:bg-red-50 transition-colors"
  title="Logout"
  aria-label="Logout"
>
  <LogOut size={16} />
</button>
          </div>
        )}
      </div>
    </div>
  );
}
