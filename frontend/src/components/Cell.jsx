import React from "react";
import { useDrop } from "react-dnd";
import { useGameStore } from "../store/gameStore";

export default function Cell({ color, x, y, isPlayerBoard, isInteractive }) {
  const { placeWorm, moveWorm, fireShot } = useGameStore();

  const [{ isOver, canDrop }, drop] = useDrop(
    () => ({
      accept: "worm",
      // Only allow dropping on the player's own board.
      canDrop: () => isPlayerBoard,
      drop: (item) => {
        // If the worm has placement info, it's being moved.
        // Otherwise, it's a new worm from the dock.
        if (item.placement) {
          moveWorm(item, x, y);
        } else {
          placeWorm(item, x, y);
        }
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }),
    [isPlayerBoard, x, y]
  );

  const handleClick = () => {
    if (isInteractive) {
      fireShot(x, y);
    }
  };

  // Provide visual feedback when a worm is hovering over a valid cell.
  const getBackgroundColor = () => {
    if (isOver && canDrop) return "bg-green-600";
    return color;
  };

  const interactiveStyles = isInteractive
    ? "cursor-pointer hover:bg-red-500/50"
    : "cursor-default";

  return (
    <div
      ref={drop}
      onClick={handleClick}
      className={`w-[var(--cell-size)] h-[var(--cell-size)] md:w-[var(--cell-size-md)] md:h-[var(--cell-size-md)] border border-gray-600 ${getBackgroundColor()} ${interactiveStyles}`}
    />
  );
}
