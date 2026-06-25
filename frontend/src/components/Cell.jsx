import React from "react";
import { useDrop } from "react-dnd";
import { useGameStore } from "../store/gameStore";

export default function Cell({
  color,
  x,
  y,
  cellState,
  isPlayerBoard,
  isInteractive,
}) {
  const { placeWorm, moveWorm, fireShot } = useGameStore();

  const [{ isOver, canDrop }, drop] = useDrop(
    () => ({
      accept: "worm",
      canDrop: () => isPlayerBoard && cellState >= 0,
      drop: (item) => {
        if (item.placement) moveWorm(item, x, y);
        else placeWorm(item, x, y);
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }),
    [isPlayerBoard, x, y, cellState]
  );

  const isFirable = isInteractive && cellState === 0;

  const handleClick = () => {
    if (isFirable) {
      fireShot(x, y);
    }
  };

  const getOverlay = () => {
    if (isOver && canDrop) return "bg-sunflower/40 animate-pulse";
    if (isFirable) return "hover:bg-red-500/20";
    return "";
  };

  return (
    <div
      ref={drop}
      onClick={handleClick}
      className={`grid-cell-garden flex items-center justify-center transition-all relative ${isFirable ? "cursor-pointer" : "cursor-default"} ${cellState === 1 || cellState === 2 ? "z-20" : "z-0"}`}
    >
      {/* Base grass color */}
      <div className="absolute inset-0 bg-green-800/60 z-0" />
      
      <div className={`absolute inset-0 z-0 transition-colors ${color}`} />
      <div className={`absolute inset-0 z-10 transition-colors ${getOverlay()}`} />

      {/* Hit / Miss Indicators */}
      {cellState === 1 && (
        <div className="absolute inset-0 flex items-center justify-center text-white/70 text-sm md:text-xl pointer-events-none drop-shadow-md select-none animate-pulse">
          🕳️
        </div>
      )}
      {cellState === 2 && (
        <div className="absolute inset-0 flex items-center justify-center text-red-500 text-lg md:text-3xl pointer-events-none drop-shadow-[0_0_8px_rgba(239,68,68,0.8)] select-none">
          💥
        </div>
      )}
    </div>
  );
}
