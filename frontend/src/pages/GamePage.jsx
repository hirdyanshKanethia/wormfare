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
    if (connectionStatus === "disconnected") {
      navigate("/lobby", { replace: true });
    }
  }, [connectionStatus, navigate]);

  if (connectionStatus !== "connected") {
    return (
      <div className="bg-underground min-h-screen flex flex-col items-center justify-center text-white p-6">
        <div className="text-8xl animate-bounce mb-8">🪱</div>
        <h1 className="text-4xl font-display text-sunflower animate-pulse">
          Digging Tunnel to Server...
        </h1>
      </div>
    );
  }

  const renderContent = () => {
    switch (gamePhase) {
      case "waiting":
        return (
          <div className="flex flex-col items-center">
            <div className="relative w-32 h-32 mb-8">
              <div className="absolute inset-0 border-4 border-meadow rounded-full animate-ping opacity-20" />
              <div className="absolute inset-4 border-4 border-sunflower rounded-full animate-ping opacity-40" />
              <div className="absolute inset-0 flex items-center justify-center text-5xl animate-spin">🔍</div>
            </div>
            <h1 className="text-5xl font-display text-white text-center">
              Scanning the Garden<br/>
              <span className="text-meadow text-2xl">Searching for an opponent...</span>
            </h1>
          </div>
        );

      case "placing_worms":
        return <PlacementUI />;

      case "waiting_for_opponent":
        return (
          <div className="flex flex-col items-center">
             <div className="text-8xl animate-bounce mb-8">🍵</div>
             <h1 className="text-5xl font-display text-white text-center">
              Worm Tea Break<br/>
              <span className="text-meadow text-2xl uppercase tracking-widest">Opponent is still digging...</span>
            </h1>
          </div>
        );

      case "playing":
        return <BattleUI />;

      case "game_over":
        return <GameOverUI />;

      default:
        return (
          <div className="flex flex-col items-center">
             <div className="text-8xl animate-spin mb-8">🌀</div>
             <h1 className="text-4xl font-display text-white">Shifting Soil...</h1>
          </div>
        );
    }
  };

  return (
    <div className="bg-underground min-h-screen text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Background Noise */}
      <div className="absolute inset-0 opacity-10 pointer-events-none select-none">
        <div className="absolute top-10 left-10 text-4xl">🌿</div>
        <div className="absolute bottom-20 right-20 text-4xl">🐛</div>
        <div className="absolute top-1/2 right-10 text-4xl rotate-12">🍂</div>
        <div className="absolute bottom-10 left-1/4 text-4xl -rotate-12">🌿</div>
      </div>
      
      <div className="w-full h-full flex items-center justify-center z-10">
        {renderContent()}
      </div>
    </div>
  );
}
