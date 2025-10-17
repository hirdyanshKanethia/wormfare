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
      canDrop: () => isPlayerBoard && cellState >= 0, // Also prevent dropping on another worm
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

  // **THE FIX IS HERE**: A cell is only truly "firable" if it's interactive AND empty.
  const isFirable = isInteractive && cellState === 0;

  const handleClick = () => {
    // Only allow firing on firable cells.
    if (isFirable) {
      fireShot(x, y);
    }
  };

  const getBackgroundColor = () => {
    if (isOver && canDrop) return "bg-green-600";
    return color;
  };

  // The cursor and hover effects now depend on the new 'isFirable' variable.
  const interactiveStyles = isFirable
    ? "cursor-pointer hover:bg-red-500/50"
    : "cursor-default";

  return (
    <div
      ref={drop}
      onClick={handleClick}
      className={`w-10 h-10 md:w-12 md:h-12 border border-gray-600 ${getBackgroundColor()} ${interactiveStyles}`}
    />
  );
}
