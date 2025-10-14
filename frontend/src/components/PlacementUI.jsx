import React from "react";
import { useGameStore } from "../store/gameStore";
import Board from "./Board";
import WormDock from "./WormDock";
import DraggableWorm from "./DraggableWorm";

// This map connects each worm's name to its unique image file.
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

// This map is for rendering the background cell states (hits, misses).
const COLOR_MAP = {
  0: "bg-transparent",
  1: "bg-gray-500", // Miss
  2: "bg-orange-500", // Hit
};

export default function PlacementUI() {
  // Get all necessary state and actions from the global game store.
  const { playerBoard, army, placements, confirmPlacements } = useGameStore();

  // Derive the lists of placed and unplaced worms from the current state.
  const unplacedWorms = army.filter((w) => !placements[w.id]);
  const placedWorms = army.filter((w) => placements[w.id]);

  // Determine if the confirm button should be shown.
  const allWormsPlaced = army.length > 0 && placedWorms.length === army.length;

  return (
    <div className="flex flex-col items-center w-full">
      <h1 className="text-4xl font-bold mb-6">Prepare for Battle!</h1>
      <div
        className="flex flex-col md:flex-row gap-8 md:gap-16 items-center md:items-start w-full md:justify-center"
        style={{ "--cell-size": "40px", "--cell-size-md": "48px" }}
      >
        {/* Worm Dock for unplaced worms */}
        <WormDock>
          {unplacedWorms.map((worm) => (
            <DraggableWorm
              key={worm.id}
              worm={worm}
              imageUrls={IMAGE_MAP[worm.name]}
            />
          ))}
        </WormDock>

        {/* Player's Board Area */}
        <div className="flex flex-col items-center">
          <h2 className="text-2xl mb-3">Your Garden</h2>
          <div className="relative">
            <Board
              boardData={playerBoard}
              colorMap={COLOR_MAP}
              isPlayerBoard={true}
            />
            {/* Render placed worms on top of the board */}
            {placedWorms.map((worm) => (
              <DraggableWorm
                key={worm.id}
                worm={worm}
                placement={placements[worm.id]}
                imageUrls={IMAGE_MAP[worm.name]}
              />
            ))}
          </div>
        </div>
      </div>

      {/* "Confirm Placement" button appears only when all worms are placed */}
      {allWormsPlaced && (
        <div className="mt-8 text-center">
          <button
            onClick={confirmPlacements}
            className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg text-xl shadow-lg transition-transform transform hover:scale-105"
          >
            Confirm Placement
          </button>
        </div>
      )}
    </div>
  );
}
