import React from "react";
import { Navigate } from "react-router-dom";
import { useSocketStore } from "../store/socketStore";

/**
 * A component that acts as a "bouncer" for a route.
 * It checks if the WebSocket connection is active. If not, it redirects
 * the user to the home page ('/').
 */
export default function ProtectedRoute({ children }) {
  // Get the current connection status from our global socket store.
  const connectionStatus = useSocketStore((state) => state.connectionStatus);

  // If the user is not connected, redirect them.
  if (connectionStatus !== "connected") {
    // The <Navigate> component is provided by React Router for programmatic redirects.
    // 'replace' prevents the user from using the "back" button to get to the broken page.
    return <Navigate to="/lobby" replace />;
  }

  // If the user is connected, render the page they were trying to access.
  return children;
}
