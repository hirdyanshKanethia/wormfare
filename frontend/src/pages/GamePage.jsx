import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGameStore } from "../store/gameStore";
import { useSocketStore } from "../store/socketStore";
import PlacementUI from "../components/PlacementUI";
import BattleUI from "../components/BattleUI";
import GameOverUI from "../components/GameOverUI";

export default function GamePage() {
  const gamePhase = useGameStore((state) => state.gamePhase);
  const connectionStatus = useSocketStore((state) => state.connectionStatus);
  const navigate = useNavigate();

  useEffect(() => {
    // If the connection drops, redirect back to the lobby.
    if (connectionStatus === "disconnected") {
      console.log("WebSocket disconnected, redirecting to lobby...");
      navigate("/lobby", { replace: true });
    }
  }, [connectionStatus, navigate]);

  if (connectionStatus !== "connected") {
    return (
      <div className="bg-gray-800 min-h-screen flex items-center justify-center text-white">
        <h1 className="text-3xl animate-pulse">Connecting to game server...</h1>
      </div>
    );
  }

  const renderContent = () => {
    switch (gamePhase) {
      case "waiting":
        return (
          <h1 className="text-4xl font-bold animate-pulse">
            Finding an opponent...
          </h1>
        );

      case "placing_worms":
        return <PlacementUI />;

      case "waiting_for_opponent":
        return (
          <h1 className="text-4xl font-bold animate-pulse">
            Waiting for opponent to place worms...
          </h1>
        );

      case "playing":
        return <BattleUI />;

      case "game_over":
        return <GameOverUI />;

      default:
        // Fallback for unexpected states
        return <h1 className="text-4xl font-bold">Loading Game...</h1>;
    }
  };

  return (
    <div className="bg-gray-800 min-h-screen text-white flex flex-col items-center justify-center p-4">
      {renderContent()}
    </div>
  );
}
