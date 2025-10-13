package game

import (
	"fmt"
	"log"
	"strings"
)

// Constants for the game board dimensions.
const (
	BoardWidth  = 8
	BoardHeight = 8
)

type CellState int

const (
	CellStateEmpty CellState = iota // 0
	CellStateHit                    // 1
	CellStateMiss                   // 2

	// Numbers below 0 indicate presence of a specific worm. The number will be equal to ID of the worm
	// 	General C. Crawlington = -1
	// 	Major Slitherford = -2
	// 	Captain Coilton = -3
	// 	Sarge Wiggles = -4
	// 	Private Squirmley = -5
)

type Board [BoardHeight][BoardWidth]CellState

// PrintBoard logs a human-readable representation of the game board for debugging.
func PrintBoard(board *Board, title string) {
	var builder strings.Builder

	builder.WriteString(fmt.Sprintf("--- %s ---\n", title))
	builder.WriteString("  0 1 2 3 4 5 6 7\n")

	for y, row := range board {
		builder.WriteString(fmt.Sprintf("%d ", y))
		for _, cell := range row {
			var char string
			switch {
			case cell < 0:
				// It's a worm, print its positive ID
				char = fmt.Sprintf("%d", -cell)
			case cell == CellStateEmpty:
				char = "."
			case cell == CellStateMiss:
				char = "O"
			case cell == CellStateHit:
				char = "X"
			}
			builder.WriteString(fmt.Sprintf("%s ", char))
		}
		builder.WriteString("\n")
	}

	log.Printf("\n%s", builder.String())
}
