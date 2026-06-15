package ws

import (
	"context"
	"encoding/json"
	"log"
	"math"
	"sync"
	"time"

	"backend/db"
	"backend/game"
)

type EndReason int

const (
	ReasonWinLoss EndReason = iota
	ReasonDraw
)

// Matchmaking constants
const (
	matchmakingInterval     = 5 * time.Second
	initialEloGap           = 50
	eloGapIncreasePerSecond = 10
	eloChangeOnWinLoss      = 15
)

// Manager is the central hub that manages all clients and game sessions.
type Manager struct {
	sync.RWMutex                     // Used to manage read and write locks for concurrency without errors
	clients      map[*Client]bool    // Client objects of client
	activeUsers  map[string]*Client  // Active users map to keep track of unique clients connected by their IDs
	games        map[*game.Game]bool // A set of active games
	waitlist     []*Client           // List of clients waiting for matchmaking
	register     chan *Client        // input channel for register signal
	unregister   chan *Client        // input channel for unregister signal
	route        chan *Event         // channel for incoming events
	db           *db.PrismaClient    // Prisma database client
}

// NewManager creates and starts a new manager.
func NewManager(client *db.PrismaClient) *Manager {
	m := &Manager{
		clients:     make(map[*Client]bool),
		activeUsers: make(map[string]*Client),
		games:       make(map[*game.Game]bool),
		waitlist:    make([]*Client, 0),
		register:    make(chan *Client),
		unregister:  make(chan *Client),
		route:       make(chan *Event),
		db:          client,
	}
	go m.run()
	return m
}

// MAIN LOOP
func (m *Manager) run() {
	ticker := time.NewTicker(matchmakingInterval)
	defer ticker.Stop()

	for {
		select {
		case client := <-m.register:
			m.registerClient(client)

		case client := <-m.unregister:
			m.unregisterClient(client)

		case <-ticker.C:
			m.findMatches()

		case event := <-m.route:
			m.handleEvent(event)
		}
	}
}

// registerClient -> add a new client to the waitlist
func (m *Manager) registerClient(client *Client) {
	m.Lock()
	defer m.Unlock()

	m.clients[client] = true
	log.Printf("[WS] Client connected. Waiting for authentication.")
}

// unregisterClient -> handles game cleanup and result for cases like undefined disconnection of client
func (m *Manager) unregisterClient(client *Client) {
	m.Lock()         // Lock for modifying shared maps
	defer m.Unlock() // Ensure unlock happens

	if client.IsAuthenticated() && client.userID != "" {
		delete(m.activeUsers, client.userID)
		log.Printf("[WS] Client removed from active clients list.")
	}

	delete(m.clients, client)

	// Check if the client was on the waitlist
	for i, waitingClient := range m.waitlist {
		if waitingClient == client {
			m.waitlist = append(m.waitlist[:i], m.waitlist[i+1:]...)
			log.Printf("[WS] Client removed from waitlist.")
			return
		}
	}

	// If they weren't on the waitlist, they might have been in a game.
	if gameObj := client.game; gameObj != nil {
		if _, ok := m.games[gameObj]; ok {
			m.endGame(gameObj, ReasonWinLoss, client)
		}
	}
}

// endGame -> Ends the game for cases that end the game cleanly (eg. win/loss)
func (m *Manager) endGame(game *game.Game, reason EndReason, loser *Client) {
	m.Lock()
	defer m.Unlock()

	if _, ok := m.games[game]; !ok {
		return
	}

	var finalMessage map[string]any

	switch reason {
	case ReasonWinLoss:
		var winner *Client
		// Find the winner by finding who isn't the loser
		for _, p := range game.Players {
			if c, ok := p.(*Client); ok && c != loser {
				winner = c
				break
			}
		}

		if winner != nil && loser != nil {
			m.updateElo(winner, loser) // Handle ELO
			finalMessage = createGameOverMessage("win", winner, loser)
		}

	case ReasonDraw:
		finalMessage = createGameOverMessage("draw", nil, nil)
	}

	// --- Final Cleanup ---
	if finalMessage != nil {
		payload, _ := json.Marshal(finalMessage)
		for _, p := range game.Players {
			if p != nil {
				p.Send(payload)
				// time.AfterFunc(100*time.Millisecond, p.Disconnect)

				if c, ok := p.(*Client); ok {
					delete(m.clients, c)
				}
			}
		}
	}

	delete(m.games, game)
	log.Printf("[WS] Game %s and its players have been cleaned up.", game.ID)
}

func createGameOverMessage(result string, winner, loser *Client) map[string]any {
	payload := map[string]any{"result": result}
	if result == "win" && winner != nil && loser != nil {
		payload["winner"] = winner.playerID
		payload["newWinnerElo"] = winner.Elo
		payload["newLoserElo"] = loser.Elo
	}
	return map[string]any{"type": "game_over", "payload": payload}
}

// findMatches -> matchmaking logic
func (m *Manager) findMatches() {
	m.Lock()
	defer m.Unlock()

	if len(m.waitlist) < 2 {
		return
	}

	log.Println("[WS] Running matchmaking...")
	unmatched := make([]*Client, 0, len(m.waitlist))
	matched := make(map[*Client]bool)

	for _, player1 := range m.waitlist {
		if matched[player1] {
			continue
		}

		foundMatch := false
		for _, player2 := range m.waitlist {
			if player1 == player2 || matched[player2] {
				continue
			}

			waitDuration := time.Since(player1.JoinedWaitlistAt).Seconds()
			allowedGap := float64(initialEloGap + int(waitDuration)*eloGapIncreasePerSecond)
			eloDiff := math.Abs(float64(player1.Elo - player2.Elo))

			if eloDiff <= allowedGap {
				m.createGame(player1, player2)
				matched[player1] = true
				matched[player2] = true
				foundMatch = true
				break
			}
		}
		if !foundMatch {
			unmatched = append(unmatched, player1)
		}
	}
	m.waitlist = unmatched
}

// createGame -> start a new game with two clients
func (m *Manager) createGame(player1, player2 *Client) {
	newGame := game.NewGame()
	m.games[newGame] = true

	newGame.Players[0] = player1
	newGame.Players[1] = player2

	player1.game = newGame
	player2.game = newGame
	player1.playerID = 0
	player2.playerID = 1

	log.Printf("[WS] Pairing players (ELO %d vs %d) in game %s", player1.Elo, player2.Elo, newGame.ID)

	gameStartEvent := map[string]any{
		"type": "game.start",
		"payload": map[string]any{
			"gameID":      newGame.ID,
			"opponentElo": player2.Elo,
			"playerID":    0,
		},
	}
	p1Payload, _ := json.Marshal(gameStartEvent)

	gameStartEvent["payload"].(map[string]any)["opponentElo"] = player1.Elo
	gameStartEvent["payload"].(map[string]any)["playerID"] = 1
	p2Payload, _ := json.Marshal(gameStartEvent)

	player1.egress <- p1Payload
	player2.egress <- p2Payload
}

// updateElo -> Updates elo in the DB using Prisma
func (m *Manager) updateElo(winner, loser *Client) {
	winnerOldElo := winner.Elo
	loserOldElo := loser.Elo

	winner.Elo += eloChangeOnWinLoss
	loser.Elo -= eloChangeOnWinLoss

	// Update in Database asynchronously to not block the manager
	go func() {
		ctx := context.Background()
		_, err := m.db.Profile.FindUnique(
			db.Profile.ID.Equals(winner.userID),
		).Update(
			db.Profile.Elo.Set(winner.Elo),
		).Exec(ctx)
		if err != nil {
			log.Printf("[ERROR] Failed to update winner ELO: %v", err)
		}

		_, err = m.db.Profile.FindUnique(
			db.Profile.ID.Equals(loser.userID),
		).Update(
			db.Profile.Elo.Set(loser.Elo),
		).Exec(ctx)
		if err != nil {
			log.Printf("[ERROR] Failed to update loser ELO: %v", err)
		}
	}()

	log.Printf("[WS] ELO Change: Winner %d -> %d | Loser %d -> %d", winnerOldElo, winner.Elo, loserOldElo, loser.Elo)
}
