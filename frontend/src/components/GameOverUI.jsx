import React from "react";
import { useNavigate } from "react-router-dom";
import { useGameStore } from "../store/gameStore";
import { useSocketStore } from "../store/socketStore";
import CoachWorm from "./CoachWorm";

export default function GameOverUI() {
  const navigate = useNavigate();
  const { winner, playerID, gameResult, reset } = useGameStore();
  const disconnect = useSocketStore((state) => state.disconnect);

  let resultTitle = "";
  let resultDesc = "";
  let resultColor = "";
  let resultEmoji = "";

  if (gameResult === "draw") {
    resultTitle = "STALEMATE";
    resultDesc = "The garden remains a disputed territory. No one gained ground today.";
    resultColor = "text-sunflower";
    resultEmoji = "🤝";
  } else {
    const isWinner = playerID === winner;
    resultTitle = isWinner ? "VICTORY!" : "DEFEAT";
    resultDesc = isWinner 
      ? "You have conquered the soil! Your worms are the stuff of legends."
      : "You were out-slithered. Retreat to the shadows and plan your revenge.";
    resultColor = isWinner ? "text-meadow" : "text-red-500";
    resultEmoji = isWinner ? "👑" : "💀";
  }

  const handleReturnToLobby = () => {
    reset();
    disconnect();
    navigate("/lobby");
  };

  return (
    <>
      <div className="garden-panel max-w-xl w-full bg-underground/90 border-sunflower/30 backdrop-blur-xl animate-squirm">
        <div className="flex flex-col items-center text-center p-6">
          <div className="text-8xl mb-6 drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
            {resultEmoji}
          </div>
          
          <h1 className={`text-7xl font-display mb-4 ${resultColor} drop-shadow-[0_4px_0_#000]`}>
            {resultTitle}
          </h1>
          
          <p className="text-xl text-white/70 mb-10 leading-relaxed max-w-md italic font-light">
            "{resultDesc}"
          </p>

          <div className="w-full h-1 bg-white/5 rounded-full mb-10 overflow-hidden">
            <div className={`h-full w-full ${gameResult === 'draw' ? 'bg-sunflower' : (playerID === winner ? 'bg-meadow' : 'bg-red-500')} animate-pulse`} />
          </div>

          <button
            onClick={handleReturnToLobby}
            className="garden-btn scale-125 hover:scale-150 py-5 px-12 group"
          >
            BACK TO HQ 🏠
          </button>
        </div>
      </div>
      <CoachWorm message={gameResult === "draw" ? "Well, that was anticlimactic. At least we didn't lose!" : (playerID === winner ? "Beautiful execution! The garden is officially ours!" : "We'll get them next time! Retreat and heal up!")} />
    </>
  );
}
