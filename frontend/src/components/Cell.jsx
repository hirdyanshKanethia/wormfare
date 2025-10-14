import React from "react";
import { useDrop } from "react-dnd";
import { useGameStore } from "../store/gameStore";

export default function Cell({ color, x, y, isPlayerBoard }) {
  const { placeWorm, moveWorm } = useGameStore();

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

  // Provide visual feedback when a worm is hovering over a valid cell.
  const getBackgroundColor = () => {
    if (isOver && canDrop) return "bg-green-600";
    return color;
  };

  return (
    <div
      ref={drop}
      className={`w-[var(--cell-size)] h-[var(--cell-size)] md:w-[var(--cell-size-md)] md:h-[var(--cell-size-md)] border border-gray-600 ${getBackgroundColor()}`}
    />
  );
}
