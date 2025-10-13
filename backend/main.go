package main

import (
	"backend/ws"

	"github.com/gin-gonic/gin"
)

func main() {
	// Create our WebSocket manager
	manager := ws.NewManager()

	// Create a default Gin router
	router := gin.Default()

	// Trust only local requests in development
	router.SetTrustedProxies([]string{"127.0.0.1"})

	// Define the WebSocket route
	router.GET("/ws", func(c *gin.Context) {
		ws.ServeWs(manager, c)
	})

	// Start the server
	router.Run(":8080")
}
