import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGameStore } from "../store/gameStore";
import { useSocketStore } from "../store/socketStore";

export default function LobbyPage() {
  const navigate = useNavigate();
  const [isConnecting, setIsConnecting] = useState(false);

  const findMatch = useGameStore((state) => state.findMatch);
  const { connect, connectionStatus } = useSocketStore();

  const handleFindMatch = () => {
    setIsConnecting(true);
    connect(); // Start the WebSocket connection.
  };

  // This effect listens for the connection to be successful.
  useEffect(() => {
    // When the status changes to 'connected', we can proceed.
    if (connectionStatus === "connected") {
      findMatch(); // Now, tell our game state we're waiting.
      navigate("/game"); // Finally, navigate to the game page.
    }
    // If the connection fails, we can reset the button.
    if (connectionStatus === "disconnected" && isConnecting) {
      setIsConnecting(false);
    }
  }, [connectionStatus, navigate, findMatch, isConnecting]);

  return (
    <div className="bg-gray-900 min-h-screen text-white flex flex-col items-center justify-center">
      <h1 className="text-6xl font-bold mb-8 tracking-wider">WORMFARE</h1>
      <button
        onClick={handleFindMatch}
        // The button is disabled while the connection is in progress.
        disabled={isConnecting}
        className="px-10 py-5 bg-green-600 text-white font-bold rounded-lg text-3xl hover:bg-green-700 transition-all disabled:bg-gray-500 disabled:cursor-not-allowed"
      >
        {isConnecting ? "Connecting..." : "Find Match"}
      </button>
    </div>
  );
}
