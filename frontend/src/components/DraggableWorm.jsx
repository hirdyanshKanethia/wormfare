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
    transition: isDragging ? "none" : "top 0.2s, left 0.2s, width 0.2s, height 0.2s",
  };

  const imageUrl = isHorizontal ? imageUrls.horizontal : imageUrls.vertical;

  return (
    <div
      ref={isDraggable ? drag : null}
      style={containerStyle}
      onClick={handleWormClick}
      className={`
        group
        ${isDraggable ? "cursor-grab active:cursor-grabbing" : "cursor-default"} 
        ${isDragging ? "opacity-30 scale-95" : "opacity-100"}
      `}
    >
      <div className={`
        relative w-full h-full rounded-full transition-all duration-300
        ${isPlaced ? "hover:ring-2 hover:ring-sunflower/50" : ""}
      `}>
        <img
          src={imageUrl}
          alt={worm.name}
          draggable="false"
          className={`
            w-full h-full object-contain pointer-events-none drop-shadow-[0_0_8px_rgba(255,75,145,0.4)]
            ${!isPlaced ? "group-hover:scale-105 group-hover:drop-shadow-[0_0_15px_rgba(255,75,145,0.8)]" : ""}
          `}
        />
        
        {/* Placement Indicator */}
        {isDraggable && isPlaced && (
          <div className="absolute inset-0 border-2 border-white/0 group-hover:border-white/20 rounded-full transition-colors pointer-events-none" />
        )}
      </div>
    </div>
  );
}
