import React from "react";
import { useNavigate } from "react-router-dom";
import { useGameStore } from "../store/gameStore";
import { useSocketStore } from "../store/socketStore";

export default function GameOverUI() {
  const navigate = useNavigate();
  const { winner, playerID, gameResult, reset } = useGameStore();
  const disconnect = useSocketStore((state) => state.disconnect);

  let resultText = "";
  let resultColor = "";

  if (gameResult === "draw") {
    resultText = "It's a Draw!";
    resultColor = "text-yellow-400";
  } else {
    const isWinner = playerID === winner;
    resultText = isWinner ? "You Win!" : "You Lose!";
    resultColor = isWinner ? "text-green-400" : "text-red-500";
  }

  const handleReturnToLobby = () => {
    reset(); // Reset the game state
    disconnect();
    navigate("/lobby"); // Navigate back to the lobby
  };

  return (
    <div className="flex flex-col items-center justify-center bg-gray-900/80 p-10 rounded-lg shadow-xl border-2 border-yellow-700">
      <h1 className={`text-6xl font-bold mb-6 ${resultColor}`}>{resultText}</h1>
      <button
        onClick={handleReturnToLobby}
        className="px-8 py-4 bg-blue-600 text-white font-bold rounded-lg text-2xl hover:bg-blue-700 transition-colors"
      >
        Play Again
      </button>
    </div>
  );
}
