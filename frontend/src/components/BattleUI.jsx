import React from "react";
import { useGameStore } from "../store/gameStore";
import Board from "./Board";
import DraggableWorm from "./DraggableWorm";

const IMAGE_MAP = {
  "General C. Crawlington": {
    horizontal: "/assets/5_cells_h.png",
    vertical: "/assets/5_cells_v.png",
  },
  "Major Slitherford": {
    horizontal: "/assets/4_cells_h.png",
    vertical: "/assets/4_cells_v.png",
  },
  "Captain Coilton": {
    horizontal: "/assets/3_cells_h.png",
    vertical: "/assets/3_cells_v.png",
  },
  "Sarge Wiggles": {
    horizontal: "/assets/3_cells_h.png",
    vertical: "/assets/3_cells_v.png",
  },
  "Private Squirmley": {
    horizontal: "/assets/2_cells_h.png",
    vertical: "/assets/2_cells_v.png",
  },
};

// Reuse the COLOR_MAP from PlacementUI or define it here
const COLOR_MAP = {
  0: "bg-transparent",
  1: "bg-gray-500", // Miss
  2: "bg-orange-500", // Hit
  3: "bg-black", // Sunk/Martyred
};

export default function BattleUI() {
  const { playerBoard, opponentBoard, placements, army, playerID, activeTurn } =
    useGameStore();

  const isMyTurn = playerID === activeTurn;
  console.log(isMyTurn)

  return (
    <div className="flex flex-col items-center w-full">
      <h1
        className={`text-4xl font-bold mb-6 transition-all ${
          isMyTurn ? "text-green-400 animate-pulse" : "text-yellow-400"
        }`}
      >
        {isMyTurn ? "Your Turn!" : "Opponent's Turn"}
      </h1>

      <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-start justify-center">
        {/* Player's Board Area */}
        <div className="flex flex-col items-center">
          <h2 className="text-2xl mb-3">Your Garden</h2>
          <div className="relative">
            {/* The board shows hits/misses, and is NOT interactive */}
            <Board
              boardData={playerBoard}
              colorMap={COLOR_MAP}
              isPlayerBoard={true}
              isInteractive={false}
            />
            {/* We render the player's worms on top for reference */}
            {Object.values(placements).map((p) => {
              const worm = army.find((w) => w.id === p.wormId);
              return worm ? (
                <DraggableWorm
                  key={p.wormId}
                  worm={worm}
                  placement={p}
                  imageUrls={IMAGE_MAP[worm.name]}
                  isDraggable={false}
                />
              ) : null;
            })}
          </div>
        </div>

        {/* Opponent's Board Area */}
        <div className="flex flex-col items-center">
          <h2 className="text-2xl mb-3">Opponent's Garden</h2>
          {/* This board is interactive ONLY when it's our turn */}
          <Board
            boardData={opponentBoard}
            colorMap={COLOR_MAP}
            isInteractive={isMyTurn}
          />
        </div>
      </div>
    </div>
  );
}
