import React from "react";
import { useDrop } from "react-dnd";
import { useGameStore } from "../store/gameStore";

export default function WormDock({ children }) {
  const unplaceWorm = useGameStore((state) => state.unplaceWorm);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: "worm",
    drop: (item) => {
      // If the worm was already on the board, un-place it.
      if (item.placement) {
        unplaceWorm(item.id);
      }
    },
    collect: (monitor) => ({ isOver: monitor.isOver() }),
  }));

  return (
    <div
      ref={drop}
      className={`w-full md:max-w-md p-4 rounded-lg ${
        isOver ? "bg-green-700" : "bg-yellow-950"
      } border-4 border-yellow-800`}
    >
      <h3 className="text-xl font-bold text-center mb-4">Your Army</h3>
      <div className="flex flex-row flex-wrap gap-4 justify-center items-end">
        {children}
      </div>
    </div>
  );
}
