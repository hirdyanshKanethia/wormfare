// src/components/Board.jsx
import React, { useRef, useLayoutEffect } from "react";
import Cell from "./Cell";
import { useGameStore } from "../store/gameStore"; // Import the store

export default function Board({ boardData, colorMap, isPlayerBoard, isInteractive }) {
  const ref = useRef(null);
  const setCellSize = useGameStore((state) => state.setCellSize);

  // This effect runs after the component has rendered to the screen.
  useLayoutEffect(() => {
    const measure = () => {
      if (ref.current) {
        // Get the total width of the rendered board and divide by 8.
        const boardWidth = ref.current.getBoundingClientRect().width;
        const cellSize = boardWidth / 8;
        setCellSize(cellSize);
      }
    };

    measure(); // Measure on initial render
    window.addEventListener("resize", measure); // Re-measure if the window size changes

    return () => window.removeEventListener("resize", measure);
  }, [setCellSize]);

  if (!boardData) {
    return <div className="w-80 h-80 md:w-96 md:h-96" />;
  }

  return (
    // Attach the ref to the main container div
    <div
      ref={ref}
      className="w-80 h-80 md:w-96 md:h-96 grid grid-cols-8 grid-rows-8 border-4 border-yellow-800 bg-green-900"
    >
      {boardData.map((row, y) =>
        row.map((cellState, x) => (
          <Cell
            key={`${x}-${y}`}
            x={x}
            y={y}
            cellState={cellState}
            color={colorMap[cellState] || "bg-transparent"}
            isPlayerBoard={isPlayerBoard}
            isInteractive={isInteractive}
          />
        ))
      )}
    </div>
  );
}
