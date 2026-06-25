import React from "react";
import { useGameStore } from "../store/gameStore";
import Board from "./Board";
import DraggableWorm from "./DraggableWorm";
import CoachWorm from "./CoachWorm";

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
  1: "bg-white/20 backdrop-blur-sm", // Miss
  2: "bg-red-500/40 animate-pulse", // Hit
  3: "bg-underground/80 grayscale contrast-50", // Sunk
};

export default function BattleUI() {
  const {
    playerBoard,
    opponentBoard,
    placements,
    army,
    playerID,
    activeTurn,
    turnCount,
  } = useGameStore();

  const isMyTurn = playerID === activeTurn;

  return (
    <div className="flex flex-col items-center w-full max-w-7xl mx-auto py-2 md:py-4 px-2 md:px-4 overflow-x-hidden">
      {/* Turn Banner */}
      <div className="w-full flex justify-center mb-6 md:mb-8 relative">
        <div className={`
          px-8 md:px-12 py-3 md:py-4 rounded-full border-4 font-display text-xl md:text-4xl tracking-[0.1em] shadow-2xl transition-all duration-500
          ${isMyTurn 
            ? "bg-meadow border-sunflower text-underground scale-105 md:scale-110 shadow-meadow/20" 
            : "bg-clay/40 border-clay text-white/50 grayscale shadow-black/40"}
        `}>
          {isMyTurn ? "UNLEASH THE MUD! 🔥" : "OPPONENT DIGGING... 🌪️"}
        </div>

        {isMyTurn && (
          <div className="absolute inset-0 bg-meadow/10 blur-[60px] -z-10 animate-pulse" />
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8 md:gap-12 xl:gap-24 items-center lg:items-start justify-center w-full"
           style={{ 
             "--cell-size": "min(10vw, 36px)", 
             "--cell-size-md": "48px" 
           }}>

        
        {/* Opponent's Garden (The Primary Target) */}
        <div className={`flex flex-col items-center transition-all duration-700 ${isMyTurn ? "opacity-100" : "opacity-40"}`}>
          <div className="mb-2 md:mb-4 flex items-center gap-2 md:gap-3">
             <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center text-lg md:text-xl shadow-[0_4px_0_0_#450a0a] transition-colors ${isMyTurn ? "bg-red-600" : "bg-gray-700"}`}>🎯</div>
             <h2 className={`text-xl md:text-2xl font-display uppercase tracking-widest transition-colors ${isMyTurn ? "text-white" : "text-white/20"}`}>Enemy Soil</h2>
          </div>
          
          <div className={`
            p-3 md:p-6 rounded-[24px] md:rounded-[32px] border-4 transition-all duration-500 relative
            ${isMyTurn 
              ? "bg-white/5 border-sunflower shadow-[0_0_30px_rgba(255,196,54,0.2)]" 
              : "bg-black/20 border-white/10 shadow-none"}
          `}>
            {/* Turn Indicator Glow for Board */}
            {isMyTurn && (
              <div className="absolute -inset-1 md:-inset-2 border-2 border-sunflower/30 rounded-[28px] md:rounded-[36px] animate-pulse pointer-events-none" />
            )}
            
            <Board
              boardData={opponentBoard}
              colorMap={COLOR_MAP}
              isInteractive={isMyTurn}
            />
          </div>
        </div>

        {/* Vertical Divider for Desktop */}
        <div className="hidden lg:block w-px h-[400px] bg-gradient-to-b from-transparent via-white/10 to-transparent mt-16" />

        {/* Player's Garden (The Home Base) */}
        <div className={`flex flex-col items-center transition-all duration-700 ${!isMyTurn ? "opacity-100" : "opacity-60"}`}>
          <div className="mb-2 md:mb-4 flex items-center gap-2 md:gap-3">
             <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center text-lg md:text-xl shadow-[0_4px_0_0_#365314] transition-colors ${!isMyTurn ? "bg-meadow" : "bg-gray-700"}`}>🛡️</div>
             <h2 className={`text-xl md:text-2xl font-display uppercase tracking-widest text-center transition-colors ${!isMyTurn ? "text-meadow" : "text-white/20"}`}>Home Turf</h2>
          </div>

          <div className={`
            relative p-3 md:p-6 bg-meadow/5 rounded-[24px] md:rounded-[32px] border-4 transition-all duration-500
            ${!isMyTurn 
              ? "border-meadow shadow-[0_0_30px_rgba(116,183,46,0.15)]" 
              : "border-meadow/20 shadow-none"}
          `}>
            <Board
              boardData={playerBoard}
              colorMap={COLOR_MAP}
              isPlayerBoard={true}
              isInteractive={false}
            >
              {Object.values(placements).map((p) => {
                const worm = army.find((w) => w.id === p.wormId);
                let isSunk = false;
                if (worm) {
                  isSunk = true;
                  for (let i = 0; i < worm.length; i++) {
                    const cx = p.orientation === "horizontal" ? p.x + i : p.x;
                    const cy = p.orientation === "vertical" ? p.y + i : p.y;
                    if (playerBoard[cy]?.[cx] !== 3) {
                      isSunk = false;
                      break;
                    }
                  }
                }
                
                return worm ? (
                  <DraggableWorm
                    key={p.wormId}
                    worm={worm}
                    placement={{...p, isSunk}}
                    imageUrls={IMAGE_MAP[worm.name]}
                    isDraggable={false}
                  />
                ) : null;
              })}
            </Board>
          </div>
          <div className="mt-4 text-xs font-display text-meadow/40 uppercase tracking-widest">Status: {!isMyTurn ? "Under Fire" : "Safe"}</div>
        </div>
      </div>

      {/* Battle Log Placeholder / Combat Intel */}
      <div className="mt-12 w-full max-w-2xl bg-underground/60 border-2 border-white/5 rounded-3xl p-4 backdrop-blur-sm mb-20 md:mb-0">
        <div className="flex gap-4 items-center">
          <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
            <div className={`h-full transition-all duration-1000 ${isMyTurn ? "bg-sunflower w-full" : "bg-white/10 w-0"}`} />
          </div>
          <span className="text-[10px] font-display text-white/40 uppercase">Combat Intel: {isMyTurn ? "Manual Control" : "Auto-Radar Active"}</span>
        </div>
      </div>
      
      {turnCount <= 4 && (
        <CoachWorm message={isMyTurn ? "Your turn, Commander! Target their soil!" : "Take cover! Enemy is returning fire!"} />
      )}
    </div>
  );
}
