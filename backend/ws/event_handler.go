package ws

import (
	"backend/game"
	"encoding/json"
	"log"
)

type WormPlacement struct {
	WormType    string `json:"wormtype"`
	X           int    `json:"x"`
	Y           int    `json:"y"`
	Orientation string `json:"orientation"`
}

func (m *Manager) handleEvent(event *Event) {
	if event.Client.game == nil {
		log.Println("Received event from client not in a game")
		return
	}

	log.Printf("Handling event '%s' for game '%s'", event.Type, event.Client.game.ID)

	switch event.Type {
	case "game.place_worms":
		m.handleWormPlacement(event)

	case "fire_shot":
		m.handleFireShot(event)

	default:
		log.Printf("Unknown event type received: %s", event.Type)
	}
}

func (m *Manager) handleWormPlacement(event *Event) {
	valid := m.checkValidWormPlacement(event)

	if !valid {
		// Invalid Placement -> End match in a draw
		log.Printf("Invalid Placement recieved from %v. Ending game %s in a draw", event.Client.game.PlayersStates[event.Client.playerID], event.Client.game.ID)

		m.endGame(event.Client.game, "draw", "The game has ended in a draw due to an unexpected error")
	}

	client := event.Client
	playerState := client.game.PlayersStates[client.playerID]
	playerState.Ready = true

	log.Printf("Player %d in game %s has placed their worms.", client.playerID, client.game.ID)

	confirmEvent := map[string]any{"type": "game.placement_success"}
	payload, _ := json.Marshal(confirmEvent)
	client.egress <- payload

	opponentID := (client.playerID + 1) % 2
	opponentState := client.game.PlayersStates[opponentID]

	if opponentState.Ready {
		log.Printf("Both players in game %s are ready. Starting battle.", client.game.ID)
		client.game.State = game.StatePlayer2Turn

		startEvent := map[string]any{
			"type":    "game.battle_start",
			"payload": map[string]any{"turn": 0},
		}
		startPayload, _ := json.Marshal(startEvent)

		for _, player := range client.game.Players {
			player.Send(startPayload)
		}
	}
}

func (m *Manager) checkValidWormPlacement(event *Event) bool {
	// client := event.Client
	playerState := event.Client.game.PlayersStates[event.Client.playerID]
	board := playerState.Board
	var placements []WormPlacement

	if err := json.Unmarshal(event.Payload, &placements); err != nil {
		log.Printf("[ERROR] %v", err)
		return false
	}

	// Name to object map for worms
	armyMap := make(map[string]*game.Worm)
	for _, worm := range playerState.Army {
		armyMap[worm.Name] = worm
	}

	if len(placements) != 5 {
		log.Printf("[ERROR] Invalid placement due to invalid number of worms communicated!")
		return false
	}

	for _, p := range placements {
		if p.Orientation == "horizontal" && (p.X+armyMap[p.WormType].Length < game.BoardWidth) && p.X >= 0 && 0 <= p.Y && p.Y < game.BoardHeight {
			for i := 0; i < armyMap[p.WormType].Length; i++ {
				if board[p.Y][p.X+i] == 1 {
					log.Printf("[ERROR] Invlid placement due to worm overlapping")
					return false
				}
				board[p.Y][p.X+i] = 1
			}
		} else if p.Orientation == "vertical" && (p.Y+armyMap[p.WormType].Length < game.BoardHeight) && p.Y >= 0 && 0 <= p.X && p.X < game.BoardWidth {
			for i := 0; i < armyMap[p.WormType].Length; i++ {
				if board[p.Y+i][p.X] == 1 {
					log.Printf("[ERROR] Invalid placement due to worm overlapping")
					return false
				}
				board[p.Y+i][p.X] = 1
			}
		}
	}

	return true
}

func (m *Manager) handleFireShot(event *Event) {

}
