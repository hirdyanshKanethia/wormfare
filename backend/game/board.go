package game

// Constants for the game board dimensions.
const (
	BoardWidth  = 8
	BoardHeight = 8
)

// Board represents the 8x8 game grid. The integer value can represent
// different states: 0=empty, 1=ship, 2=hit, 3=miss.
type Board [BoardHeight][BoardWidth]int

