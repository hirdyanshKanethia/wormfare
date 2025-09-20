package game

import (
	"math/rand"
	"strconv"
)

// Game represents the state of a single game.
// It is completely independent of the WebSocket logic.
type Game struct {
	ID      string
	Boards  [2]*Board // Index 0 for Player 1, Index 1 for Player 2
	Turn    int       // 0 for Player 1, 1 for Player 2
}

// NewGame creates a new Game instance with fresh boards.
func NewGame() *Game {
	// Create a simple random ID for the game
	id := strconv.Itoa(rand.Intn(10000))

	return &Game{
		ID: id,
		Boards: [2]*Board{
			{}, // Player 1's empty board
			{}, // Player 2's empty board
		},
		Turn: 0, // Player 1 starts
	}
}
