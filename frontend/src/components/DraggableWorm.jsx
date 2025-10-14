import React from "react";
import { useDrag } from "react-dnd";
import { useGameStore } from "../store/gameStore";

// const CELL_SIZE_PX = 48;

export default function DraggableWorm({ worm, placement, imageUrls }) {
  if (!worm) return null;

  const rotateWorm = useGameStore((state) => state.rotateWorm);
  const cellSize = useGameStore((state) => state.cellSize);

  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: "worm",
      item: { ...worm, placement },
    }),
    [worm, placement]
  );

  const handleWormClick = (e) => {
    e.stopPropagation();
    if (placement) {
      rotateWorm(worm.id);
    }
  };

  const isPlaced = !!placement;
  const orientation = isPlaced ? placement.orientation : "vertical";
  const isHorizontal = orientation === "horizontal";

  // This container's style handles the final position and dimensions on the grid.
  const containerStyle = {
    position: isPlaced ? "absolute" : "relative",
    top: isPlaced ? `${placement.y * cellSize}px` : undefined,
    left: isPlaced ? `${placement.x * cellSize}px` : undefined,
    width: isHorizontal
      ? `${worm.length * cellSize}px`
      : `${cellSize}px`,
    height: isHorizontal
      ? `${cellSize}px`
      : `${worm.length * cellSize}px`,
    zIndex: 10,
  };

  const imageUrl = isHorizontal ? imageUrls.horizontal : imageUrls.vertical;

  return (
    <div
      ref={drag}
      style={containerStyle}
      onClick={handleWormClick}
      className={`cursor-move ${isDragging ? "opacity-50" : ""}`}
    >
      <img
        src={imageUrl}
        alt={worm.name}
        // **THE FIX**: All complex transform classes are GONE.
        className="w-full h-full object-cover rounded-md"
      />
    </div>
  );
}
