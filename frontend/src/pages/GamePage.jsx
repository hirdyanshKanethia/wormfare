import React from "react";
import { useGameStore } from "../store/gameStore";
import PlacementUI from "../components/PlacementUI";

export default function GamePage() {
  const gamePhase = useGameStore((state) => state.gamePhase);

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

      // 'playing' and 'game_over' phases will be added here later
      // case 'playing':
      //   return <BattleUI />;

      default:
        // Fallback for unexpected states
        return <h1 className="text-4xl font-bold">Returning to Lobby...</h1>;
    }
  };

  return (
    <div className="bg-gray-800 min-h-screen text-white flex flex-col items-center justify-center p-4">
      {renderContent()}
    </div>
  );
}
