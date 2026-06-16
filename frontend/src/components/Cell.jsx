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
      className={`grid-cell-garden flex items-center justify-center transition-all ${isFirable ? "cursor-pointer" : "cursor-default"}`}
    >
      <div className={`absolute inset-0 z-0 ${color}`} />
      <div className={`absolute inset-0 z-10 transition-colors ${getOverlay()}`} />
      
      {/* Decorative Cell markers (small mud patches) */}
      <div className="w-1 h-1 bg-black/10 rounded-full absolute top-1 left-1" />
      <div className="w-0.5 h-0.5 bg-white/5 rounded-full absolute bottom-2 right-2" />
      
      {/* Cell Coordinates (Very subtle) */}
      <span className="text-[6px] text-white/5 absolute bottom-0.5 left-0.5 pointer-events-none select-none">
        {String.fromCharCode(65 + x)}{y + 1}
      </span>
    </div>
  );
}
