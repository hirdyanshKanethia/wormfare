package ws

import (
	"encoding/json"
	"log"
	"math"
	"math/rand"
	"sync"
	"time"

	"backend/game"
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
	sync.RWMutex // Used to manage read and write locks for concurrency without errors
	clients      map[*Client]bool
	games        map[*game.Game]bool // A set of active games
	waitlist     []*Client
	register     chan *Client // input channel for register signal
	unregister   chan *Client // input channel for unregister signal
	route        chan *Event  // channel for incoming events
}

// NewManager creates and starts a new manager.
func NewManager() *Manager {
	m := &Manager{
		clients:    make(map[*Client]bool),
		games:      make(map[*game.Game]bool),
		waitlist:   make([]*Client, 0),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		route:      make(chan *Event),
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

	// Testing specific values
	client.Elo = 1200 + rand.Intn(200) - 100
	client.JoinedWaitlistAt = time.Now()
	m.waitlist = append(m.waitlist, client)

	log.Printf("[WS] Client connected and added to waitlist. Wailist size: %d", len(m.waitlist))

	waitEvent := map[string]any{
		"type":    "game.wait",
		"payload": map[string]any{"elo": client.Elo},
	}
	payload, _ := json.Marshal(waitEvent)
	client.egress <- payload
}

// unregisterClient -> handles disconnections, including win/loss declarations.
func (m *Manager) unregisterClient(client *Client) {
	m.Lock()
	defer m.Unlock()

	if _, ok := m.clients[client]; !ok {
		return
	}
	delete(m.clients, client)

	if game := client.game; game != nil {
		log.Printf("Client from game %s disconnected. Declaring win/loss.", game.ID)
		for opponent := range m.clients {
			if opponent.game == game && opponent != client {
				// Opponent win
				opponent.Elo += eloChangeOnWinLoss
				winEvent := map[string]any{"type": "game.win", "payload": map[string]any{"reason": "Opponent disconnected.", "newElo": opponent.Elo}}
				payload, _ := json.Marshal(winEvent)
				opponent.egress <- payload
				// log.Printf("Player (Elo %d) wins. New ELO: %d", opponent.Elo-eloChangeOnWinLoss, opponent.Elo)
				break
			}
		}

		// Disconnected player loss
		client.Elo -= eloChangeOnWinLoss
		// log.Printf("Player (Elo %d) loses. New ELO: %d", client.Elo+eloChangeOnWinLoss, client.Elo)
		delete(m.games, game)
	}

	for i, waitingClient := range m.waitlist {
		if waitingClient == client {
			m.waitlist = append(m.waitlist[:i], m.waitlist[i+1:]...)
			// log.Printf("Client removed from waitlist. Waitlist size: %d", len(m.waitlist))
			break
		}
	}
}

// findMatches -> matchmaking logic
func (m *Manager) findMatches() {
	m.Lock()
	defer m.Unlock()

	if len(m.waitlist) < 2 {
		return
	}

	log.Println("Running matchmaking...")
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

	log.Printf("Pairing players (ELO %d vs %d) in game %s", player1.Elo, player2.Elo, newGame.ID)

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

func (m *Manager) endGame(game *game.Game, result string, message string) {
	log.Printf("[ERROR] Ending game %s. Reason: %s", game.ID, result)
	
	gameOverEvent := map[string]any {
		"type": "game_over",
		"payload": message,
	}
	payload, _ := json.Marshal(gameOverEvent)

	for _, player := range game.Players {
		if player != nil {
			player.Send(payload)
		}
	}

	delete(m.games, game)
	return
}
