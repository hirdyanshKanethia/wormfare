package game

import (
	"math/rand"
	"strconv"
)

type GameState string

const (
	StatePlacingWorms GameState = "placing_worms"
	StatePlayer1Turn  GameState = "player_1_turn"
	StatePlayer2Turn  GameState = "player_2_turn"
	StateGameOver     GameState = "game_over"
)

type Player interface {
	Send([]byte)
	Disconnect()
}

type PlayerState struct {
	Board *Board
	Army  []*Worm
	Ready bool
}

type Game struct {
	ID            string
	State         GameState
	PlayersStates [2]*PlayerState
	Players       [2]Player
	Winner        int // 0 for Player 1, 1 for Player 2, -1 for no winner yet
}

func NewGame() *Game {
	return &Game{
		ID:    strconv.Itoa(rand.Intn(10000)),
		State: StatePlacingWorms,
		PlayersStates: [2]*PlayerState{
			{Board: &Board{}, Army: NewArmy()}, // Player 1
			{Board: &Board{}, Army: NewArmy()}, // Player 2
		},
		Winner: -1,
	}
}
