package ws

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"time"

	"backend/auth"
	"backend/game"
)

type WormPlacement struct {
	WormType    string `json:"wormtype"`
	X           int    `json:"x"`
	Y           int    `json:"y"`
	Orientation string `json:"orientation"`
}

// ---------- MAIN HANLDER ----------

func (m *Manager) handleEvent(event *Event) {
	// defer function to prevent panic shutdown
	defer func() {
		if r := recover(); r != nil {
			log.Printf("CRITICAL: Recovered from panic in handleEvent: %v", r)
			// If the client who caused the panic was in a game, end it safely.
			if event.Client.game != nil {
				log.Printf("Ending game %s due to panic.", event.Client.game.ID)
				m.endGame(event.Client.game, ReasonDraw, nil)
			}
		}
	}()

	client := event.Client

	// --- Authentication Check ---
	if !client.IsAuthenticated() {
		m.handleAuthentication(event)
		return
	}

	// --- Authenticated Logic ---
	if client.game == nil {
		log.Printf("Received event '%s' from authenticated client not in a game.", event.Type)
		return
	}

	log.Printf("Handling event '%s' for game '%s'", event.Type, client.game.ID)

	switch event.Type {
	case "game.place_worms":
		m.handleWormPlacement(event)

	case "game.fire_shot":
		m.handleFireShot(event)

	default:
		log.Printf("[ERROR] Unknown event type received: %s", event.Type)
	}
}

// ---------- HELPER FUNCTIONS ----------

func (m *Manager) handleWormPlacement(event *Event) {
	valid := m.doValidWormPlacement(event)

	if !valid {
		// Invalid Placement -> End match in a draw
		log.Printf("[ERROR] Invalid Placement received from %v. Ending game %s in a draw", event.Client.playerID, event.Client.game.ID)

		m.endGame(event.Client.game, ReasonDraw, nil)
		return
	}

	client := event.Client
	playerState := client.game.PlayersStates[client.playerID]
	playerState.Ready = true

	log.Printf("[GAME] Player %d in game %s has placed their worms.", client.playerID, client.game.ID)

	confirmEvent := map[string]any{"type": "game.placement_success"}
	payload, _ := json.Marshal(confirmEvent)
	client.egress <- payload

	opponentID := (client.playerID + 1) % 2
	opponentState := client.game.PlayersStates[opponentID]

	if opponentState.Ready {
		log.Printf("[GAME] Both players in game %s are ready. Starting battle.", client.game.ID)
		client.game.State = game.StatePlayer2Turn

		game.PrintBoard(playerState.Board, fmt.Sprintf("Player %d board", client.playerID))
		game.PrintBoard(opponentState.Board, fmt.Sprintf("Player %d board", opponentID))

		startEvent := map[string]any{
			"type":    "game.battle_start",
			"payload": map[string]any{"turn": 1},
		}
		startPayload, _ := json.Marshal(startEvent)

		for _, player := range client.game.Players {
			player.Send(startPayload)
		}
	}
}

func (m *Manager) doValidWormPlacement(event *Event) bool {
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
		if p.Orientation == "horizontal" && (p.X+armyMap[p.WormType].Length <= game.BoardWidth) && p.X >= 0 && 0 <= p.Y && p.Y <= game.BoardHeight {
			for i := 0; i < armyMap[p.WormType].Length; i++ {
				id := armyMap[p.WormType].ID
				if board[p.Y][p.X+i] < 0 {
					log.Printf("[ERROR] Invalid placement due to worm overlapping")
					return false
				}
				board[p.Y][p.X+i] = game.CellState(id)
				armyMap[p.WormType].Positions = append(armyMap[p.WormType].Positions, game.Coordinate{X: p.X + i, Y: p.Y})
				// log.Printf("Positions for current worm %s: %+v", p.WormType, armyMap[p.WormType].Positions)
			}
		} else if p.Orientation == "vertical" && (p.Y+armyMap[p.WormType].Length <= game.BoardHeight) && p.Y >= 0 && 0 <= p.X && p.X <= game.BoardWidth {
			for i := 0; i < armyMap[p.WormType].Length; i++ {
				id := armyMap[p.WormType].ID
				if board[p.Y+i][p.X] < 0 {
					log.Printf("[ERROR] Invalid placement due to worm overlapping")
					return false
				}
				board[p.Y+i][p.X] = game.CellState(id)
				armyMap[p.WormType].Positions = append(armyMap[p.WormType].Positions, game.Coordinate{X: p.X, Y: p.Y + i})
				// log.Printf("Positions for current worm %s: %+v", p.WormType, armyMap[p.WormType].Positions)
			}
		} else {
			log.Printf("[ERROR] Invalid placement received from player %v", event.Client.playerID)
			return false
		}
	}

	return true
}

func (m *Manager) handleFireShot(event *Event) {
	client := event.Client
	// valid game state for fire_shot check
	if state := client.game.State; state != game.StatePlayer1Turn && state != game.StatePlayer2Turn {
		log.Printf("[ERROR] '%v' received at invalid state %v", state, event.Type)
		m.endGame(event.Client.game, ReasonDraw, nil)
		return
	}

	// check for player turn is valid
	if (client.game.State == game.StatePlayer1Turn && client.playerID != 0) || (client.game.State == game.StatePlayer2Turn && client.playerID != 1) {
		log.Printf("[ERROR] Invalid player sent the '%v' event. Game ending in a draw.", event.Type)
		m.endGame(event.Client.game, ReasonDraw, nil)
		return
	}

	// variable and object declarations
	var cellShot game.Coordinate
	opponentID := (event.Client.playerID + 1) % 2
	opponentState := event.Client.game.PlayersStates[opponentID]
	board := opponentState.Board

	if err := json.Unmarshal(event.Payload, &cellShot); err != nil {
		log.Printf("[ERROR] %v", err)
		m.endGame(event.Client.game, ReasonDraw, nil)
		return
	}

	resultPayload := map[string]any{
		"actingPlayer": client.playerID,
		"x":            cellShot.X,
		"y":            cellShot.Y,
	}

	// check for out of bounds coordinates of cell
	if cellShot.X < 0 || cellShot.Y < 0 || cellShot.X > 7 || cellShot.Y > 7 {
		log.Printf("[ERROR] Invalid cell coordinates received for '%v'. X: %d, Y: %d", event.Type, cellShot.X, cellShot.Y)
		m.endGame(event.Client.game, ReasonDraw, nil)
		return
	}

	if board[cellShot.Y][cellShot.X] > 0 {
		log.Printf("[ERROR] Invalid cell coordinates received for '%v' from '%v'", event.Type, client.playerID)
		m.endGame(event.Client.game, ReasonDraw, nil)
		return
	}

	armyIDMap := make(map[int]*game.Worm)
	for _, worm := range opponentState.Army {
		armyIDMap[worm.ID] = worm
	}

	if board[cellShot.Y][cellShot.X] == 0 {
		board[cellShot.Y][cellShot.X] = game.CellStateMiss
		resultPayload["result"] = "miss"
		log.Printf("[Game] Shot miss!")
	} else if board[cellShot.Y][cellShot.X] < 0 {
		worm := armyIDMap[int(board[cellShot.Y][cellShot.X])]
		board[cellShot.Y][cellShot.X] = game.CellStateHit

		worm.Hits += 1
		// log.Printf("[TEST] Hits: %d, Length: %d", worm.Hits, worm.Length)
		if worm.Hits == worm.Length {
			worm.IsDead = true
			resultPayload["result"] = "killed"
			resultPayload["worm"] = map[string]any{"name": worm.Name, "positions": worm.Positions}
			log.Printf("[GAME] '%s' has fallen!", worm.Name)

			if dead := m.isArmyDead(opponentState.Army); dead {
				log.Printf("[GAME] Player %d has been defeated. Ending the game", opponentID)
				if opponent, ok := event.Client.game.Players[opponentID].(*Client); ok {
					log.Printf("[GAME] Opponent found: Player %d", opponent.playerID)
					m.endGame(event.Client.game, ReasonWinLoss, opponent)
					return
				} else {
					log.Printf("[ERROR] Could not find opponent client. Ending game in a draw")
					m.endGame(client.game, ReasonDraw, nil)
					return
				}
			}
		} else {
			log.Printf("[GAME] Shot hit '%s' !", worm.Name)
			resultPayload["result"] = "hit"
		}
	}

	fireResultMsg, _ := json.Marshal(map[string]any{"type": "game.fire_result", "payload": resultPayload})
	for _, p := range client.game.Players {
		p.Send(fireResultMsg)
	}

	// change game state
	switch client.game.State {
	case game.StatePlayer1Turn:
		client.game.State = game.StatePlayer2Turn
	case game.StatePlayer2Turn:
		client.game.State = game.StatePlayer1Turn
	default:
		log.Printf("[ERROR] Unexpected error occured. Ending game in a draw!")
		m.endGame(client.game, ReasonDraw, nil)
		return
	}

	var turnPlayerID int
	if client.game.State == game.StatePlayer1Turn {
		turnPlayerID = 0
	} else {
		turnPlayerID = 1
	}
	turnUpdateMsg, _ := json.Marshal(map[string]any{"type": "game.turn_update", "payload": map[string]any{"turn": turnPlayerID}})
	for _, p := range client.game.Players {
		p.Send(turnUpdateMsg)
	}

	game.PrintBoard(board, "Board after fire shot")
}

func (m *Manager) isArmyDead(army []*game.Worm) bool {
	for i := range len(army) {
		if !army[i].IsDead {
			return false
		}
	}
	return true
}

// Authentication function to handle the auth event
func (m *Manager) handleAuthentication(event *Event) {
	client := event.Client

	if event.Type == "auth" {
		var authData auth.AuthPayload
		if err := json.Unmarshal(event.Payload, &authData); err != nil {
			log.Printf("[ERROR] Invalid auth payload format from client: %v", err)
			client.Disconnect()
			return
		}

		userData, err := auth.ValidateTokenAndFetchUser(authData.Token, m.db, os.Getenv("SUPABASE_JWT_SECRET"))
		if err != nil {
			log.Printf("[AUTH] Authentication failed for client: %v", err)
			errMsg := map[string]string{"type": "auth_error", "payload": err.Error()}
			payload, _ := json.Marshal(errMsg)
			client.Send(payload)
			time.AfterFunc(100*time.Millisecond, client.Disconnect)
			return
		}

		// --- Authentication Successful ---
		m.Lock() // Lock manager for checks and updates

		_, alreadyConnected := m.activeUsers[userData.UserID]
		if alreadyConnected {
			m.Unlock()
			log.Printf("[WS] Duplicate connection attempt rejected for UserID: %s", userData.UserID)
			errMsg := map[string]string{"type": "auth_error", "payload": "Account already connected"}
			payload, _ := json.Marshal(errMsg)
			client.Send(payload)
			time.AfterFunc(100*time.Millisecond, client.Disconnect)
			return
		}

		client.userID = userData.UserID
		client.elo = userData.Elo
		client.authenticated = true
		m.activeUsers[client.userID] = client

		// Add the fully authenticated client to the waitlist
		client.JoinedWaitlistAt = time.Now()
		m.waitlist = append(m.waitlist, client)

		m.Unlock()

		log.Printf("[WS] Client authenticated and added to waitlist. UserID: %s, ELO: %d. Waitlist size: %d", client.userID, client.elo, len(m.waitlist))

		// Send auth success message
		successMsg := map[string]string{"type": "auth_success", "payload": "Authentication successful"}
		payloadSuccess, _ := json.Marshal(successMsg)
		client.Send(payloadSuccess)

		// Send game.wait message
		waitEvent := map[string]any{"type": "game.wait", "payload": map[string]any{"elo": client.elo}}
		payloadWait, _ := json.Marshal(waitEvent)
		client.Send(payloadWait)

	} else {
		// Received a non-auth message from an unauthenticated client
		log.Printf("[ERROR] Received non-auth message type '%s' from unauthenticated client. Disconnecting.", event.Type)
		errMsg := map[string]string{"type": "auth_error", "payload": "Authentication required"}
		payload, _ := json.Marshal(errMsg)
		client.Send(payload)
		time.AfterFunc(100*time.Millisecond, client.Disconnect)
		// No need to check client.game here, as they aren't authenticated yet
	}
}
