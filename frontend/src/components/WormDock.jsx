import React from "react";
import { useDrop } from "react-dnd";
import { useGameStore } from "../store/gameStore";

export default function WormDock({ children }) {
  const unplaceWorm = useGameStore((state) => state.unplaceWorm);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: "worm",
    drop: (item) => {
      if (item.placement) {
        unplaceWorm(item.id);
      }
    },
    collect: (monitor) => ({ isOver: monitor.isOver() }),
  }));

  return (
    <div
      ref={drop}
      className={`w-full p-2 md:p-4 rounded-[20px] md:rounded-[24px] border-4 border-dashed transition-all duration-300 ${
        isOver 
          ? "bg-meadow/20 border-meadow scale-102 md:scale-105" 
          : "bg-black/10 border-white/10"
      }`}
    >
      {children}
    </div>
  );
}
