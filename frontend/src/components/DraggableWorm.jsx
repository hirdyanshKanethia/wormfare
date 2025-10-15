import React from "react";
import { useDrag } from "react-dnd";
import { useGameStore } from "../store/gameStore";

export default function DraggableWorm({
  worm,
  placement,
  imageUrls,
  isDraggable = true,
}) {
  if (!worm) return null;

  const rotateWorm = useGameStore((state) => state.rotateWorm);
  const cellSize = useGameStore((state) => state.cellSize);

  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: "worm",
      item: { ...worm, placement },
      canDrag: isDraggable,
    }),
    [worm, placement, isDraggable]
  );

  const handleWormClick = (e) => {
    e.stopPropagation();
    if (placement && isDraggable) {
      rotateWorm(worm.id);
    }
  };

  const isPlaced = !!placement;
  const orientation = isPlaced ? placement.orientation : "vertical";
  const isHorizontal = orientation === "horizontal";

  const containerStyle = {
    position: isPlaced ? "absolute" : "relative",
    top: isPlaced ? `${placement.y * cellSize}px` : undefined,
    left: isPlaced ? `${placement.x * cellSize}px` : undefined,
    width: isHorizontal ? `${worm.length * cellSize}px` : `${cellSize}px`,
    height: isHorizontal ? `${cellSize}px` : `${worm.length * cellSize}px`,
    zIndex: 10,
  };

  const imageUrl = isHorizontal ? imageUrls.horizontal : imageUrls.vertical;

  return (
    <div
      ref={isDraggable ? drag : null}
      style={containerStyle}
      onClick={handleWormClick}
      className={`${isDraggable ? "cursor-move" : "cursor-default"} ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <img
        src={imageUrl}
        alt={worm.name}
        draggable="false"
        // This is the final piece that adds the visual rotation back.
        className="w-full h-full object-cover rounded-md"
      />
    </div>
  );
}
