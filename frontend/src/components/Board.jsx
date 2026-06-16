import React, { useRef, useLayoutEffect } from "react";
import Cell from "./Cell";
import { useGameStore } from "../store/gameStore";

export default function Board({ boardData, colorMap, isPlayerBoard, isInteractive, children }) {
  const ref = useRef(null);
  const setCellSize = useGameStore((state) => state.setCellSize);

  useLayoutEffect(() => {
    const measure = () => {
      if (ref.current) {
        // We need the width of the internal content area (excluding borders)
        const style = window.getComputedStyle(ref.current);
        const borderLeft = parseFloat(style.borderLeftWidth) || 0;
        const borderRight = parseFloat(style.borderRightWidth) || 0;
        const totalWidth = ref.current.getBoundingClientRect().width;
        
        const contentWidth = totalWidth - borderLeft - borderRight;
        const cellSize = contentWidth / 8;
        
        setCellSize(cellSize);
      }
    };

    measure();
    // Use a ResizeObserver for more reliable measurement than window resize
    const observer = new ResizeObserver(measure);
    if (ref.current) observer.observe(ref.current);

    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("resize", measure);
      observer.disconnect();
    };
  }, [setCellSize]);

  const sizeClass = "w-[calc(var(--cell-size)*8+8px)] h-[calc(var(--cell-size)*8+8px)] md:w-[calc(var(--cell-size-md)*8+8px)] md:h-[calc(var(--cell-size-md)*8+8px)]";

  return (
    <div
      ref={ref}
      className={`${sizeClass} grid grid-cols-8 grid-rows-8 border-4 border-clay bg-underground/50 overflow-visible shadow-inner relative`}
    >
      {/* Decorative Grid Texture */}
      <div className="absolute inset-0 pointer-events-none opacity-5 mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')] z-0" />
      
      {boardData && boardData.map((row, y) =>
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
      
      {/* Render worms as absolute children of the grid container */}
      {children}
    </div>
  );
}
