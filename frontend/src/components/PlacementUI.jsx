import React from "react";
import { useGameStore } from "../store/gameStore";
import Board from "./Board";
import WormDock from "./WormDock";
import DraggableWorm from "./DraggableWorm";

const IMAGE_MAP = {
  "General C. Crawlington": {
    normal: "/assets/wormfare_5x1.png",
    injured: "/assets/wormfare_5x1_injured_.png",
  },
  "Major Slitherford": {
    normal: "/assets/wormfare_4x1.png",
    injured: "/assets/wormfare_4x1_injured_.png",
  },
  "Captain Coilton": {
    normal: "/assets/wormfare_3x1.png",
    injured: "/assets/wormfare_3x1_injured.png",
  },
  "Sarge Wiggles": {
    normal: "/assets/wormfare_3x1.png",
    injured: "/assets/wormfare_3x1_injured.png",
  },
  "Private Squirmley": {
    normal: "/assets/wormfare_2x1.png",
    injured: "/assets/wormfare_2x1_injured.png",
  },
};

const COLOR_MAP = {
  0: "bg-transparent",
  1: "bg-white/20 backdrop-blur-sm", // Miss (mud splash)
  2: "bg-red-500/40 animate-pulse", // Hit
};

export default function PlacementUI() {
  const { playerBoard, army, placements, confirmPlacements } = useGameStore();

  const unplacedWorms = army.filter((w) => !placements[w.id]);
  const placedWorms = army.filter((w) => placements[w.id]);
  const allWormsPlaced = army.length > 0 && placedWorms.length === army.length;

  return (
    <div className="flex flex-col items-center w-full max-w-7xl mx-auto py-4 md:py-8 px-2 md:px-4">
      <div className="text-center mb-6 md:mb-10">
        <h1 className="text-4xl md:text-6xl text-sunflower mb-2 drop-shadow-[0_4px_0_#A0522D]">
          DIG YOUR DEFENSES
        </h1>
        <p className="text-meadow font-display text-sm md:text-lg uppercase tracking-[0.2em]">
          Strategic Deployment Phase
        </p>
      </div>

      <div
        className="flex flex-col xl:flex-row gap-6 md:gap-12 items-center xl:items-start w-full justify-center"
        style={{ 
          "--cell-size": "min(10vw, 44px)", 
          "--cell-size-md": "56px" 
        }}
      >
        {/* Left Side: The Crate (Dock) */}
        <div className="w-full xl:w-80 order-2 xl:order-1">
          <div className="garden-panel bg-clay/30 relative py-4 md:py-6">
            <div className="absolute -top-4 left-6 bg-clay px-3 py-1 rounded-full text-[10px] md:text-xs font-display text-sunflower border-2 border-meadow uppercase tracking-widest">
              Recruits
            </div>
            
            <div className="mt-2">
              <WormDock>
                <div className="flex flex-row xl:flex-col gap-3 md:gap-4 overflow-x-auto xl:overflow-x-visible pb-4 xl:pb-0 custom-scrollbar px-2">
                  {unplacedWorms.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center p-4 md:p-8 opacity-30 w-full">
                      <div className="text-2xl md:text-4xl mb-2">✅</div>
                      <div className="text-[10px] md:text-xs uppercase font-display whitespace-nowrap">All deployed!</div>
                    </div>
                  ) : (
                    unplacedWorms.map((worm) => (
                      <div key={worm.id} className="worm-card min-w-[120px] md:min-w-0 flex-shrink-0">
                        <div className="flex justify-between items-center mb-1 md:mb-2">
                          <span className="text-[8px] md:text-[10px] uppercase font-display text-sunflower truncate mr-2">{worm.name.split(' ')[0]}</span>
                          <span className="text-[8px] md:text-[10px] text-white/40">S{worm.length}</span>
                        </div>
                        <DraggableWorm
                          worm={worm}
                          imageUrls={IMAGE_MAP[worm.name]}
                        />
                      </div>
                    ))
                  )}
                </div>
              </WormDock>
            </div>
          </div>
          
          <div className="mt-4 md:mt-6 p-3 md:p-4 border-2 border-dashed border-white/10 rounded-2xl hidden md:block">
            <h4 className="text-xs font-display text-white/30 uppercase mb-2">Tactical Note:</h4>
            <p className="text-[11px] text-white/40 leading-relaxed">
              Drag worms onto the garden grid. Click a placed worm to rotate it.
            </p>
          </div>
        </div>

        {/* Center: The Garden Board */}
        <div className="flex flex-col items-center order-1 xl:order-2">
          <div className="relative p-4 md:p-8 bg-meadow/5 rounded-[24px] md:rounded-[40px] border-4 border-meadow/20 shadow-2xl backdrop-blur-sm">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-meadow text-underground px-4 py-1.5 md:px-6 md:py-2 rounded-full font-display text-sm md:text-xl shadow-[0_4px_0_0_#A0522D] whitespace-nowrap">
              YOUR GARDEN PLOT
            </div>
            
            <div className="relative">
              <Board
                boardData={playerBoard}
                colorMap={COLOR_MAP}
                isPlayerBoard={true}
              >
                {placedWorms.map((worm) => (
                  <DraggableWorm
                    key={worm.id}
                    worm={worm}
                    placement={placements[worm.id]}
                    imageUrls={IMAGE_MAP[worm.name]}
                  />
                ))}
              </Board>
            </div>
          </div>
          
          {/* Action Button */}
          <div className="h-20 md:h-24 mt-4 md:mt-8 flex items-center justify-center">
            {allWormsPlaced ? (
              <button
                onClick={confirmPlacements}
                className="garden-btn scale-100 md:scale-110 animate-pulse hover:animate-none hover:scale-125 group px-8 py-3 md:px-10 md:py-4 text-lg md:text-2xl"
              >
                DEPLOY ⚔️
              </button>
            ) : (
              <div className="text-white/20 font-display text-[10px] md:text-sm tracking-widest animate-pulse">
                WAITING FOR COMPLETE DEPLOYMENT...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
