package game

// Constants for the game board dimensions.
const (
	BoardWidth  = 8
	BoardHeight = 8
)

type CellState int

const (
	CellStateEmpty    CellState = iota // 0
	CellStateWorm                      // 1
	CellStateHit                       // 2
	CellStateMiss                      // 3
	CellStateMartyred                  // 4
)

type Board [BoardHeight][BoardWidth]CellState
