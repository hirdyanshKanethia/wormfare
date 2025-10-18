package ws

import (
	"encoding/json"
	"log"
	"sync"
	"time"

	"backend/game"

	"github.com/gorilla/websocket"
)

// Client represents a single player connected to the server.
type Client struct {
	conn             *websocket.Conn
	manager          *Manager
	game             *game.Game
	playerID         int
	egress           chan []byte
	once             sync.Once
	Elo              int       `json:"elo"`
	JoinedWaitlistAt time.Time `json:"-"`
	authenticated    bool
	elo              int
	userID           string
}

func (c *Client) IsAuthenticated() bool {
	return c.authenticated
}

// readPump pumps messages from the WebSocket connection to the manager.
func (c *Client) readPump() {
	defer func() {
		c.manager.unregister <- c
		c.conn.Close()
	}()

	for {
		_, message, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("error: %v", err)
			}
			break
		}

		var event Event
		if err := json.Unmarshal(message, &event); err != nil {
			log.Printf("[ERROR] %v", err)
			continue
		}

		event.Client = c

		c.manager.route <- &event

		// log.Printf("Message received: %s", message)
	}
}

// writePump pumps messages from the egress channel to the WebSocket connection.
func (c *Client) writePump() {
	defer func() {
		c.conn.Close()
	}()

	for {
		message, ok := <-c.egress
		if !ok {
			c.conn.WriteMessage(websocket.CloseMessage, []byte{})
			return
		}
		if err := c.conn.WriteMessage(websocket.TextMessage, message); err != nil {
			log.Println(err)
			return
		}
	}
}

// Helper function to send message to the client simply using the struct parameter
func (c *Client) Send(message []byte) {
	c.egress <- message
}

// Helper function to disconnect a client again using a struct parameter
func (c *Client) Disconnect() {
	c.once.Do(func() {
		close(c.egress)
	})
}
