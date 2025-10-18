import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGameStore } from "../store/gameStore";
import { useSocketStore } from "../store/socketStore";
import { useAuthStore } from "../store/authStore";

export default function LobbyPage() {
  const navigate = useNavigate();
  const [isConnecting, setIsConnecting] = useState(false);

  const findMatch = useGameStore((state) => state.findMatch);
  const { connect, connectionStatus } = useSocketStore();

  const session = useAuthStore((state) => state.session);

  const handleFindMatch = () => {
    const token = session?.access_token;
    if (!token) {
      alert("Authentication error. Please log in again.");
      return;
    }

    setIsConnecting(true);
    connect(token);
    findMatch();
    navigate("/game");
  };

  return (
    <div className="bg-gray-900 min-h-screen ...">
      <h1 className="text-6xl ...">WORMFARE</h1>
      <button onClick={handleFindMatch} className="...">
        Find Match
      </button>
    </div>
  );
}
