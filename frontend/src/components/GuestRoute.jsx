import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function GuestRoute({ children }) {
  const { user, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="bg-gray-800 min-h-screen flex items-center justify-center text-white">
        Loading Auth...
      </div>
    );
  }

  // If ALREADY logged in, redirect away from landing/login to the lobby.
  if (user) {
    return <Navigate to="/lobby" replace />;
  }

  // If logged out, show the landing/login page.
  return children;
}
