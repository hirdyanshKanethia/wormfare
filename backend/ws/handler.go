// ws/handler.go
package ws

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		// Allow all connections by default.
		// For production, you should implement a proper origin check.
		return true
	},
}

// ServeWs handles websocket requests from the peer.
func ServeWs(manager *Manager, c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Println(err)
		return
	}

	client := &Client{
		conn:    conn,
		manager: manager,
		egress:  make(chan []byte, 256),
	}

	manager.register <- client

	go client.readPump()
	go client.writePump()
}
